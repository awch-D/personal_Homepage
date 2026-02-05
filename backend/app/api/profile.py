"""
Profile API Endpoints - Refactored Version
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import datetime

from app.core.database import get_db
from app.models.github import GitHubContribution, GitHubStats
from app.tasks.github_sync import sync_github_contributions
from app.schemas.profile import (
    ProfileInfo,
    GithubActivity,
    TechStackItem,
    FeaturedProject,
    CurrentFocus,
    SystemStatus
)

router = APIRouter()


@router.get("/info", response_model=ProfileInfo)
async def get_profile_info():
    """Get basic profile information"""
    return {
        "name": "Steve Arno",
        "title": "Full Stack Developer & AI Engineer",
        "bio": "Building intelligent systems with modern web technologies",
        "avatar_url": "/avatar.jpg",
        "status": "System Online"
    }


@router.get("/system-status", response_model=SystemStatus)
async def get_system_status():
    """Get system status"""
    return {
        "uptime": "99.9%",
        "last_deploy": "2026-01-15",
        "status": "System Online"
    }


@router.get("/github-activity", response_model=GithubActivity)
async def get_github_activity(db: AsyncSession = Depends(get_db)):
    """
    Get GitHub contribution heatmap data from database
    Falls back to live API if database is empty
    """
    # Visual range: 32 weeks = 224 days
    VISUAL_DAYS = 32 * 7
    
    try:
        # Get last 224 days from database
        result = await db.execute(
            select(GitHubContribution)
            .order_by(desc(GitHubContribution.date))
            .limit(VISUAL_DAYS)
        )
        contributions = result.scalars().all()
        
        # Get total commits stat
        stats_result = await db.execute(
            select(GitHubStats)
            .where(GitHubStats.stat_key == "total_commits_year")
        )
        stats = stats_result.scalar_one_or_none()
        
        # If no data, trigger sync and retry
        if not contributions:
            print("No GitHub data in database, triggering sync...")
            await sync_github_contributions()
            
            # Retry query
            result = await db.execute(
                select(GitHubContribution)
                .order_by(desc(GitHubContribution.date))
                .limit(VISUAL_DAYS)
            )
            contributions = result.scalars().all()
            
            stats_result = await db.execute(
                select(GitHubStats)
                .where(GitHubStats.stat_key == "total_commits_year")
            )
            stats = stats_result.scalar_one_or_none()
        
        # Build heatmap (reverse to get chronological order)
        heatmap = [
            {
                "level": c.contribution_level,
                "count": c.contribution_count,
                "date": c.date.isoformat()
            }
            for c in reversed(contributions)
        ]
        
        # Pad if needed
        if len(heatmap) < VISUAL_DAYS:
            needed = VISUAL_DAYS - len(heatmap)
            today = datetime.date.today()
            padding = [
                {
                    "level": 1,
                    "count": 0,
                    "date": (today - datetime.timedelta(days=VISUAL_DAYS - 1 - i)).isoformat()
                }
                for i in range(needed)
            ]
            heatmap = padding + heatmap
        
        return {
            "total_commits_year": stats.stat_value if stats else 0,
            "uptime_reliability": 99.9,
            "active_sprint": "Active",
            "heatmap": heatmap
        }
        
    except Exception as e:
        print(f"Database query error: {e}")
        import traceback
        traceback.print_exc()
        
        # Fallback: empty data
        today = datetime.date.today()
        heatmap = [
            {
                "level": 1,
                "count": 0,
                "date": (today - datetime.timedelta(days=VISUAL_DAYS - 1 - i)).isoformat()
            }
            for i in range(VISUAL_DAYS)
        ]
        
        return {
            "total_commits_year": 0,
            "uptime_reliability": 99.9,
            "active_sprint": "Active",
            "heatmap": heatmap
        }


@router.get("/tech-stack", response_model=List[TechStackItem])
async def get_tech_stack():
    """Get technology stack"""
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
    """Get featured project info"""
    return {
        "title": "DeepSea Vision",
        "description": "Real-time object detection model for autonomous underwater vehicles.",
        "image_url": "https://lh3.googleusercontent.com/aida-public/AB6AXuAY5Ulzi00bkAldRjx1BdqxlBM8gCPBma5HyTLnyWCIc67mffuArB51PrbJfpYgM7O_jtiIaey-6p4YdlM12AJ-uj1079WM8N7mIjkELabYKaKvS0I_dE7EQJmKabofkkmujb26YyjEcPebobRgqI0dejEcGrSo6NUk-Fqh7x_i1CFFwFW3sxZ1pDSStCot1iJcogNh6Yvqri3zxVGWTwKaND6Rn--D618kD3-FXFQCIqaWv4kOJyd1CD0amS9He-QcDqlUi6mdAx6t",
        "stats": ["99.2% Accuracy"],
        "tags": ["code", "analytics"]
    }


@router.get("/current-focus", response_model=CurrentFocus)
async def get_current_focus():
    """Get current focus info"""
    return {
        "topic": "Multi-Agent Systems",
        "subtitle": "Orchestration & Logic",
        "progress": 85,
        "efficiency": 85
    }


@router.post("/admin/sync-github")
async def manual_sync_github():

    """
    Manually trigger GitHub data synchronization
    Admin endpoint for testing or force refresh
    """
    try:
        await sync_github_contributions()
        return {"status": "success", "message": "GitHub data synced successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

