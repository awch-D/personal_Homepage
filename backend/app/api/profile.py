from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

# Response Models
class ProfileInfo(BaseModel):
    name: str
    title: str
    bio: str
    avatar_url: str
    status: str

class GithubActivity(BaseModel):
    total_commits_year: int
    uptime_reliability: float
    # In a real app this might be a complex heatmap data structure
    # For now we'll simulate the summary stats
    active_sprint: str

class TechStackItem(BaseModel):
    name: str
    icon: str # Material Symbol name
    highlight: bool
    description: Optional[str] = None

class FeaturedProject(BaseModel):
    title: str
    description: str
    image_url: str
    stats: List[str] # e.g. ["99.2% Accuracy", "Real-time"]
    tags: List[str] # e.g. ["computer_vision", "robotics"]

class CurrentFocus(BaseModel):
    topic: str
    subtitle: str
    progress: int # 0-100
    efficiency: int # 0-100

# Endpoints

@router.get("/info", response_model=ProfileInfo)
async def get_profile_info():
    return {
        "name": "STEVE ARNO", # Updated for individual identity
        "title": "ROOT_USER", 
        "bio": "Engineering the next generation of neural interfaces and high-performance decentralized systems.",
        "avatar_url": "/images/avatar.png", # Placeholder
        "status": "System Online"
    }

@router.get("/github-activity", response_model=GithubActivity)
async def get_github_activity():
    return {
        "total_commits_year": 2482,
        "uptime_reliability": 98.4,
        "active_sprint": "Active"
    }

@router.get("/tech-stack", response_model=List[TechStackItem])
async def get_tech_stack():
    return [
        {"name": "Java", "icon": "coffee", "highlight": False, "description": "Enterprise Backend"},
        {"name": "Python", "icon": "api", "highlight": False, "description": "Backend & AI"},
        {"name": "Dify", "icon": "hub", "highlight": True, "description": "LLM Orchestration"},
        {"name": "PyTorch", "icon": "deployed_code", "highlight": True, "description": "Neural Networks"},
        {"name": "React", "icon": "data_object", "highlight": False, "description": "Frontend Interface"},
        {"name": "PostgreSQL", "icon": "database", "highlight": False, "description": "Data Persistence"}
    ]

@router.get("/featured-project", response_model=FeaturedProject)
async def get_featured_project():
    return {
        "title": "DeepSea Vision",
        "description": "Real-time object detection model for autonomous underwater vehicles.",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Ulzi00bkAldRjx1BdqxlBM8gCPBma5HyTLnyWCIc67mffuArB51PrbJfpYgM7O_jtiIaey-6p4YdlM12AJ-uj1079WM8N7mIjkELabYKaKvS0I_dE7EQJmKabofkkmujb26YyjEcPebobRgqI0dejEcGrSo6NUk-Fqh7x_i1CFFwFW3sxZ1pDSStCot1iJcogNh6Yvqri3zxVGWTwKaND6Rn--D618kD3-FXFQCIqaWv4kOJyd1CD0amS9He-QcDqlUi6mdAx6t",
        "stats": ["99.2% Accuracy"],
        "tags": ["code", "analytics"]
    }

@router.get("/current-focus", response_model=CurrentFocus)
async def get_current_focus():
    return {
        "topic": "Multi-Agent Systems",
        "subtitle": "Orchestration & Logic",
        "progress": 85,
        "efficiency": 85
    }
