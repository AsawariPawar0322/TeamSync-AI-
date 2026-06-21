import os
import jwt
import datetime
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from pydantic import BaseModel

from database import engine, SessionLocal, init_db, User, Team, TeamMember, Candidate
from resume_parser import parse_resume
from ml_engine import predict_team_metrics, calculate_compatibility

# Initialize database
init_db()

app = FastAPI(title="TeamSync AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "teamsync_super_secret_key"
ALGORITHM = "HS256"

# Dependency to get db session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas
class RegisterSchema(BaseModel):
    name: str
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str

class ProfileUpdateSchema(BaseModel):
    github: Optional[str] = None
    skills: List[str]
    domain: Optional[str] = None
    personality: Optional[str] = "balanced"
    workStyle: Optional[str] = "collaborative"
    experience_years: Optional[int] = 2

class TeamCreateSchema(BaseModel):
    name: str

class MemberInviteSchema(BaseModel):
    email: str
    role: str
    skills: Optional[List[str]] = None
    personality: Optional[str] = "balanced"
    workStyle: Optional[str] = "collaborative"

# JWT Auth Helper
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # If no token, return a default mock user for development ease
    if not authorization:
        default_user = db.query(User).filter(User.email == "demo@teamsync.ai").first()
        if not default_user:
            default_user = User(
                name="Demo User",
                email="demo@teamsync.ai",
                password_hash=User.hash_password("password123"),
                skills="[\"React\", \"JavaScript\", \"Python\"]",
                domain="Full Stack Developer",
                experience_years=3
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
        return default_user
        
    try:
        token = authorization.split(" ")[1] if " " in authorization else authorization
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/")
def read_root():
    return {"message": "TeamSync AI API", "status": "running"}

@app.post("/api/auth/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        name=data.name,
        email=data.email,
        password_hash=User.hash_password(data.password),
        skills="[]",
        domain=""
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token({"sub": new_user.email})
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "skills": [],
            "domain": "",
            "github": ""
        }
    }

@app.post("/api/auth/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not user.verify_password(data.password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    token = create_access_token({"sub": user.email})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "skills": user.get_skills(),
            "domain": user.domain,
            "github": user.github,
            "personality": user.personality,
            "workStyle": user.work_style,
            "experience_years": user.experience_years
        }
    }

@app.get("/api/profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "skills": current_user.get_skills(),
        "domain": current_user.domain,
        "github": current_user.github,
        "personality": current_user.personality,
        "workStyle": current_user.work_style,
        "experience_years": current_user.experience_years
    }

@app.post("/api/profile/update")
def update_profile(data: ProfileUpdateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.github = data.github
    current_user.set_skills(data.skills)
    current_user.domain = data.domain
    current_user.personality = data.personality
    current_user.work_style = data.workStyle
    current_user.experience_years = data.experience_years
    
    db.commit()
    db.refresh(current_user)
    return {
        "message": "Profile updated",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "skills": current_user.get_skills(),
            "domain": current_user.domain,
            "github": current_user.github,
            "personality": current_user.personality,
            "workStyle": current_user.work_style,
            "experience_years": current_user.experience_years
        }
    }

# Team Endpoints
@app.post("/api/teams")
def create_team(data: TeamCreateSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_team = Team(name=data.name, creator_id=current_user.id)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    
    # Automatically add creator as a Lead member
    creator_member = TeamMember(
        team_id=new_team.id,
        user_id=current_user.id,
        role="Team Lead"
    )
    db.add(creator_member)
    db.commit()
    
    # Format and return team details
    return {
        "id": new_team.id,
        "name": new_team.name,
        "creator": current_user.name,
        "members": [{
            "name": current_user.name,
            "role": "Team Lead",
            "skills": current_user.get_skills(),
            "personality": current_user.personality,
            "workStyle": current_user.work_style,
            "isCreator": True
        }],
        "compatibility": 100
    }

@app.get("/api/teams")
def get_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find teams created by user OR where user is a member
    teams_created = db.query(Team).filter(Team.creator_id == current_user.id).all()
    memberships = db.query(TeamMember).filter(TeamMember.user_id == current_user.id).all()
    
    team_ids = set([t.id for t in teams_created] + [m.team_id for m in memberships])
    
    teams = db.query(Team).filter(Team.id.in_(team_ids)).all() if team_ids else []
    
    result = []
    for team in teams:
        members_list = []
        for m in team.members:
            u = m.user
            members_list.append({
                "id": u.id,
                "name": u.name,
                "role": m.role,
                "skills": u.get_skills(),
                "personality": u.personality,
                "workStyle": u.work_style,
                "experience_years": u.experience_years,
                "isCreator": u.id == team.creator_id
            })
            
        # Calculate compatibility
        compatibility = calculate_compatibility(members_list)
        
        result.append({
            "id": team.id,
            "name": team.name,
            "creator": team.creator.name,
            "members": members_list,
            "compatibility": compatibility,
            "createdAt": team.created_at.isoformat()
        })
    return result

@app.post("/api/teams/{team_id}/invite")
def invite_member(team_id: int, data: MemberInviteSchema, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    # Check if invited user exists. If not, create a mock user for the demo!
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Create a mock user account for the invited person
        name_part = data.email.split("@")[0]
        user = User(
            name=name_part.replace(".", " ").title(),
            email=data.email,
            password_hash=User.hash_password("password123"),
            personality=data.personality,
            work_style=data.workStyle,
            domain=data.role,
            experience_years=3
        )
        user.set_skills(data.skills if data.skills else ["React", "JavaScript"])
        db.add(user)
        db.commit()
        db.refresh(user)
        
    # Check if already a member
    existing_member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user.id).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User already in team")
        
    new_member = TeamMember(
        team_id=team_id,
        user_id=user.id,
        role=data.role
    )
    db.add(new_member)
    db.commit()
    
    return {"message": "Invitation sent & accepted", "user_id": user.id}

@app.delete("/api/teams/{team_id}/members/{user_id}")
def remove_member(team_id: int, user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    # Check if user is the creator or removing themselves
    if team.creator_id != current_user.id and user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to remove members")
        
    member = db.query(TeamMember).filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db.delete(member)
    db.commit()
    return {"message": "Member removed successfully"}

# Dynamic AI Insights / Predictions / Analysis
@app.get("/api/teams/{team_id}/analysis")
def get_team_analysis(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    members_list = []
    for m in team.members:
        u = m.user
        members_list.append({
            "name": u.name,
            "skills": u.get_skills(),
            "personality": u.personality,
            "work_style": u.work_style,
            "experience_years": u.experience_years
        })
        
    # Get ML Predictions
    predictions = predict_team_metrics(members_list)
    
    # Calculate skill coverage
    all_skills = [s.lower() for m in members_list for s in m["skills"]]
    
    skill_coverage = {
        "frontend": any(any(k in s for k in ["react", "frontend", "vue", "angular", "html", "css"]) for s in all_skills),
        "backend": any(any(k in s for k in ["backend", "node", "python", "django", "fastapi", "spring", "golang", "go", "ruby"]) for s in all_skills),
        "ai_ml": any(any(k in s for k in ["ai", "ml", "machine", "learning", "deep", "nlp", "tensorflow", "pytorch"]) for s in all_skills),
        "devops": any(any(k in s for k in ["devops", "docker", "kubernetes", "jenkins", "terraform", "aws", "gcp", "azure"]) for s in all_skills),
        "ui_ux": any(any(k in s for k in ["ui", "ux", "design", "figma", "sketch", "adobe"]) for s in all_skills),
        "mobile": any(any(k in s for k in ["mobile", "react native", "flutter", "ios", "android"]) for s in all_skills)
    }
    
    # Leadership distribution
    leaders = sum(1 for m in members_list if m["work_style"] == "leader")
    collaborative = sum(1 for m in members_list if m["work_style"] == "collaborative")
    independent = sum(1 for m in members_list if m["work_style"] == "independent")
    
    # Generate contextual Strengths and Risks based on numbers
    strengths = []
    risks = []
    
    if predictions["compatibility_score"] >= 80:
        strengths.append(f"High team compatibility ({predictions['compatibility_score']}%) indicates smooth collaboration potential")
    if len(set(all_skills)) >= 6:
        strengths.append(f"Diverse skill set with {len(set(all_skills))} unique technologies covered")
    if leaders == 1:
        strengths.append("Optimal leadership structure: exactly one natural leader provides clear direction")
    elif leaders == 0:
        risks.append("No designated leader: consider assigning project ownership to prevent lack of direction")
    elif leaders > 1:
        risks.append(f"Multiple leaders ({leaders}) may lead to decision-making conflicts; define roles clearly")
        
    if not skill_coverage["devops"]:
        risks.append("Missing DevOps expertise: deployment automation and CI/CD pipelines may face delays")
    if not skill_coverage["ui_ux"]:
        risks.append("Missing UI/UX design: user interface design might lack polish and usability focus")
    if not skill_coverage["backend"]:
        risks.append("No backend developer: server-side functionality and database integration is key")
        
    if len(members_list) < 3:
        risks.append("Team size below recommended minimum of 3 members: risk of workload bottleneck")
        
    # Recommendations
    recommendations = []
    if not skill_coverage["devops"]:
        recommendations.append({
            "type": "hire",
            "role": "DevOps Engineer",
            "reason": "Missing cloud deployment and infrastructure automation skills."
        })
    if not skill_coverage["ui_ux"]:
        recommendations.append({
            "type": "hire",
            "role": "UI/UX Designer",
            "reason": "Ensure a smooth user interface design and prototype verification."
        })
    if leaders == 0:
        recommendations.append({
            "type": "process",
            "role": "Project Owner",
            "reason": "Appoint a team member to make final architectural and administrative decisions."
        })
        
    return {
        "compatibility_score": predictions["compatibility_score"],
        "success_probability": predictions["success_rate"],
        "retention_forecast": predictions["retention_rate"],
        "conflict_risk": predictions["conflict_risk"],
        "skill_coverage": skill_coverage,
        "leadership": {
            "leaders": leaders,
            "collaborative": collaborative,
            "independent": independent
        },
        "strengths": strengths,
        "risks": risks,
        "recommendations": recommendations
    }

# Talent Matching
@app.get("/api/teams/{team_id}/talent")
def find_talent_for_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    team_skills = set(s.lower() for m in team.members for s in m.user.get_skills())
    
    # Identify missing skills category
    missing = []
    all_skills = [s.lower() for m in team.members for s in m.user.get_skills()]
    
    if not any("devops" in s or "docker" in s or "aws" in s for s in all_skills):
        missing.append("DevOps Engineer")
    if not any("ui" in s or "ux" in s or "design" in s for s in all_skills):
        missing.append("UI/UX Designer")
    if not any("react native" in s or "flutter" in s or "mobile" in s for s in all_skills):
        missing.append("Mobile Developer")
        
    # Get candidates from DB
    candidates = db.query(Candidate).all()
    result = []
    
    for c in candidates:
        candidate_skills = set(s.lower() for s in c.get_skills())
        
        # Calculate skill match percentage
        intersection = candidate_skills.intersection(team_skills)
        # Match is based on how many new useful skills they bring or overlap
        overlap_pct = (len(intersection) / max(len(candidate_skills), 1)) * 100
        
        # If they match a missing role, they get a boost
        role_boost = 25 if c.role in missing else 0
        skill_match = int(min(98, 70 + (overlap_pct * 0.2) + role_boost))
        
        # Calculate compatibility if added to team
        mock_members = []
        for m in team.members:
            mock_members.append({
                "skills": m.user.get_skills(),
                "personality": m.user.personality,
                "work_style": m.user.work_style
            })
        mock_members.append({
            "skills": c.get_skills(),
            "personality": c.personality,
            "work_style": c.work_style
        })
        
        comp_score = int(round(calculate_compatibility(mock_members)))
        
        result.append({
            "id": c.id,
            "name": c.name,
            "role": c.role,
            "experience": c.experience,
            "skills": c.get_skills(),
            "github": c.github,
            "avatar": c.avatar,
            "skillMatch": skill_match,
            "compatibilityScore": comp_score,
            "personality": c.personality,
            "workStyle": c.work_style,
            "reason": f"Matches team gaps with strong {c.role} experience."
        })
        
    # Sort by compatibility
    result.sort(key=lambda x: x["compatibilityScore"], reverse=True)
    return result

# Team Discovery / Matching
@app.get("/api/discover-teams")
def discover_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_skills = set(s.lower() for s in current_user.get_skills())
    
    # Mock some available teams looking for members
    mock_teams = [
        {
            "id": "disc-1",
            "name": "AI Innovators",
            "description": "Building next-gen AI solutions",
            "members": 3,
            "requiredSkills": ["React", "Python", "Machine Learning"],
            "domain": "AI/ML",
            "lookingFor": "Frontend Developer",
            "personality": "extrovert"
        },
        {
            "id": "disc-2",
            "name": "FinTech Builders",
            "description": "Revolutionizing financial technology",
            "members": 4,
            "requiredSkills": ["Node.js", "React", "Blockchain"],
            "domain": "FinTech",
            "lookingFor": "Backend Developer",
            "personality": "balanced"
        },
        {
            "id": "disc-3",
            "name": "HealthTech Squad",
            "description": "Healthcare solutions for everyone",
            "members": 2,
            "requiredSkills": ["React Native", "Firebase", "UI/UX"],
            "domain": "HealthTech",
            "lookingFor": "Mobile Developer",
            "personality": "introvert"
        },
        {
            "id": "disc-4",
            "name": "DevOps Masters",
            "description": "Cloud infrastructure experts",
            "members": 3,
            "requiredSkills": ["AWS", "Docker", "Kubernetes"],
            "domain": "DevOps",
            "lookingFor": "Cloud Engineer",
            "personality": "balanced"
        }
    ]
    
    result = []
    for t in mock_teams:
        req_set = set(s.lower() for s in t["requiredSkills"])
        matches = user_skills.intersection(req_set)
        
        # Calculate compatibility
        comp = int(min(95, 75 + len(matches) * 8))
        result.append({
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "members": t["members"],
            "requiredSkills": t["requiredSkills"],
            "domain": t["domain"],
            "lookingFor": t["lookingFor"],
            "compatibility": comp
        })
        
    return result

# AI Role Assignment
@app.get("/api/teams/{team_id}/roles")
def get_ai_role_assignment(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    # We assign standard project roles: Lead, Frontend, Backend, UI/UX, DevOps, AI Engineer
    # based on technical skills and work styles.
    members = team.members
    result = []
    
    roles_definition = [
        {"role": "Team Lead", "skills": ["management", "agile", "architecture", "lead"], "style": "leader"},
        {"role": "Frontend Developer", "skills": ["react", "javascript", "typescript", "html", "css", "vue", "angular"], "style": "collaborative"},
        {"role": "Backend Developer", "skills": ["python", "node.js", "django", "fastapi", "spring", "database", "postgresql", "mysql"], "style": "independent"},
        {"role": "DevOps Engineer", "skills": ["docker", "kubernetes", "aws", "azure", "jenkins", "terraform", "ci/cd"], "style": "independent"},
        {"role": "UI/UX Designer", "skills": ["figma", "adobe xd", "design", "wireframing", "sketch"], "style": "collaborative"},
        {"role": "AI/ML Engineer", "skills": ["machine learning", "ml", "nlp", "ai", "tensorflow", "pytorch", "deep learning"], "style": "independent"}
    ]
    
    for m in members:
        u = m.user
        user_skills = [s.lower() for s in u.get_skills()]
        
        # Find best role for this user
        best_role = "Software Developer"
        best_score = 0
        
        for rd in roles_definition:
            skill_score = sum(3 for s in user_skills if any(k in s for k in rd["skills"]))
            style_score = 5 if u.work_style == rd["style"] else 2
            
            # Boost if user's current role contains part of the target role name
            role_boost = 10 if rd["role"].lower() in m.role.lower() else 0
            
            total_score = skill_score + style_score + role_boost
            if total_score > best_score:
                best_score = total_score
                best_role = rd["role"]
                
        # Confidence score
        match_score = int(min(98, 75 + best_score))
        
        # Contextual explanation
        explanation = f"Assigned to {best_role} based on "
        if best_score > 5:
            matching_skills = [s for s in u.get_skills() if any(k in s.lower() for k in [r for r in roles_definition if r["role"] == best_role][0]["skills"])]
            explanation += f"expertise in {', '.join(matching_skills[:3])} "
        else:
            explanation += f"suitable work style profile "
            
        explanation += f"and a natural '{u.work_style}' personality."
        
        result.append({
            "role": best_role,
            "assignedTo": u.name,
            "reason": explanation,
            "score": match_score,
            "skills_score": match_score - 2,
            "experience_score": min(95, 70 + u.experience_years * 5),
            "fit_score": match_score + 1
        })
        
    return result

# Resume parser
@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Extract skills and experience from PDF resume dynamically."""
    contents = await file.read()
    try:
        parsed = parse_resume(contents, file.filename)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing resume: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Train models on startup
    from ml_engine import train_models
    train_models()
    uvicorn.run(app, host="0.0.0.0", port=8000)
