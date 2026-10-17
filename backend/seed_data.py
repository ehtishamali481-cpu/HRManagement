from database import SessionLocal
from app.models import Company, User, Department, Employee, LeaveRequest, CompanyEvent


def seed_database():
    db = SessionLocal()
    try:
        company = db.query(Company).filter(Company.id == 1).first()
        if not company:
            company = Company(
                name="Acme Global Corp",
                slug="acme-global-corp",
                plan="Enterprise Tier",
                hq_location="Enterprise HQ • San Francisco",
            )
            db.add(company)
            db.commit()
            db.refresh(company)
        else:
            company.name = "Acme Global Corp"
            company.hq_location = "Enterprise HQ • San Francisco"
            db.commit()

        user = db.query(User).filter(User.company_id == company.id).first()
        if user:
            user.full_name = "Sarah Jenkins"
            user.role = "HR Director"
            user.avatar_url = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
            db.commit()

        dept_names = [
            "Engineering",
            "Marketing & Growth",
            "Product & Design",
            "Sales & Accounts",
            "Finance & Legal",
        ]
        dept_map = {}
        for dname in dept_names:
            dept = db.query(Department).filter(Department.company_id == company.id, Department.name == dname).first()
            if not dept:
                dept = Department(company_id=company.id, name=dname)
                db.add(dept)
                db.flush()
            dept_map[dname] = dept
        db.commit()

        directory_emps = [
            {
                "employee_code": "NX-1042",
                "full_name": "Marcus Vance",
                "email": "m.vance@acmeglobal.corp",
                "phone_number": "+1 (415) 892-3021",
                "role_title": "Staff Infrastructure Architect",
                "department": "Engineering",
                "work_location": "San Francisco, CA (HQ)",
                "employment_type": "Full-Time",
                "reports_to": "Sarah Jenkins (HR Director)",
                "base_salary": "165,000",
                "currency": "USD ($)",
                "assigned_role": "admin",
                "start_date": "Jan 12, 2021",
                "onboarding_progress": 100,
                "status": "active",
                "attendance_status": "present_office",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            },
            {
                "employee_code": "NX-1058",
                "full_name": "Elena Rostova",
                "email": "elena.r@acmeglobal.corp",
                "phone_number": "+49 30 901820",
                "role_title": "Lead Product Designer",
                "department": "Product & Design",
                "work_location": "Berlin, DE (Remote)",
                "employment_type": "Full-Time",
                "reports_to": "Marcus Vance (Staff Architect)",
                "base_salary": "145,000",
                "currency": "USD ($)",
                "assigned_role": "hr",
                "start_date": "May 18, 2022",
                "onboarding_progress": 100,
                "status": "active",
                "attendance_status": "present_remote",
                "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
            },
            {
                "employee_code": "NX-1071",
                "full_name": "Devonte Washington",
                "email": "d.washington@acmeglobal.corp",
                "phone_number": "+1 (212) 555-0198",
                "role_title": "Director of Growth",
                "department": "Marketing & Growth",
                "work_location": "New York, NY",
                "employment_type": "Full-Time",
                "reports_to": "Sarah Jenkins (HR Director)",
                "base_salary": "155,000",
                "currency": "USD ($)",
                "assigned_role": "employee",
                "start_date": "Aug 22, 2022",
                "onboarding_progress": 100,
                "status": "active",
                "attendance_status": "present_office",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            },
            {
                "employee_code": "NX-1115",
                "full_name": "Priya Natarajan",
                "email": "p.natarajan@acmeglobal.corp",
                "phone_number": "+44 20 7946 0912",
                "role_title": "VP Strategic Enterprise Sales",
                "department": "Sales & Accounts",
                "work_location": "London, UK",
                "employment_type": "Full-Time",
                "reports_to": "Sarah Jenkins (HR Director)",
                "base_salary": "180,000",
                "currency": "USD ($)",
                "assigned_role": "employee",
                "start_date": "Nov 04, 2022",
                "onboarding_progress": 100,
                "status": "active",
                "attendance_status": "present_remote",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            },
            {
                "employee_code": "NX-1132",
                "full_name": "Liam Thorne",
                "email": "l.thorne@acmeglobal.corp",
                "phone_number": "+1 (416) 555-0143",
                "role_title": "Senior DevOps Engineer",
                "department": "Engineering",
                "work_location": "Toronto, CA (Hybrid)",
                "employment_type": "Full-Time",
                "reports_to": "Marcus Vance (Staff Architect)",
                "base_salary": "135,000",
                "currency": "USD ($)",
                "assigned_role": "employee",
                "start_date": "Nov 14, 2024",
                "onboarding_progress": 65,
                "status": "onboarding",
                "attendance_status": "present_office",
                "avatar_url": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
            },
            {
                "employee_code": "NX-1154",
                "full_name": "Aiko Tanaka",
                "email": "aiko.tanaka@acmeglobal.corp",
                "phone_number": "+81 3 5555 0184",
                "role_title": "FP&A Financial Analyst",
                "department": "Finance & Legal",
                "work_location": "Tokyo, JP (Remote)",
                "employment_type": "Full-Time",
                "reports_to": "Sarah Jenkins (HR Director)",
                "base_salary": "120,000",
                "currency": "USD ($)",
                "assigned_role": "employee",
                "start_date": "Feb 10, 2023",
                "onboarding_progress": 100,
                "status": "on_leave",
                "attendance_status": "on_leave",
                "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            },
        ]

        for emp_data in directory_emps:
            existing = db.query(Employee).filter(
                Employee.company_id == company.id,
                Employee.email == emp_data["email"],
            ).first()
            if existing:
                existing.employee_code = emp_data["employee_code"]
                existing.phone_number = emp_data["phone_number"]
                existing.work_location = emp_data["work_location"]
                existing.reports_to = emp_data["reports_to"]
                existing.base_salary = emp_data["base_salary"]
                existing.currency = emp_data["currency"]
                existing.assigned_role = emp_data["assigned_role"]
                existing.role_title = emp_data["role_title"]
                existing.avatar_url = emp_data["avatar_url"]
                existing.status = emp_data["status"]
            else:
                new_e = Employee(
                    company_id=company.id,
                    department_id=dept_map[emp_data["department"]].id,
                    employee_code=emp_data["employee_code"],
                    full_name=emp_data["full_name"],
                    email=emp_data["email"],
                    phone_number=emp_data["phone_number"],
                    role_title=emp_data["role_title"],
                    employment_type=emp_data["employment_type"],
                    work_location=emp_data["work_location"],
                    reports_to=emp_data["reports_to"],
                    base_salary=emp_data["base_salary"],
                    currency=emp_data["currency"],
                    assigned_role=emp_data["assigned_role"],
                    start_date=emp_data["start_date"],
                    onboarding_progress=emp_data["onboarding_progress"],
                    status=emp_data["status"],
                    attendance_status=emp_data["attendance_status"],
                    avatar_url=emp_data["avatar_url"],
                )
                db.add(new_e)
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
