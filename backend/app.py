# pyright: reportCallIssue=false, reportArgumentType=false

import os
import random
from datetime import datetime
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from models import (
    db, User, Project, Milestone, Escrow,
    TokenHolding, Transaction, MarketplaceListing,
    ProjectDocument, ProjectUpdate, Reward, TokenLedger
)
from utils import (  # type: ignore[attr-defined]
    create_jwt, get_auth_user, generate_tx_hash, generate_token_id,  # type: ignore[attr-defined]
    check_rate_limit, calculate_risk_score, risk_level_from_score  # type: ignore[attr-defined]
)
from seed import seed_data
from pdf_utils import generate_certificate_pdf

load_dotenv()

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=False,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)

# ── DB ────────────────────────────────────────────────────────────────────────
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///infrabondx.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# ── Upload folder ─────────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db.init_app(app)


# ── INIT DB + SEED ────────────────────────────────────────────────────────────
def init_db_once():
    with app.app_context():
        db.create_all()
        seed_data()


init_db_once()


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def _fmt_project(p):
    return {
        "id": p.id,
        "title": p.title,
        "category": p.category,
        "location": p.location,
        "description": p.description,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "funding_target": p.funding_target,
        "funding_raised": p.funding_raised,
        "token_price": p.token_price,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_level": p.risk_level,
        "risk_score": p.risk_score,
        "status": p.status,
        "issuer_id": p.issuer_id,
    }


def _refresh_project_risk(project):
    """Recalculate and save project risk_score."""
    milestones = Milestone.query.filter_by(project_id=project.id).all()
    issuer = User.query.get(project.issuer_id) if project.issuer_id else None

    # Attach completed project count to issuer for scoring
    if issuer:
        completed = Project.query.filter_by(
            issuer_id=issuer.id, status="COMPLETED"
        ).count()
        issuer._completed_projects = completed
    else:
        if issuer:
            issuer._completed_projects = 0

    score = calculate_risk_score(project, milestones, issuer)
    project.risk_score = score
    project.risk_level = risk_level_from_score(score)


def _add_ledger_entry(tx_hash, tx_type, user_id, project_id,
                       amount, token_count, token_id=None):
    """Append a chained entry to TokenLedger."""
    last = (
        TokenLedger.query
        .filter_by(project_id=project_id)
        .order_by(TokenLedger.id.desc())
        .first()
    )
    prev_hash = last.tx_hash if last else None
    block_index = (last.block_index + 1) if last else 0

    entry = TokenLedger(
        token_id=token_id or generate_token_id(),
        tx_hash=tx_hash,
        prev_hash=prev_hash,
        block_index=block_index,
        user_id=user_id,
        project_id=project_id,
        tx_type=tx_type,
        amount=amount,
        token_count=token_count,
    )
    db.session.add(entry)
    return entry


def _random_india_coordinates():
    """Return demo coordinates within India bounding box."""
    lat = round(random.uniform(8.0, 37.5), 6)
    lng = round(random.uniform(68.0, 97.5), 6)
    return lat, lng


# ═══════════════════════════════════════════════════════════════════════════════
# ROOT / HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/")
def root():
    return jsonify({
        "message": "InfraBondX Backend running ✅",
        "try": ["/api/health", "/api/projects"]
    })


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "app": "InfraBondX Backend"})


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/auth/login")
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_jwt(user.id, user.role)
    return jsonify({
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "wallet_balance": user.wallet_balance,
        }
    })


@app.get("/api/auth/me")
def me():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "wallet_balance": user.wallet_balance,
    })


@app.get("/api/investor/wallet")
def investor_wallet():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "wallet_balance": user.wallet_balance,
    })


@app.post("/api/investor/withdraw")
def investor_withdraw():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "INVESTOR":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    raw_amount = data.get("amount", 0)

    try:
        amount = round(float(raw_amount), 2)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid amount"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404

    current_balance = float(user.wallet_balance or 0)
    if amount > current_balance:
        return jsonify({"error": "Insufficient wallet balance"}), 400

    user.wallet_balance = round(current_balance - amount, 2)

    tx_hash = generate_tx_hash()
    tx = Transaction(
        tx_hash=tx_hash,
        user_id=user.id,
        project_id=None,
        tx_type="WITHDRAW",
        amount=amount,
        token_count=0,
        status="COMPLETED",
        created_at=datetime.utcnow(),
    )
    db.session.add(tx)
    db.session.commit()

    return jsonify({
        "message": "Withdraw successful",
        "tx_hash": tx_hash,
        "updated_balance": user.wallet_balance,
    })


# ═══════════════════════════════════════════════════════════════════════════════
# FILE UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/upload")
def upload_file():
    """
    Generic file upload endpoint.
    Auth optional — just stores the file and returns proof_url.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file key found"}), 400

    f = request.files["file"]
    if not f or f.filename == "":
        return jsonify({"error": "No file selected"}), 400

    filename = secure_filename(f.filename or "")
    if not filename:
        return jsonify({"error": "Invalid filename"}), 400

    unique_id = generate_tx_hash().replace("0x", "")
    unique_name = f"{unique_id}_{filename}"
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_name)
    f.save(save_path)

    return jsonify({
        "message": "uploaded",
        "filename": unique_name,
        "proof_url": f"/uploads/{unique_name}",
        "proof_full_url": f"http://127.0.0.1:5000/uploads/{unique_name}"
    })


@app.get("/uploads/<path:filename>")
def serve_uploaded_file(filename):
    safe_name = secure_filename(filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], safe_name)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    return send_from_directory(app.config["UPLOAD_FOLDER"], safe_name, as_attachment=False)


# ═══════════════════════════════════════════════════════════════════════════════
# PUBLIC PROJECTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/projects")
def list_projects():
    projects = Project.query.filter(Project.status == "ACTIVE").all()
    return jsonify([_fmt_project(p) for p in projects])


@app.get("/api/projects/<int:project_id>")
def project_details(project_id):
    p = Project.query.get_or_404(project_id)
    if p.status == "FROZEN":
        return jsonify({"error": "Project unavailable"}), 403
    return jsonify(_fmt_project(p))


@app.get("/api/projects/<int:project_id>/milestones")
def project_milestones(project_id):
    milestones = (
        Milestone.query
        .filter_by(project_id=project_id)
        .order_by(Milestone.id.asc())
        .all()
    )
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "escrow_release_percent": m.escrow_release_percent,
        "status": m.status,
        "proof_url": m.proof_url,
        "approved_at": m.approved_at.isoformat() if m.approved_at else None,
    } for m in milestones])


@app.get("/api/projects/<int:project_id>/transparency")
def transparency(project_id):
    p = Project.query.get_or_404(project_id)
    escrow = Escrow.query.filter_by(project_id=project_id).first()

    total_locked = float(escrow.total_locked) if escrow else 0.0
    total_released = float(escrow.total_released) if escrow else 0.0

    milestones = Milestone.query.filter_by(project_id=project_id).all()
    pending_ms = [m for m in milestones if m.status == "PENDING"]
    submitted_ms = [m for m in milestones if m.status == "SUBMITTED"]

    next_ms = pending_ms[0] if pending_ms else (submitted_ms[0] if submitted_ms else None)
    next_release = 0.0
    if next_ms:
        next_release = round(
            (next_ms.escrow_release_percent / 100) * float(p.funding_raised or 0), 2
        )

    return jsonify({
        "total_raised": float(p.funding_raised or 0),
        "locked": total_locked,
        "released": total_released,
        "pending_milestones": len(pending_ms),
        "submitted_milestones": len(submitted_ms),
        "completed_milestones": sum(1 for m in milestones if m.status == "COMPLETED"),
        "next_release_amount": next_release,
    })


@app.get("/api/projects/<int:project_id>/token-value")
def dynamic_token_value(project_id):
    """
    Dynamic token value engine.
    token_value = base_price + (completion_pct × roi_factor) + demand_multiplier
    """
    p = Project.query.get_or_404(project_id)
    milestones = Milestone.query.filter_by(project_id=project_id).all()

    total_ms = len(milestones)
    completed_ms = sum(1 for m in milestones if m.status == "COMPLETED")
    completion_pct = (completed_ms / total_ms * 100) if total_ms > 0 else 0

    # Number of unique investors (token holders)
    investor_count = TokenHolding.query.filter_by(project_id=project_id).count()
    demand_multiplier = min(investor_count / 10.0, 2.0)

    roi_factor = float(p.roi_percent or 12) / 100

    base_price = float(p.token_price or 100)
    token_value = base_price + (completion_pct * roi_factor) + demand_multiplier
    token_value = round(token_value, 2)

    return jsonify({
        "base_price": base_price,
        "current_value": token_value,
        "completion_pct": round(completion_pct, 1),
        "demand_multiplier": round(demand_multiplier, 2),
        "investor_count": investor_count,
        "roi_factor": roi_factor,
    })


@app.get("/api/projects/<int:project_id>/updates")
def project_updates(project_id):
    updates = (
        ProjectUpdate.query
        .filter_by(project_id=project_id)
        .order_by(ProjectUpdate.timestamp.desc())
        .all()
    )
    return jsonify([{
        "id": u.id,
        "media_type": u.media_type,
        "media_url": u.media_url,
        "description": u.description,
        "latitude": u.latitude,
        "longitude": u.longitude,
        "timestamp": u.timestamp.isoformat(),
    } for u in updates])


# ═══════════════════════════════════════════════════════════════════════════════
# INVESTOR
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/investor/invest")
def invest():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "INVESTOR":
        return jsonify({"error": "Forbidden"}), 403

    # ── Rate limit ────────────────────────────────────────────────────────────
    if not check_rate_limit(auth_user["user_id"]):
        return jsonify({
            "error": "Too many investment requests. Please wait a minute before trying again."
        }), 429

    data = request.json or {}
    project_id = data.get("project_id")
    raw_amount = data.get("amount", 0)

    try:
        amount = int(raw_amount)
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid amount"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    p = Project.query.get(project_id)
    if not p:
        return jsonify({"error": "Project not found"}), 404

    if p.status != "ACTIVE":
        return jsonify({"error": "Project is not available for investment"}), 400

    # ── Token calculation (always integer floor) ──────────────────────────────
    token_price = int(p.token_price)
    if amount < token_price:
        return jsonify({"error": f"Minimum investment is ₹{token_price}"}), 400

    tokens = amount // token_price   # integer tokens only

    # ── Funding cap validation ────────────────────────────────────────────────
    current_raised = int(p.funding_raised or 0)
    funding_target = int(p.funding_target or 0)
    remaining_capacity = funding_target - current_raised

    if remaining_capacity <= 0:
        return jsonify({"error": "Project is fully funded"}), 400

    # Cap investment to remaining capacity
    if amount > remaining_capacity:
        amount = (remaining_capacity // token_price) * token_price
        tokens = amount // token_price
        if tokens <= 0:
            return jsonify({"error": "Project is at funding capacity"}), 400

    platform_fee = round(amount * 0.01, 2)
    total_amount = round(amount + platform_fee, 2)

    tx_hash = generate_tx_hash()
    token_id = generate_token_id()

    # ── Update project funding ────────────────────────────────────────────────
    p.funding_raised = current_raised + amount

    # Auto-complete project if fully funded
    if p.funding_raised >= funding_target:
        p.status = "ACTIVE"  # stays ACTIVE; admin can set COMPLETED

    # ── Escrow ────────────────────────────────────────────────────────────────
    escrow = Escrow.query.filter_by(project_id=p.id).first()
    if not escrow:
        escrow = Escrow(project_id=p.id, total_locked=0.0, total_released=0.0)
        db.session.add(escrow)

    escrow.total_locked = float(escrow.total_locked or 0) + amount

    # ── Token Holding ─────────────────────────────────────────────────────────
    holding = TokenHolding.query.filter_by(
        user_id=auth_user["user_id"],
        project_id=p.id
    ).first()

    if not holding:
        holding = TokenHolding(
            user_id=auth_user["user_id"],
            project_id=p.id,
            token_count=0,
            avg_buy_price=0.0
        )
        db.session.add(holding)

    old_total_cost = holding.token_count * holding.avg_buy_price
    new_total_cost = old_total_cost + (tokens * token_price)
    holding.token_count += tokens
    holding.avg_buy_price = round(new_total_cost / holding.token_count, 4)

    # ── Deduct from investor wallet balance ───────────────────────────────────
    investor = User.query.get(auth_user["user_id"])
    if investor:
        investor.wallet_balance = max(0.0, float(investor.wallet_balance or 0) - total_amount)

    # ── Transaction record ────────────────────────────────────────────────────
    tx = Transaction(
        tx_hash=tx_hash,
        user_id=auth_user["user_id"],
        project_id=p.id,
        tx_type="MINT",
        amount=float(amount),
        token_count=tokens,
        status="SUCCESS"
    )
    db.session.add(tx)

    # ── Blockchain-ready ledger entry ─────────────────────────────────────────
    _add_ledger_entry(tx_hash, "MINT", auth_user["user_id"], p.id,
                      float(amount), tokens, token_id)

    # ── Refresh risk score ────────────────────────────────────────────────────
    _refresh_project_risk(p)

    db.session.commit()

    return jsonify({
        "status": "success",
        "message": "Investment successful",
        "tx_hash": tx_hash,
        "token_id": token_id,
        "tokens_minted": tokens,
        "tokens_issued": tokens,
        "amount_invested": amount,
        "platform_fee": platform_fee,
        "total_amount": total_amount,
        "funding_raised": p.funding_raised,
        "funding_target": p.funding_target,
    })


@app.get("/api/investor/portfolio")
def portfolio():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    holdings = TokenHolding.query.filter_by(user_id=auth_user["user_id"]).all()
    res = []

    for h in holdings:
        p = Project.query.get(h.project_id)
        if not p:
            continue

        # Get current token value (dynamic)
        milestones = Milestone.query.filter_by(project_id=p.id).all()
        total_ms = len(milestones)
        completed_ms = sum(1 for m in milestones if m.status == "COMPLETED")
        completion_pct = (completed_ms / total_ms * 100) if total_ms > 0 else 0
        investor_count = TokenHolding.query.filter_by(project_id=p.id).count()
        demand_multiplier = min(investor_count / 10.0, 2.0)
        roi_factor = float(p.roi_percent or 12) / 100
        current_token_value = round(
            float(p.token_price) + (completion_pct * roi_factor) + demand_multiplier, 2
        )

        res.append({
            "project_id": p.id,
            "project_title": p.title,
            "tokens": h.token_count,
            "avg_buy_price": h.avg_buy_price,
            "token_price": p.token_price,
            "current_token_value": current_token_value,
            "roi_percent": p.roi_percent,
            "tenure_months": p.tenure_months,
            "project_status": p.status,
        })

    return jsonify(res)


@app.get("/api/investor/transactions")
def investor_transactions():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    txs = (
        Transaction.query
        .filter_by(user_id=auth_user["user_id"])
        .order_by(Transaction.created_at.desc())
        .all()
    )

    result = []
    for t in txs:
        p = Project.query.get(t.project_id) if t.project_id else None
        result.append({
            "tx_hash": t.tx_hash,
            "type": t.tx_type,
            "amount": t.amount,
            "token_count": t.token_count,
            "status": t.status,
            "created_at": t.created_at.isoformat(),
            "project_id": t.project_id,
            "project_title": p.title if p else "—",
        })

    return jsonify(result)


@app.get("/api/investor/ledger")
def investor_ledger():
    """Blockchain-ready immutable ledger for investor."""
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    entries = (
        TokenLedger.query
        .filter_by(user_id=auth_user["user_id"])
        .order_by(TokenLedger.block_index.asc())
        .all()
    )

    result = []
    for e in entries:
        p = Project.query.get(e.project_id) if e.project_id else None
        result.append({
            "block_index": e.block_index,
            "token_id": e.token_id,
            "tx_hash": e.tx_hash,
            "prev_hash": e.prev_hash,
            "tx_type": e.tx_type,
            "amount": e.amount,
            "token_count": e.token_count,
            "project_id": e.project_id,
            "project_title": p.title if p else "—",
            "timestamp": e.timestamp.isoformat(),
        })

    return jsonify(result)


@app.get("/api/investor/rewards")
def investor_rewards():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    rewards = Reward.query.filter_by(user_id=auth_user["user_id"]).all()
    total_points = sum(r.reward_points for r in rewards)

    result = []
    for r in rewards:
        p = Project.query.get(r.project_id) if r.project_id else None
        result.append({
            "id": r.id,
            "reward_type": r.reward_type,
            "reward_points": r.reward_points,
            "description": r.description,
            "project_id": r.project_id,
            "project_title": p.title if p else "—",
            "granted_at": r.granted_at.isoformat(),
        })

    return jsonify({
        "total_points": total_points,
        "rewards": result,
    })


CATEGORY_REWARD_INFO = {
    "Highway":          {"type": "TOLL_DISCOUNT",      "label": "Toll Discounts",       "description": "Get discounts on toll plazas along this highway corridor"},
    "Road":             {"type": "TOLL_DISCOUNT",      "label": "Toll Discounts",       "description": "Earn toll fee discounts on completed road segments"},
    "Bridge":           {"type": "TOLL_DISCOUNT",      "label": "Toll Discounts",       "description": "Receive toll concessions on bridge crossings"},
    "Metro":            {"type": "TRAVEL_CREDIT",      "label": "Travel Credits",       "description": "Get metro travel credits for discounted commutes"},
    "Transport":        {"type": "TRAVEL_CREDIT",      "label": "Travel Credits",       "description": "Earn credits for public transport services"},
    "Railway":          {"type": "TRAVEL_CREDIT",      "label": "Travel Credits",       "description": "Receive railway travel credits and booking discounts"},
    "Airport":          {"type": "TRAVEL_CREDIT",      "label": "Travel Credits",       "description": "Get airport lounge access and flight credits"},
    "Mall":             {"type": "SHOPPING_DISCOUNT",  "label": "Shopping Discounts",   "description": "Exclusive shopping discounts at partner retail outlets"},
    "Commercial":       {"type": "SHOPPING_DISCOUNT",  "label": "Shopping Discounts",   "description": "Get commercial establishment partner discounts"},
    "Energy":           {"type": "GREEN_ENERGY_CREDIT","label": "Green Energy Credits", "description": "Earn carbon offset credits and energy bill discounts"},
    "Solar":            {"type": "GREEN_ENERGY_CREDIT","label": "Green Energy Credits", "description": "Receive solar energy credits for clean power contribution"},
    "Waste Management": {"type": "GREEN_ENERGY_CREDIT","label": "Green Energy Credits", "description": "Earn eco-credits for waste-to-energy contribution"},
    "Water":            {"type": "UTILITY_DISCOUNT",   "label": "Utility Discounts",    "description": "Get discounts on water utility bills in the project area"},
    "Drainage":         {"type": "UTILITY_DISCOUNT",   "label": "Utility Discounts",    "description": "Receive municipal utility discount benefits"},
    "Hospital":         {"type": "HEALTH_SUBSIDY",     "label": "Health Subsidies",     "description": "Access subsidized medical services and health checkups"},
    "Health":           {"type": "HEALTH_SUBSIDY",     "label": "Health Subsidies",     "description": "Get healthcare discounts at partner facilities"},
    "Safety":           {"type": "SAFETY_CREDIT",      "label": "Safety Credits",       "description": "Earn safety infrastructure credits and insurance discounts"},
    "Smart City":       {"type": "SMART_CITY_PERK",    "label": "Smart City Perks",     "description": "Access smart city digital services and IoT benefits"},
}


@app.get("/api/projects/<int:project_id>/rewards-info")
def project_rewards_info(project_id):
    p = Project.query.get(project_id)
    if not p:
        return jsonify({"error": "Not found"}), 404
    category = str(p.category or "").strip().title()
    info = CATEGORY_REWARD_INFO.get(category, {
        "type": "CIVIC_REWARD",
        "label": "Civic Rewards",
        "description": "Earn civic reward points for investing in public infrastructure",
    })
    return jsonify({
        "category": category,
        "reward_type": info["type"],
        "reward_label": info["label"],
        "reward_description": info["description"],
        "points_per_milestone": 50,
    })


# ─── PDF Certificate ──────────────────────────────────────────────────────────

@app.get("/api/investor/certificate/<int:project_id>")
def download_certificate(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.get(auth_user["user_id"])
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    project = Project.query.get_or_404(project_id)
    holding = TokenHolding.query.filter_by(user_id=user.id, project_id=project.id).first()
    if not holding or holding.token_count <= 0:
        return jsonify({"error": "No tokens found for this project"}), 400

    tx = (
        Transaction.query
        .filter_by(user_id=user.id, project_id=project.id)
        .order_by(Transaction.created_at.desc())
        .first()
    )
    tx_hash = tx.tx_hash if tx else generate_tx_hash()

    pdf_data = {
        "investor_name": user.name,
        "project_title": project.title,
        "amount_invested": int(holding.token_count * project.token_price),
        "tokens_issued": holding.token_count,
        "token_price": project.token_price,
        "roi_percent": project.roi_percent,
        "tenure_months": project.tenure_months,
        "tx_hash": tx_hash,
    }

    os.makedirs("generated_pdfs", exist_ok=True)
    file_path = f"generated_pdfs/certificate_{user.id}_{project.id}.pdf"
    generate_certificate_pdf(pdf_data, file_path)
    return send_file(file_path, as_attachment=True)


# ═══════════════════════════════════════════════════════════════════════════════
# SECONDARY MARKET
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/marketplace/list")
def list_tokens_for_sale():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    project_id = data.get("project_id")
    token_count = int(data.get("token_count", 0))
    price_per_token = int(data.get("price_per_token", 0))

    if token_count <= 0 or price_per_token <= 0:
        return jsonify({"error": "Invalid listing inputs"}), 400

    holding = TokenHolding.query.filter_by(
        user_id=auth_user["user_id"],
        project_id=project_id
    ).first()

    if not holding or holding.token_count < token_count:
        return jsonify({"error": "Not enough tokens"}), 400

    listing = MarketplaceListing(
        seller_id=auth_user["user_id"],
        project_id=project_id,
        token_count=token_count,
        price_per_token=price_per_token,
        status="ACTIVE"
    )
    db.session.add(listing)
    db.session.commit()

    return jsonify({"message": "Listing created", "listing_id": listing.id})


@app.get("/api/marketplace/listings")
def marketplace_listings():
    listings = MarketplaceListing.query.filter_by(status="ACTIVE").all()
    result = []

    for l in listings:
        p = Project.query.get(l.project_id)
        seller = User.query.get(l.seller_id)
        if not p or not seller or p.status != "ACTIVE":
            continue

        result.append({
            "id": l.id,
            "project_id": p.id,
            "project_title": p.title,
            "seller_name": seller.name,
            "token_count": l.token_count,
            "price_per_token": l.price_per_token,
            "status": l.status,
        })

    return jsonify(result)


@app.post("/api/marketplace/buy")
def buy_listing():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    listing_id = data.get("listing_id")

    listing = MarketplaceListing.query.get_or_404(listing_id)
    if listing.status != "ACTIVE":
        return jsonify({"error": "Listing not available"}), 400

    buyer_id = auth_user["user_id"]
    if buyer_id == listing.seller_id:
        return jsonify({"error": "Cannot buy your own listing"}), 400

    p = Project.query.get(listing.project_id)
    if not p or p.status != "ACTIVE":
        return jsonify({"error": "Project not active"}), 400

    tx_hash = generate_tx_hash()
    token_id = generate_token_id()

    seller_h = TokenHolding.query.filter_by(
        user_id=listing.seller_id, project_id=p.id
    ).first()

    if not seller_h or seller_h.token_count < listing.token_count:
        return jsonify({"error": "Seller has insufficient tokens"}), 400

    seller_h.token_count -= listing.token_count

    buyer_h = TokenHolding.query.filter_by(user_id=buyer_id, project_id=p.id).first()
    if not buyer_h:
        buyer_h = TokenHolding(
            user_id=buyer_id,
            project_id=p.id,
            token_count=0,
            avg_buy_price=float(listing.price_per_token)
        )
        db.session.add(buyer_h)

    total_cost = listing.token_count * listing.price_per_token
    old_total = buyer_h.token_count * buyer_h.avg_buy_price
    buyer_h.token_count += listing.token_count
    buyer_h.avg_buy_price = round(
        (old_total + total_cost) / buyer_h.token_count, 4
    )
    listing.status = "SOLD"

    tx = Transaction(
        tx_hash=tx_hash,
        user_id=buyer_id,
        project_id=p.id,
        tx_type="TRANSFER",
        amount=float(total_cost),
        token_count=listing.token_count,
        status="SUCCESS"
    )
    db.session.add(tx)
    _add_ledger_entry(tx_hash, "TRANSFER", buyer_id, p.id,
                      float(total_cost), listing.token_count, token_id)

    db.session.commit()
    return jsonify({"message": "Purchase successful", "tx_hash": tx_hash})


# ═══════════════════════════════════════════════════════════════════════════════
# ISSUER
# ═══════════════════════════════════════════════════════════════════════════════

@app.post("/api/issuer/projects")
def issuer_create_project():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}

    title = (data.get("title", "") or "").strip()
    category = data.get("category", "Road")
    location = (data.get("location", "") or "").strip()
    description = (data.get("description", "") or "").strip()

    try:
        funding_target = int(data.get("funding_target", 0))
        token_price = int(data.get("token_price", 100))
        roi_percent = float(data.get("roi_percent", 10))
        tenure_months = int(data.get("tenure_months", 60))
        latitude = float(data["latitude"]) if data.get("latitude") else None
        longitude = float(data["longitude"]) if data.get("longitude") else None
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numeric fields"}), 400

    if latitude is None or longitude is None:
        latitude, longitude = _random_india_coordinates()

    if not title or not location or not description:
        return jsonify({"error": "Missing required fields: title, location, description"}), 400
    if funding_target <= 0 or token_price <= 0:
        return jsonify({"error": "funding_target and token_price must be > 0"}), 400

    project = Project(
        issuer_id=auth_user["user_id"],
        title=title,
        category=category,
        location=location,
        description=description,
        latitude=latitude,
        longitude=longitude,
        funding_target=funding_target,
        funding_raised=0,
        token_price=token_price,
        roi_percent=roi_percent,
        tenure_months=tenure_months,
        risk_level="MEDIUM",
        risk_score=50,
        status="PENDING"
    )
    db.session.add(project)
    db.session.commit()

    # Escrow record
    escrow = Escrow(project_id=project.id, total_locked=0.0, total_released=0.0)
    db.session.add(escrow)

    # Milestones
    milestones_data = data.get("milestones", [])
    if isinstance(milestones_data, list) and len(milestones_data) > 0:
        for m in milestones_data:
            m_title = (m.get("title") or "").strip()
            m_percent = int(m.get("escrow_release_percent") or 0)
            if m_title and m_percent > 0:
                db.session.add(Milestone(
                    project_id=project.id,
                    title=m_title,
                    escrow_release_percent=m_percent,
                    status="PENDING",
                    proof_url=""
                ))
    else:
        defaults = [
            {"title": "Tender Approved", "escrow_release_percent": 20},
            {"title": "Construction Started", "escrow_release_percent": 20},
            {"title": "25% Completion Proof", "escrow_release_percent": 20},
            {"title": "50% Completion Proof", "escrow_release_percent": 20},
            {"title": "Audit & Completion Report", "escrow_release_percent": 20},
        ]
        for m in defaults:
            db.session.add(Milestone(
                project_id=project.id,
                title=m["title"],
                escrow_release_percent=m["escrow_release_percent"],
                status="PENDING",
                proof_url=""
            ))

    db.session.commit()

    # Calculate initial risk score
    _refresh_project_risk(project)
    db.session.commit()

    return jsonify({
        "message": "Project created (pending admin approval)",
        "project_id": project.id,
        "status": project.status,
    })


@app.get("/api/issuer/projects")
def issuer_projects():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    projects = (
        Project.query
        .filter_by(issuer_id=auth_user["user_id"])
        .order_by(Project.id.desc())
        .all()
    )

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "location": p.location,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "funding_raised": p.funding_raised,
        "funding_target": p.funding_target,
        "token_price": p.token_price,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_score": p.risk_score,
        "risk_level": p.risk_level,
        "status": p.status,
    } for p in projects])


@app.post("/api/issuer/milestones/<int:milestone_id>/submit")
def issuer_submit_milestone_proof(milestone_id):
    """
    Issuer submits proof for a milestone.
    Sets status to SUBMITTED — admin must then approve and release funds.
    Does NOT auto-release escrow.
    """
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    proof_url = (data.get("proof_url") or "").strip()

    milestone = Milestone.query.get_or_404(milestone_id)
    project = Project.query.get(milestone.project_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404
    if project.issuer_id != auth_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
    if not proof_url:
        return jsonify({"error": "proof_url is required"}), 400
    if milestone.status == "COMPLETED":
        return jsonify({"message": "Milestone already completed"}), 200
    if milestone.status == "SUBMITTED":
        return jsonify({"message": "Already submitted — awaiting admin review"}), 200

    milestone.status = "SUBMITTED"
    milestone.proof_url = proof_url
    db.session.commit()

    return jsonify({
        "message": "Milestone proof submitted — awaiting admin approval",
        "milestone_id": milestone_id,
        "status": milestone.status,
        "proof_url": proof_url,
    })


@app.post("/api/issuer/projects/<int:project_id>/documents")
def issuer_upload_document(project_id):
    """Issuer attaches a document record to a project."""
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    project = Project.query.get_or_404(project_id)
    if project.issuer_id != auth_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    file_url = (data.get("file_url") or "").strip()
    filename = (data.get("filename") or "").strip()
    doc_type = (data.get("doc_type") or "OTHER").strip().upper()
    description = (data.get("description") or "").strip()

    if not file_url or not filename:
        return jsonify({"error": "file_url and filename are required"}), 400

    doc = ProjectDocument(
        project_id=project_id,
        uploader_id=auth_user["user_id"],
        doc_type=doc_type,
        filename=filename,
        file_url=file_url,
        description=description,
    )
    db.session.add(doc)
    db.session.commit()

    return jsonify({
        "message": "Document linked to project",
        "document_id": doc.id,
        "doc_type": doc.doc_type,
    })


@app.post("/api/issuer/projects/<int:project_id>/updates")
def issuer_post_update(project_id):
    """Issuer posts a live progress update (text/image/video + optional geo)."""
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ISSUER":
        return jsonify({"error": "Forbidden"}), 403

    project = Project.query.get_or_404(project_id)
    if project.issuer_id != auth_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    description = (data.get("description") or "").strip()
    media_type = (data.get("media_type") or "TEXT").upper()
    media_url = (data.get("media_url") or "").strip() or None

    try:
        latitude = float(data["latitude"]) if data.get("latitude") else None
        longitude = float(data["longitude"]) if data.get("longitude") else None
    except (TypeError, ValueError):
        latitude = longitude = None

    if not description:
        return jsonify({"error": "description is required"}), 400

    update = ProjectUpdate(
        project_id=project_id,
        issuer_id=auth_user["user_id"],
        media_type=media_type,
        media_url=media_url,
        description=description,
        latitude=latitude,
        longitude=longitude,
    )
    db.session.add(update)
    db.session.commit()

    return jsonify({
        "message": "Update posted",
        "update_id": update.id,
        "timestamp": update.timestamp.isoformat(),
    })


# ═══════════════════════════════════════════════════════════════════════════════
# ADMIN
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/admin/projects")
def admin_list_projects():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    status = (request.args.get("status") or "").upper().strip()
    q = Project.query
    if status:
        q = q.filter(Project.status == status)
    projects = q.order_by(Project.id.desc()).all()

    return jsonify([{
        "id": p.id,
        "title": p.title,
        "location": p.location,
        "category": p.category,
        "funding_target": p.funding_target,
        "funding_raised": p.funding_raised,
        "roi_percent": p.roi_percent,
        "tenure_months": p.tenure_months,
        "risk_score": p.risk_score,
        "risk_level": p.risk_level,
        "status": p.status,
        "issuer_id": p.issuer_id,
    } for p in projects])


@app.get("/api/admin/revenue")
def admin_revenue_overview():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    total_investments = float(
        db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0))
        .filter(Transaction.tx_type == "MINT")
        .scalar()
    )
    total_fees_collected = round(total_investments * 0.01, 2)
    total_users = User.query.count()

    return jsonify({
        "total_fees_collected": total_fees_collected,
        "total_investments": round(total_investments, 2),
        "total_users": total_users,
    })


@app.get("/api/admin/platform-stats")
def get_platform_stats():
    """Demo-safe platform KPI stats for admin dashboard cards."""
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    return jsonify({
        "platform_health": "Healthy",
        "active_projects": random.randint(10, 25),
        "verified_developers": random.randint(5, 15),
        "pending_approvals": random.randint(1, 5),
        "fraud_alerts": random.randint(0, 2),
    })


@app.get("/api/admin/issuers")
def admin_list_issuers():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    issuers = User.query.filter_by(role="ISSUER").all()
    result = []
    for u in issuers:
        project_count = Project.query.filter_by(issuer_id=u.id).count()
        completed_count = Project.query.filter(
            Project.issuer_id == u.id,
            Project.status == "COMPLETED"
        ).count()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "wallet_balance": u.wallet_balance,
            "project_count": project_count,
            "completed_projects": completed_count,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return jsonify(result)


@app.get("/api/admin/projects/<int:project_id>/details")
def admin_project_details(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    p = Project.query.get_or_404(project_id)
    milestones = (
        Milestone.query
        .filter_by(project_id=p.id)
        .order_by(Milestone.id.asc())
        .all()
    )
    escrow = Escrow.query.filter_by(project_id=p.id).first()

    return jsonify({
        "project": _fmt_project(p),
        "milestones": [{
            "id": m.id,
            "title": m.title,
            "escrow_release_percent": m.escrow_release_percent,
            "status": m.status,
            "proof_url": m.proof_url,
            "approved_at": m.approved_at.isoformat() if m.approved_at else None,
        } for m in milestones],
        "escrow": {
            "total_locked": float(escrow.total_locked) if escrow else 0.0,
            "total_released": float(escrow.total_released) if escrow else 0.0,
        }
    })


@app.get("/api/admin/projects/<int:project_id>/documents")
def admin_project_documents(project_id):
    """Admin views all documents uploaded for a project."""
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    docs = (
        ProjectDocument.query
        .filter_by(project_id=project_id)
        .order_by(ProjectDocument.uploaded_at.desc())
        .all()
    )

    return jsonify([{
        "id": d.id,
        "doc_type": d.doc_type,
        "filename": d.filename,
        "file_url": d.file_url,
        "description": d.description,
        "uploaded_at": d.uploaded_at.isoformat(),
        "uploader_id": d.uploader_id,
    } for d in docs])


@app.post("/api/admin/projects/<int:project_id>/status")
def admin_update_project_status(project_id):
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    data = request.json or {}
    status = (data.get("status") or "").upper().strip()

    valid_statuses = {"ACTIVE", "FROZEN", "PENDING", "COMPLETED", "FAILED"}
    if status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Valid: {valid_statuses}"}), 400

    project = Project.query.get_or_404(project_id)
    project.status = status
    db.session.commit()

    return jsonify({"message": "Project status updated", "status": project.status})


@app.post("/api/admin/projects/<int:project_id>/escrow-release")
def admin_manual_escrow_release(project_id):
    """
    Admin manually releases a specific amount from escrow to the issuer
    without requiring a milestone. Used for partial manual fund transfers.
    """
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    body = request.get_json(silent=True) or {}
    amount = body.get("amount")
    if amount is None:
        return jsonify({"error": "amount is required"}), 400

    try:
        amount = round(float(amount), 2)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount"}), 400

    if amount <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    project = Project.query.get_or_404(project_id)
    escrow = Escrow.query.filter_by(project_id=project.id).first()
    if not escrow:
        return jsonify({"error": "Escrow record not found for project"}), 404

    if float(escrow.total_locked) < amount:
        return jsonify({
            "error": f"Insufficient escrow balance. Locked: ₹{escrow.total_locked}"
        }), 400

    # ── Update escrow ─────────────────────────────────────────────────────────
    escrow.total_locked = round(float(escrow.total_locked) - amount, 2)
    escrow.total_released = round(float(escrow.total_released) + amount, 2)

    # ── Credit issuer wallet ────────────────────────────────────────────────
    issuer = User.query.get(project.issuer_id) if project.issuer_id else None
    if issuer:
        issuer.wallet_balance = round(float(issuer.wallet_balance or 0) + amount, 2)

    # ── Transaction record ────────────────────────────────────────────────────
    tx_hash = generate_tx_hash()
    tx = Transaction(
        tx_hash=tx_hash,
        user_id=project.issuer_id,
        project_id=project.id,
        tx_type="ESCROW_RELEASE",
        amount=amount,
        token_count=0,
        status="SUCCESS",
    )
    db.session.add(tx)

    # ── Blockchain ledger entry ───────────────────────────────────────────────
    _add_ledger_entry(
        tx_hash, "ESCROW_RELEASE",
        project.issuer_id, project.id,
        amount, 0
    )

    # ── Refresh risk score ────────────────────────────────────────────────────
    _refresh_project_risk(project)

    db.session.commit()

    return jsonify({
        "message": "Funds released successfully",
        "release_amount": amount,
        "escrow_locked_remaining": escrow.total_locked,
        "escrow_total_released": escrow.total_released,
        "tx_hash": tx_hash,
        "issuer_name": issuer.name if issuer else "Unknown",
        "issuer_wallet_balance": issuer.wallet_balance if issuer else 0,
    })


@app.post("/api/admin/milestones/<int:milestone_id>/release")
def admin_release_milestone_funds(milestone_id):
    """
    Admin reviews a SUBMITTED milestone, releases escrow funds to the issuer,
    creates an ESCROW_RELEASE transaction, and appends to the blockchain ledger.
    """
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    milestone = Milestone.query.get_or_404(milestone_id)
    if milestone.status != "SUBMITTED":
        return jsonify({
            "error": f"Milestone must be SUBMITTED to release funds. Current: {milestone.status}"
        }), 400

    project = Project.query.get_or_404(milestone.project_id)
    escrow = Escrow.query.filter_by(project_id=project.id).first()
    if not escrow:
        return jsonify({"error": "Escrow record not found for project"}), 404

    # release_amount = milestone_percentage × total_funding_raised
    release_amount = round(
        (milestone.escrow_release_percent / 100.0) * float(project.funding_raised or 0), 2
    )

    if release_amount <= 0:
        return jsonify({"error": "Release amount is 0 — project may have no funding"}), 400

    if float(escrow.total_locked) < release_amount:
        release_amount = float(escrow.total_locked)  # cap to available

    # ── Update escrow ─────────────────────────────────────────────────────────
    escrow.total_locked = round(float(escrow.total_locked) - release_amount, 2)
    escrow.total_released = round(float(escrow.total_released) + release_amount, 2)

    # ── Mark milestone completed ──────────────────────────────────────────────
    from datetime import datetime
    milestone.status = "COMPLETED"
    milestone.approved_at = datetime.utcnow()

    # ── Credit issuer wallet ────────────────────────────────────────────────
    issuer = User.query.get(project.issuer_id) if project.issuer_id else None
    if issuer:
        issuer.wallet_balance = round(float(issuer.wallet_balance or 0) + release_amount, 2)

    # ── Transaction record ────────────────────────────────────────────────────
    tx_hash = generate_tx_hash()
    tx = Transaction(
        tx_hash=tx_hash,
        user_id=project.issuer_id,
        project_id=project.id,
        tx_type="ESCROW_RELEASE",
        amount=release_amount,
        token_count=0,
        status="SUCCESS",
    )
    db.session.add(tx)

    # ── Blockchain ledger entry ───────────────────────────────────────────────
    _add_ledger_entry(
        tx_hash, "ESCROW_RELEASE",
        project.issuer_id, project.id,
        release_amount, 0
    )

    # ── Grant civic reward points to all investors of this project ────────────
    _grant_civic_rewards(project, milestone)

    # ── Refresh risk score ────────────────────────────────────────────────────
    _refresh_project_risk(project)

    db.session.commit()

    return jsonify({
        "message": "Funds released successfully",
        "milestone_id": milestone_id,
        "release_amount": release_amount,
        "escrow_locked_remaining": escrow.total_locked,
        "escrow_total_released": escrow.total_released,
        "tx_hash": tx_hash,
        "issuer_wallet_balance": issuer.wallet_balance if issuer else 0,
    })


def _grant_civic_rewards(project, milestone):
    """
    Grant reward points to all investors of the project when a milestone is completed.
    Reward type is based on project category.
    """
    category_reward_map = {
        "Highway":          ("TOLL_DISCOUNT",      50),
        "Metro":            ("TRAVEL_CREDIT",      60),
        "Mall":             ("SHOPPING_DISCOUNT",  40),
        "Road":             ("TOLL_DISCOUNT",      30),
        "Bridge":           ("TOLL_DISCOUNT",      35),
        "Solar":            ("GREEN_ENERGY_CREDIT",45),
        "Energy":           ("GREEN_ENERGY_CREDIT",45),
        "Water":            ("UTILITY_DISCOUNT",   40),
        "Airport":          ("TRAVEL_CREDIT",      70),
        "Transport":        ("TRAVEL_CREDIT",      55),
        "Railway":          ("TRAVEL_CREDIT",      55),
        "Drainage":         ("UTILITY_DISCOUNT",   30),
        "Safety":           ("SAFETY_CREDIT",      35),
        "Smart City":       ("SMART_CITY_PERK",    50),
        "Waste Management": ("GREEN_ENERGY_CREDIT",35),
        "Hospital":         ("HEALTH_SUBSIDY",     45),
        "Health":           ("HEALTH_SUBSIDY",     45),
        "Commercial":       ("SHOPPING_DISCOUNT",  40),
    }
    category = str(project.category or "").strip().title()
    reward_type, base_points = category_reward_map.get(category, ("INFRA_POINTS", 25))

    points = int(base_points * (milestone.escrow_release_percent / 100.0) * 10)

    holdings = TokenHolding.query.filter_by(project_id=project.id).all()
    for h in holdings:
        if h.token_count <= 0:
            continue
        reward = Reward(
            user_id=h.user_id,
            project_id=project.id,
            milestone_id=milestone.id,
            reward_type=reward_type,
            reward_points=points,
            description=f"Milestone '{milestone.title}' completed — {project.title}",
        )
        db.session.add(reward)


@app.post("/api/admin/projects/<int:project_id>/refund")
def admin_refund_project(project_id):
    """
    Admin freezes a failed project and refunds remaining escrow to all investors
    proportional to their token holdings.
    """
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    project = Project.query.get_or_404(project_id)
    escrow = Escrow.query.filter_by(project_id=project_id).first()

    if not escrow or float(escrow.total_locked) <= 0:
        return jsonify({"error": "No locked funds to refund"}), 400

    # Mark project as FAILED
    project.status = "FAILED"

    remaining = float(escrow.total_locked)
    holdings = TokenHolding.query.filter_by(project_id=project_id).all()
    total_tokens = sum(h.token_count for h in holdings)

    if total_tokens <= 0:
        db.session.commit()
        return jsonify({"message": "Project failed, no tokens to refund"}), 200

    refund_records = []
    for h in holdings:
        if h.token_count <= 0:
            continue

        token_share = h.token_count / total_tokens
        refund_amount = round(remaining * token_share, 2)

        if refund_amount <= 0:
            continue

        # Credit investor wallet
        investor = User.query.get(h.user_id)
        if investor:
            investor.wallet_balance = round(
                float(investor.wallet_balance or 0) + refund_amount, 2
            )

        tx_hash = generate_tx_hash()
        tx = Transaction(
            tx_hash=tx_hash,
            user_id=h.user_id,
            project_id=project_id,
            tx_type="REFUND",
            amount=refund_amount,
            token_count=h.token_count,
            status="SUCCESS",
        )
        db.session.add(tx)
        _add_ledger_entry(tx_hash, "REFUND", h.user_id, project_id,
                          refund_amount, h.token_count)

        refund_records.append({
            "user_id": h.user_id,
            "tokens": h.token_count,
            "refund_amount": refund_amount,
        })

    # Zero out escrow
    escrow.total_locked = 0.0

    db.session.commit()

    return jsonify({
        "message": "Project marked FAILED — refunds issued",
        "total_refunded": remaining,
        "investor_count": len(refund_records),
        "refunds": refund_records,
    })


@app.get("/api/admin/fraud-alerts")
def admin_fraud_alerts():
    auth_user = get_auth_user()
    if not auth_user:
        return jsonify({"error": "Unauthorized"}), 401
    if auth_user["role"] != "ADMIN":
        return jsonify({"error": "Forbidden"}), 403

    projects = Project.query.all()
    alerts = []

    for p in projects:
        if p.roi_percent >= 14:
            alerts.append({
                "type": "HIGH_ROI_ALERT",
                "project_id": p.id,
                "project_title": p.title,
                "message": "Unusually high ROI detected (possible risk)",
                "severity": "HIGH",
            })

        if p.funding_target > 0 and (p.funding_raised / p.funding_target) > 0.95:
            alerts.append({
                "type": "FUNDING_SPIKE",
                "project_id": p.id,
                "project_title": p.title,
                "message": "Project nearing full funding rapidly",
                "severity": "MEDIUM",
            })

        if p.risk_score >= 70:
            alerts.append({
                "type": "HIGH_RISK_SCORE",
                "project_id": p.id,
                "project_title": p.title,
                "message": f"Project risk score is HIGH ({p.risk_score}/100)",
                "severity": "HIGH",
            })

    return jsonify(alerts)


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 1 & 9 — DOCUMENT VISIBILITY & ADMIN PREVIEW
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/projects/<int:project_id>/documents")
def get_public_project_documents(project_id):
    """PHASE 9: Documents uploaded by issuer must be visible to investors (trust)"""
    docs = ProjectDocument.query.filter_by(project_id=project_id).all()
    return jsonify([{
        "id": d.id,
        "doc_type": d.doc_type,
        "filename": d.filename,
        "file_url": d.file_url,
        "description": d.description,
        "uploaded_at": d.uploaded_at.isoformat()
    } for d in docs])


@app.get("/api/admin/projects/<int:project_id>/preview")
def get_admin_project_preview(project_id):
    """
    PHASE 1: Admin Preview Page Details
    Needs: Project name, Location, Total project value, Trust score,
    Completed projects by issuer, Previous work history, Total funds raised,
    Total revenue, New project details, All uploaded documents.
    """
    auth_user = get_auth_user()
    if not auth_user or auth_user["role"] != "ADMIN":
        return jsonify({"error": "Unauthorized"}), 403

    p = Project.query.get(project_id)
    if not p:
        return jsonify({"error": "Project not found"}), 404

    # Calculate issuer stats
    issuer_projects = Project.query.filter_by(issuer_id=p.issuer_id).all()
    completed_projects = [proj for proj in issuer_projects if proj.status == "COMPLETED"]
    
    total_funds_raised_by_issuer = sum(proj.funding_raised for proj in issuer_projects)
    # Estimate total revenue as the ROI payout amount for completed projects (mock logic)
    total_revenue_by_issuer = sum(proj.funding_raised * (proj.roi_percent / 100) for proj in completed_projects)

    issuer = User.query.get(p.issuer_id) if p.issuer_id else None
    issuer_name = issuer.name if issuer else "Unknown Issuer"

    docs = ProjectDocument.query.filter_by(project_id=p.id).all()
    escrow = Escrow.query.filter_by(project_id=p.id).first()
    milestones = Milestone.query.filter_by(project_id=p.id).order_by(Milestone.id).all()

    return jsonify({
        "project": {
            "id": p.id,
            "title": p.title,
            "issuer_name": issuer_name,
            "location": p.location,
            "category": p.category,
            "description": p.description,
            "funding_target": p.funding_target,
            "funding_raised": p.funding_raised,
            "token_price": p.token_price,
            "roi_percent": p.roi_percent,
            "tenure_months": p.tenure_months,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "status": p.status,
            "latitude": p.latitude,
            "longitude": p.longitude
        },
        "issuer_stats": {
            "completed_projects_count": len(completed_projects),
            "total_projects_count": len(issuer_projects),
            "total_funds_raised": total_funds_raised_by_issuer,
            "total_revenue": total_revenue_by_issuer,
            "trust_score": p.risk_score  # Using risk score inverted or directly as trust score proxy
        },
        "documents": [{
            "id": d.id,
            "doc_type": d.doc_type,
            "filename": d.filename,
            "file_url": d.file_url,
            "uploaded_at": d.uploaded_at.isoformat()
        } for d in docs],
        "escrow": {
            "total_locked": escrow.total_locked if escrow else 0.0,
            "total_released": escrow.total_released if escrow else 0.0
        },
        "milestones": [{
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "required_amount": m.required_amount,
            "escrow_release_percent": m.escrow_release_percent,
            "status": m.status,
            "proof_url": m.proof_url
        } for m in milestones]
    })


# ═══════════════════════════════════════════════════════════════════════════════
# PHASE 7 — ISSUER PROFILE
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/issuers/<int:issuer_id>/profile")
def get_issuer_profile(issuer_id):
    """PHASE 7: Public issuer profile details for investors"""
    issuer = User.query.get(issuer_id)
    if not issuer or issuer.role != "ISSUER":
        return jsonify({"error": "Issuer not found"}), 404

    projects = Project.query.filter_by(issuer_id=issuer.id).all()
    completed = [p for p in projects if p.status == "COMPLETED"]

    total_funds = sum(p.funding_raised for p in projects)
    total_revenue = sum(p.funding_raised * (p.roi_percent / 100) for p in completed)
    avg_trust = sum(p.risk_score for p in projects) / len(projects) if projects else 85

    return jsonify({
        "id": issuer.id,
        "name": issuer.name,
        "company_name": issuer.name,  # simplified for demo
        "total_projects": len(projects),
        "completed_projects": len(completed),
        "total_funds_raised": total_funds,
        "total_revenue_earned": total_revenue,
        "trust_score": int(avg_trust)
    })

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
