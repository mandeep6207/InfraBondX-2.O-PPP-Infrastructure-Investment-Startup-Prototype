import random

from models import db, User, Project, Milestone, Escrow, ProjectDocument, ProjectUpdate
from werkzeug.security import generate_password_hash


def _random_india_coordinates():
    lat = round(random.uniform(8.0, 37.5), 6)
    lng = round(random.uniform(68.0, 97.5), 6)
    return lat, lng


def seed_data():
    # Do not seed again if users already exist
    if User.query.first():
        return

    # ── USERS ──────────────────────────────────────────────────────────────────
    admin = User(
        name="Admin",
        email="admin@infrabondx.com",
        password_hash=generate_password_hash("admin123"),
        role="ADMIN",
        wallet_balance=0.0,
    )
    issuer = User(
        name="Raipur Smart Infra Dept",
        email="issuer@infrabondx.com",
        password_hash=generate_password_hash("issuer123"),
        role="ISSUER",
        wallet_balance=50000.0,
    )
    investor = User(
        name="Mandeep Kumar",
        email="investor@infrabondx.com",
        password_hash=generate_password_hash("investor123"),
        role="INVESTOR",
        wallet_balance=100000.0,
    )

    db.session.add_all([admin, issuer, investor])
    db.session.commit()

    # ── PROJECTS ───────────────────────────────────────────────────────────────
    projects = [
        # ACTIVE
        Project(
            issuer_id=issuer.id,
            title="Raipur Smart Road Phase-2",
            category="Road",
            location="Raipur, Chhattisgarh",
            description="Upgrading 12km road with smart streetlights, drainage and safety upgrades.",
            latitude=21.2514,
            longitude=81.6296,
            funding_target=5000000,
            funding_raised=1250000,
            token_price=100,
            roi_percent=11.5,
            tenure_months=24,
            risk_level="MEDIUM",
            risk_score=48,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Bilaspur Bridge Strengthening Program",
            category="Bridge",
            location="Bilaspur, Chhattisgarh",
            description="Structural strengthening of an old bridge and monitoring improvements.",
            latitude=22.0797,
            longitude=82.1391,
            funding_target=8000000,
            funding_raised=2800000,
            token_price=100,
            roi_percent=12.8,
            tenure_months=36,
            risk_level="LOW",
            risk_score=42,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Mumbai Coastal Drainage Upgrade",
            category="Drainage",
            location="Mumbai, Maharashtra",
            description="Stormwater drainage modernization for monsoon resilience.",
            latitude=19.0760,
            longitude=72.8777,
            funding_target=15000000,
            funding_raised=7200000,
            token_price=100,
            roi_percent=12.2,
            tenure_months=30,
            risk_level="MEDIUM",
            risk_score=55,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Bengaluru Smart Streetlight Network",
            category="Energy",
            location="Bengaluru, Karnataka",
            description="LED smart streetlights with remote monitoring and energy analytics.",
            latitude=12.9716,
            longitude=77.5946,
            funding_target=9000000,
            funding_raised=4100000,
            token_price=100,
            roi_percent=11.2,
            tenure_months=24,
            risk_level="LOW",
            risk_score=40,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Ahmedabad EV Charging Corridors",
            category="Transport",
            location="Ahmedabad, Gujarat",
            description="Deployment of EV charging points across city corridors and highways.",
            latitude=23.0225,
            longitude=72.5714,
            funding_target=12000000,
            funding_raised=5900000,
            token_price=100,
            roi_percent=13.2,
            tenure_months=36,
            risk_level="MEDIUM",
            risk_score=60,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Hyderabad Water Pipeline Rehabilitation",
            category="Water",
            location="Hyderabad, Telangana",
            description="Pipeline leak reduction + sensor monitoring for urban water supply.",
            latitude=17.3850,
            longitude=78.4867,
            funding_target=11000000,
            funding_raised=3500000,
            token_price=100,
            roi_percent=11.0,
            tenure_months=30,
            risk_level="LOW",
            risk_score=44,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Jaipur Heritage Zone Road Resurfacing",
            category="Road",
            location="Jaipur, Rajasthan",
            description="Resurfacing + pedestrian safety upgrades in heritage zones.",
            latitude=26.9124,
            longitude=75.7873,
            funding_target=6000000,
            funding_raised=2400000,
            token_price=100,
            roi_percent=10.8,
            tenure_months=24,
            risk_level="LOW",
            risk_score=38,
            status="ACTIVE",
        ),
        Project(
            issuer_id=issuer.id,
            title="Kolkata Riverfront Safety Barriers",
            category="Safety",
            location="Kolkata, West Bengal",
            description="Safety barrier installations and lighting along riverfront stretches.",
            latitude=22.5726,
            longitude=88.3639,
            funding_target=7000000,
            funding_raised=3200000,
            token_price=100,
            roi_percent=12.0,
            tenure_months=24,
            risk_level="MEDIUM",
            risk_score=50,
            status="ACTIVE",
        ),
        # PENDING
        Project(
            issuer_id=issuer.id,
            title="Lucknow Smart Traffic Signal System",
            category="Smart City",
            location="Lucknow, Uttar Pradesh",
            description="Adaptive traffic signals with AI-based congestion control.",
            latitude=26.8467,
            longitude=80.9462,
            funding_target=9500000,
            funding_raised=0,
            token_price=100,
            roi_percent=12.5,
            tenure_months=30,
            risk_level="MEDIUM",
            risk_score=52,
            status="PENDING",
        ),
        Project(
            issuer_id=issuer.id,
            title="Chennai Flood-Resilient Underpass Upgrade",
            category="Drainage",
            location="Chennai, Tamil Nadu",
            description="Underpass drainage strengthening and water pump automation.",
            latitude=13.0827,
            longitude=80.2707,
            funding_target=13000000,
            funding_raised=0,
            token_price=100,
            roi_percent=14.2,  # fraud alert trigger demo
            tenure_months=36,
            risk_level="HIGH",
            risk_score=70,
            status="PENDING",
        ),
        Project(
            issuer_id=issuer.id,
            title="Indore Smart Waste Processing Plant",
            category="Waste Management",
            location="Indore, Madhya Pradesh",
            description="Waste-to-energy processing and automated segregation facilities.",
            latitude=22.7196,
            longitude=75.8577,
            funding_target=14000000,
            funding_raised=0,
            token_price=100,
            roi_percent=12.9,
            tenure_months=36,
            risk_level="MEDIUM",
            risk_score=57,
            status="PENDING",
        ),
        Project(
            issuer_id=issuer.id,
            title="Bhopal Lake Water Quality Sensors",
            category="Water",
            location="Bhopal, Madhya Pradesh",
            description="Real-time lake water quality sensors + dashboard monitoring.",
            latitude=23.2599,
            longitude=77.4126,
            funding_target=4000000,
            funding_raised=0,
            token_price=100,
            roi_percent=10.5,
            tenure_months=18,
            risk_level="LOW",
            risk_score=33,
            status="PENDING",
        ),
    ]

    for p in projects:
        if p.latitude is None or p.longitude is None:
            p.latitude, p.longitude = _random_india_coordinates()

    db.session.add_all(projects)
    db.session.commit()

    # ── ESCROW + MILESTONES ────────────────────────────────────────────────────
    escrows = []
    milestones_all = []

    for p in projects:
        escrows.append(
            Escrow(project_id=p.id, total_locked=float(p.funding_raised), total_released=0.0)
        )

        # Seed exactly 3 milestones per project
        milestones_all.extend([
            Milestone(
                project_id=p.id, title="Tender Approved",
                escrow_release_percent=20, status="COMPLETED",
                proof_url="/uploads/demo_tender.pdf"
            ),
            Milestone(
                project_id=p.id, title="Construction Started",
                escrow_release_percent=30, status="PENDING",
                proof_url="/uploads/demo_construction.pdf"
            ),
            Milestone(
                project_id=p.id, title="Construction Completed",
                escrow_release_percent=50, status="PENDING",
                proof_url="/uploads/demo_completion.pdf"
            ),
        ])

        # Seed exactly 3 documents per project
        # In a real app these files would exist in the uploads folder. For this demo, we'll use dummy paths.
        db.session.add(ProjectDocument(project_id=p.id, uploader_id=issuer.id, doc_type="TENDER", filename="project_proposal.pdf", file_url="/uploads/project_proposal.pdf", description="Initial project proposal and budget."))
        db.session.add(ProjectDocument(project_id=p.id, uploader_id=issuer.id, doc_type="APPROVAL", filename="construction_approval.pdf", file_url="/uploads/construction_approval.pdf", description="Government approval to begin construction."))
        db.session.add(ProjectDocument(project_id=p.id, uploader_id=issuer.id, doc_type="PHOTO", filename="site_photo.jpg", file_url="https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800", description="Recent site photograph."))

    db.session.add_all(escrows)
    db.session.add_all(milestones_all)
    db.session.commit()

    # ── PROJECT UPDATES (dummy timeline entries) ──────────────────────────────
    from datetime import datetime, timedelta
    now = datetime.utcnow()

    update_templates = [
        # (days_ago, media_type, media_url, description)
        (45, "IMAGE", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800",
         "Site clearing and land preparation completed. Heavy machinery mobilized."),
        (38, "IMAGE", "https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800",
         "Foundation excavation in progress. Soil testing reports verified."),
        (30, "VIDEO", "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
         "Drone footage of the construction site showing earthwork progress."),
        (22, "IMAGE", "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?auto=format&fit=crop&q=80&w=800",
         "Concrete pouring for base layer completed ahead of schedule."),
        (15, "TEXT", None,
         "Safety inspection passed. All equipment meets OSHA standards. Workers briefed on next phase."),
        (10, "IMAGE", "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
         "Steel reinforcement framework installation underway. 60% structural work done."),
        (5, "VIDEO", "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4",
         "Time-lapse video of last week's construction progress on pillars and beams."),
        (2, "IMAGE", "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800",
         "Quality audit completed. Material samples sent for lab verification."),
        (1, "TEXT", None,
         "Project on track — 65% milestone reached. Next review scheduled in 2 weeks."),
    ]

    updates_all = []
    # Seed updates for first 6 ACTIVE projects
    for proj in projects[:6]:
        for days_ago, mtype, murl, desc in update_templates:
            updates_all.append(
                ProjectUpdate(
                    project_id=proj.id,
                    issuer_id=issuer.id,
                    media_type=mtype,
                    media_url=murl,
                    description=desc,
                    latitude=proj.latitude + (days_ago % 5) * 0.001,
                    longitude=proj.longitude + (days_ago % 3) * 0.001,
                    timestamp=now - timedelta(days=days_ago),
                )
            )

    db.session.add_all(updates_all)
    db.session.commit()

    print("✅ Seeded users, projects, milestones, escrows, documents, and updates!")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        db.create_all()
        seed_data()
