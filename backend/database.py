import json
import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import hashlib

DATABASE_URL = "sqlite:///./teamsync.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    github = Column(String, nullable=True)
    skills = Column(Text, default="[]")  # JSON string list
    domain = Column(String, nullable=True)
    personality = Column(String, default="balanced")
    work_style = Column(String, default="collaborative")
    experience_years = Column(Integer, default=0)

    # Relationships
    teams_created = relationship("Team", back_populates="creator", cascade="all, delete-orphan")
    memberships = relationship("TeamMember", back_populates="user", cascade="all, delete-orphan")

    def set_skills(self, skills_list):
        self.skills = json.dumps(skills_list)

    def get_skills(self):
        try:
            return json.loads(self.skills) if self.skills else []
        except:
            return []

    def verify_password(self, password: str) -> bool:
        return self.hash_password(password) == self.password_hash

    @staticmethod
    def hash_password(password: str) -> str:
        salt = "teamsync_salt_12345"
        pwd_bytes = password.encode('utf-8')
        salt_bytes = salt.encode('utf-8')
        hashed = hashlib.pbkdf2_hmac('sha256', pwd_bytes, salt_bytes, 100000)
        return hashed.hex()

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    creator = relationship("User", back_populates="teams_created")
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)

    # Relationships
    team = relationship("Team", back_populates="members")
    user = relationship("User", back_populates="memberships")

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    experience = Column(String, nullable=False)  # e.g., "5 years"
    skills = Column(Text, default="[]")  # JSON string list
    github = Column(String, nullable=True)
    avatar = Column(String, default="C")
    personality = Column(String, default="balanced")
    work_style = Column(String, default="collaborative")

    def set_skills(self, skills_list):
        self.skills = json.dumps(skills_list)

    def get_skills(self):
        try:
            return json.loads(self.skills) if self.skills else []
        except:
            return []

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed candidates if table is empty
        if db.query(Candidate).count() == 0:
            seed_candidates(db)
    finally:
        db.close()

def seed_candidates(db):
    sample_candidates = [
        Candidate(
            name="Sarah Johnson",
            role="DevOps Engineer",
            experience="5 years",
            skills=json.dumps(["Docker", "Kubernetes", "AWS", "CI/CD", "Terraform"]),
            github="sarah-j",
            avatar="S",
            personality="balanced",
            work_style="independent"
        ),
        Candidate(
            name="Michael Chen",
            role="UI/UX Designer",
            experience="3 years",
            skills=json.dumps(["Figma", "Adobe XD", "Design Systems", "Prototyping", "User Research"]),
            github="mchen-design",
            avatar="M",
            personality="extrovert",
            work_style="collaborative"
        ),
        Candidate(
            name="Priya Sharma",
            role="Backend Developer",
            experience="4 years",
            skills=json.dumps(["Node.js", "Python", "PostgreSQL", "GraphQL", "Django", "FastAPI"]),
            github="priya-dev",
            avatar="P",
            personality="introvert",
            work_style="independent"
        ),
        Candidate(
            name="Alex Rodriguez",
            role="Mobile Developer",
            experience="3 years",
            skills=json.dumps(["React Native", "Flutter", "Firebase", "iOS", "Android"]),
            github="alex-mobile",
            avatar="A",
            personality="balanced",
            work_style="collaborative"
        ),
        Candidate(
            name="Emma Wilson",
            role="UI/UX Designer",
            experience="5 years",
            skills=json.dumps(["Figma", "Adobe XD", "User Research", "Prototyping", "Sketch"]),
            github="ewilson-design",
            avatar="E",
            personality="extrovert",
            work_style="collaborative"
        ),
        Candidate(
            name="Alex Kumar",
            role="DevOps Engineer",
            experience="6 years",
            skills=json.dumps(["AWS", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible"]),
            github="alex-k",
            avatar="A",
            personality="introvert",
            work_style="independent"
        )
    ]
    db.add_all(sample_candidates)
    db.commit()
