from pydantic import BaseModel
from typing import List, Optional

class ProfileInfo(BaseModel):
    name: str
    title: str
    bio: str
    avatar_url: str
    status: str

class ContributionDay(BaseModel):
    level: int  # 1-5
    count: int
    date: str  # YYYY-MM-DD

class GithubActivity(BaseModel):
    total_commits_year: int
    uptime_reliability: float
    heatmap: List[ContributionDay]

class TechStackItem(BaseModel):
    name: str
    icon: str  # Material Symbol name
    highlight: bool
    description: Optional[str] = None

class FeaturedProject(BaseModel):
    title: str
    description: str
    image_url: str
    stats: List[str]
    tags: List[str]

class CurrentFocus(BaseModel):
    topic: str
    subtitle: str
    progress: int
    efficiency: int

class SystemStatus(BaseModel):
    uptime: str
    last_deploy: str
    status: str
