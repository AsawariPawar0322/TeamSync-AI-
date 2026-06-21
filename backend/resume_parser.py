import re
import io
import pdfplumber
import PyPDF2
from typing import List, Dict, Tuple

# Predefined dictionary of skills categorized
SKILLS_DICTIONARY = {
    # Frontend
    "react", "javascript", "typescript", "html", "css", "tailwind", "angular", "vue", "next.js", 
    "frontend", "bootstrap", "web development", "sass", "less", "webpack",
    
    # Backend
    "python", "node.js", "node", "express", "django", "fastapi", "flask", "ruby", "rails", "php", 
    "laravel", "java", "spring", "spring boot", "c++", "c#", "go", "golang", "rust", "backend", 
    "rest api", "graphql", "microservices",
    
    # Databases
    "postgresql", "postgres", "mysql", "mongodb", "sqlite", "redis", "oracle", "cassandra", 
    "sql", "nosql", "dynamodb",
    
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", 
    "devops", "ci/cd", "jenkins", "terraform", "ansible", "linux", "git", "github", "gitlab", 
    "nginx", "apache",
    
    # UI/UX & Design
    "figma", "adobe xd", "sketch", "photoshop", "illustrator", "ui/ux", "design systems", 
    "wireframing", "prototyping", "user research", "interaction design",
    
    # Mobile
    "react native", "flutter", "swift", "kotlin", "android", "ios", "objective-c", "mobile",
    
    # AI / ML
    "machine learning", "ml", "artificial intelligence", "ai", "deep learning", "nlp", 
    "natural language processing", "computer vision", "tensorflow", "pytorch", "keras", 
    "scikit-learn", "pandas", "numpy", "spacy", "data science", "llm", "large language models", 
    "huggingface", "opencv"
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using pdfplumber with a fallback to PyPDF2."""
    text = ""
    # Try pdfplumber first
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber failed: {e}. Falling back to PyPDF2.")
        text = ""

    # Fallback to PyPDF2 if text is empty
    if not text.strip():
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as e:
            print(f"PyPDF2 failed: {e}")
            
    return text

def parse_experience(text: str) -> int:
    """Extract years of experience using regex patterns."""
    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience",
        r"experience\s*[:\-]?\s*(\d+)\+?\s*(?:years?|yrs?)",
        r"worked\s*for\s*(\d+)\+?\s*(?:years?|yrs?)",
        r"(\d+)\+?\s*(?:years?|yrs?)\s*in\s*industry",
        r"(\d+)\+?\s*(?:years?|yrs?)\s*exp"
    ]
    
    max_years = 0
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                years = int(match)
                if years > max_years:
                    max_years = years
            except ValueError:
                pass
                
    # If no explicit years of experience, check for date ranges like 2018 - 2022
    if max_years == 0:
        date_patterns = [
            r"(?:19|20)\d{2}\s*[-–—]\s*(?:present|(?:19|20)\d{2})",
            r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2}\s*[-–—]\s*(?:present|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2})",
            r"\b(?:19|20)\d{2}\b"
        ]
        
        # Calculate approximate duration based on distinct years mentioned
        all_years = re.findall(r"\b(19\d{2}|20\d{2})\b", text)
        if all_years:
            unique_years = sorted(list(set(map(int, all_years))))
            if len(unique_years) >= 2:
                span = unique_years[-1] - unique_years[0]
                max_years = max(1, min(span, 15))  # Keep it reasonable
                
    # Default to 2 years if nothing detected
    return max_years if max_years > 0 else 2

def parse_skills(text: str) -> List[str]:
    """Scan resume text against predefined skills dictionary."""
    text_lower = text.lower()
    
    # We want to match exact skills. Some skills are phrases (like "machine learning"), 
    # while others are words (like "python"). 
    detected_skills = []
    
    # Simple search for each skill in dictionary
    for skill in SKILLS_DICTIONARY:
        # Match as word boundary to avoid substrings (e.g. "go" in "google")
        # Except for skills with special characters like c++, c#, .net, node.js
        if any(char in skill for char in ['+', '#', '.', '/']):
            pattern = re.escape(skill)
        else:
            pattern = r"\b" + re.escape(skill) + r"\b"
            
        if re.search(pattern, text_lower):
            # Format nicely
            formatted_skill = skill
            # Capitalize some common ones
            caps = {
                "python": "Python", "javascript": "JavaScript", "typescript": "TypeScript", 
                "html": "HTML", "css": "CSS", "aws": "AWS", "gcp": "GCP", "ci/cd": "CI/CD", 
                "ui/ux": "UI/UX", "sql": "SQL", "nosql": "NoSQL", "mongodb": "MongoDB", 
                "postgresql": "PostgreSQL", "mysql": "MySQL", "sqlite": "SQLite", 
                "react": "React", "angular": "Angular", "vue": "Vue", "next.js": "Next.js", 
                "node.js": "Node.js", "django": "Django", "fastapi": "FastAPI", "flask": "Flask", 
                "docker": "Docker", "kubernetes": "Kubernetes", "jenkins": "Jenkins", 
                "terraform": "Terraform", "ansible": "Ansible", "git": "Git", "github": "GitHub", 
                "figma": "Figma", "java": "Java", "c++": "C++", "c#": "C#", "go": "Go", 
                "golang": "Golang", "rust": "Rust", "solidity": "Solidity", "web3": "Web3", 
                "react native": "React Native", "flutter": "Flutter", "nlp": "NLP", 
                "ai": "AI", "ml": "ML", "llm": "LLM"
            }
            if skill in caps:
                formatted_skill = caps[skill]
            else:
                formatted_skill = skill.title()
                
            detected_skills.append(formatted_skill)
            
    # Clean up duplicate names (e.g. Node and Node.js)
    final_skills = []
    seen = set()
    for s in detected_skills:
        s_low = s.lower()
        if s_low == "node" and "Node.js" in detected_skills:
            continue
        if s_low == "golang" and "Go" in detected_skills:
            continue
        if s_low not in seen:
            seen.add(s_low)
            final_skills.append(s)
            
    return final_skills

def parse_resume(file_bytes: bytes, filename: str) -> Dict:
    """Parse resume bytes and extract skills, experience, and estimated domain."""
    text = extract_text_from_pdf(file_bytes)
    
    skills = parse_skills(text)
    experience_years = parse_experience(text)
    
    # Determine domain based on skills
    skills_set = set(s.lower() for s in skills)
    
    domain = "Software Engineer"
    
    frontend_skills = {"react", "angular", "vue", "next.js", "html", "css", "ui/ux", "figma", "tailwind"}
    backend_skills = {"python", "django", "fastapi", "flask", "node.js", "node", "express", "postgresql", "mysql", "mongodb", "redis", "java", "spring boot", "golang", "go", "rust"}
    devops_skills = {"aws", "docker", "kubernetes", "jenkins", "terraform", "ansible", "ci/cd", "gcp", "azure"}
    ai_ml_skills = {"machine learning", "ml", "deep learning", "nlp", "tensorflow", "pytorch", "keras", "scikit-learn", "data science", "llm"}
    mobile_skills = {"react native", "flutter", "android", "ios", "swift", "kotlin"}
    
    scores = {
        "Frontend Developer": len(skills_set.intersection(frontend_skills)),
        "Backend Developer": len(skills_set.intersection(backend_skills)),
        "DevOps Engineer": len(skills_set.intersection(devops_skills)),
        "AI/ML Engineer": len(skills_set.intersection(ai_ml_skills)),
        "Mobile Developer": len(skills_set.intersection(mobile_skills))
    }
    
    max_score_domain = max(scores, key=scores.get)
    if scores[max_score_domain] > 0:
        domain = max_score_domain
        
    return {
        "filename": filename,
        "skills": skills,
        "experience": f"{experience_years} years",
        "experience_years": experience_years,
        "domain": domain
    }
