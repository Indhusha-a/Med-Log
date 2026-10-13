# One-off script to get a fresh database into a usable state: creates
# the tables (in case the server's never been run yet), then inserts the
# one admin account and two sample doctors needed to actually log in and
# test anything. Run with `python -m app.seed` - safe to re-run, it
# skips anything that already exists instead of erroring or duplicating.

import app.models  # noqa: F401
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.admin import Admin
from app.models.doctor import Doctor
from app.models.enums import UserRole
from app.models.user import User


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # The only admin account in the system - there's no signup flow
        # that could create another one, by design (see Admin model).
        if not db.query(Admin).filter(Admin.username == "admin").first():
            admin_user = User(role=UserRole.ADMIN, password_hash=hash_password("Admin#2026"))
            db.add(admin_user)
            db.flush()
            db.add(Admin(id=admin_user.id, username="admin"))

        # Fictional doctors, per the assessment's "use fictional
        # information only" rule - just enough to have something to
        # book an appointment against without going through
        # POST /admin/doctors by hand first.
        sample_doctors = [
            dict(doctor_id="DOC001", first_name="Amara", last_name="Fernando",
                 email="amara.fernando@medlog.test", phone="0711111111",
                 speciality="General Medicine", consultation_rate=35.00, password="Doctor#123"),
            dict(doctor_id="DOC002", first_name="Nilan", last_name="Perera",
                 email="nilan.perera@medlog.test", phone="0722222222",
                 speciality="Cardiology", consultation_rate=60.00, password="Doctor#123"),
        ]
        for d in sample_doctors:
            if db.query(Doctor).filter(Doctor.doctor_id == d["doctor_id"]).first():
                continue
            password = d.pop("password")
            user = User(role=UserRole.DOCTOR, password_hash=hash_password(password))
            db.add(user)
            db.flush()
            db.add(Doctor(id=user.id, **d))

        db.commit()
        print("Seed complete. Admin login: admin / Admin#2026")
    finally:
        db.close()


if __name__ == "__main__":
    run()
