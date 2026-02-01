"""
GitHub Contributions Database Models
"""
from datetime import datetime, date
from sqlalchemy import Integer, String, Date, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class GitHubContribution(Base):
    """GitHub daily contribution records"""
    __tablename__ = "github_contributions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    date: Mapped[date] = mapped_column(Date, unique=True, nullable=False, index=True)
    contribution_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    contribution_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now()
    )


class GitHubStats(Base):
    """GitHub statistics cache"""
    __tablename__ = "github_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    stat_key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    stat_value: Mapped[int] = mapped_column(Integer, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        server_default=func.now(), 
        onupdate=func.now()
    )
