import jwt
from flask import request
import os
import uuid
import time
from collections import defaultdict
from functools import wraps
from flask import jsonify

JWT_SECRET = os.getenv("JWT_SECRET", "supersecret")

__all__ = [
    "create_jwt",
    "get_auth_user",
    "generate_tx_hash",
    "generate_token_id",
    "check_rate_limit",
    "require_role",
    "calculate_risk_score",
    "risk_level_from_score",
]

# ─── JWT HELPERS ─────────────────────────────────────────────────────────────

def create_jwt(user_id, role):
    try:
        token = jwt.encode(
            {"user_id": user_id, "role": str(role).upper()},
            JWT_SECRET,
            algorithm="HS256"
        )
        if isinstance(token, bytes):
            token = token.decode("utf-8")
        return token
    except Exception:
        return "demo-token"


def get_auth_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "role": (payload.get("role") or "").upper()
        }
    except Exception:
        return None


# ─── TX HASH & TOKEN ID ───────────────────────────────────────────────────────

def generate_tx_hash():
    return "0x" + uuid.uuid4().hex


def generate_token_id():
    """Unique token ID per investment batch."""
    return "TKN-" + uuid.uuid4().hex[:16].upper()


# ─── RATE LIMITER ─────────────────────────────────────────────────────────────
# Simple in-memory rate limiter (resets on server restart).
# Maps: user_id -> list of timestamps for recent investment calls.

_invest_timestamps: dict = defaultdict(list)
RATE_LIMIT_WINDOW = 60   # seconds
RATE_LIMIT_MAX = 5        # max investments per window


def check_rate_limit(user_id: int) -> bool:
    """
    Returns True if the request is allowed, False if rate-limited.
    Allows max RATE_LIMIT_MAX investments per RATE_LIMIT_WINDOW seconds per user.
    """
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW

    # Keep only recent timestamps
    _invest_timestamps[user_id] = [
        ts for ts in _invest_timestamps[user_id] if ts > window_start
    ]

    if len(_invest_timestamps[user_id]) >= RATE_LIMIT_MAX:
        return False

    _invest_timestamps[user_id].append(now)
    return True


# ─── RBAC DECORATORS ─────────────────────────────────────────────────────────

def require_role(*roles):
    """
    Decorator that enforces JWT authentication and role-based access control.

    Usage:
        @app.post("/api/admin/something")
        @require_role("ADMIN")
        def my_view():
            auth_user = get_auth_user()
            ...
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth_user = get_auth_user()
            if not auth_user:
                return jsonify({"error": "Unauthorized"}), 401
            if auth_user["role"] not in [r.upper() for r in roles]:
                return jsonify({"error": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


# ─── RISK SCORE CALCULATOR ────────────────────────────────────────────────────

def calculate_risk_score(project, milestones, issuer) -> int:
    """
    Dynamic risk score (0–100, higher = riskier).

    Factors:
      - ROI percent: high ROI = higher risk
      - Milestone completion ratio: more completed = lower risk
      - Funding ratio: well-funded projects = lower risk
      - Issuer reputation: based on other projects by same issuer
    """
    score = 50  # base

    # ROI factor: >12% adds risk, <10% reduces risk
    roi = float(project.roi_percent or 10)
    if roi >= 14:
        score += 20
    elif roi >= 12:
        score += 10
    elif roi <= 8:
        score -= 10
    elif roi <= 10:
        score -= 5

    # Milestone completion factor
    total_ms = len(milestones)
    if total_ms > 0:
        completed_ms = sum(
            1 for m in milestones
            if str(m.status).upper() == "COMPLETED"
        )
        completion_ratio = completed_ms / total_ms
        # More completed = lower risk
        score -= int(completion_ratio * 20)

    # Funding ratio factor
    target = int(project.funding_target or 1)
    raised = int(project.funding_raised or 0)
    if target > 0:
        funding_ratio = raised / target
        if funding_ratio >= 0.75:
            score -= 10
        elif funding_ratio <= 0.25:
            score += 10

    # Issuer reputation (count projects from same issuer that are COMPLETED)
    # We pass issuer here as a proxy indicator
    # (full DB query done in app.py before calling this)
    if issuer and hasattr(issuer, "_completed_projects"):
        completed = issuer._completed_projects
        if completed >= 3:
            score -= 15
        elif completed >= 1:
            score -= 7

    # Clamp 0–100
    return max(0, min(100, score))


def risk_level_from_score(score: int) -> str:
    if score <= 33:
        return "LOW"
    elif score <= 66:
        return "MEDIUM"
    return "HIGH"
