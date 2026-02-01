"""
APScheduler Configuration and Initialization
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from pytz import timezone

from app.tasks.github_sync import sync_github_contributions


# Global scheduler instance
scheduler = AsyncIOScheduler()


def init_scheduler():
    """Initialize and start the scheduler"""
    
    # Schedule GitHub sync at 3:30 AM Asia/Shanghai daily
    scheduler.add_job(
        sync_github_contributions,
        trigger=CronTrigger(
            hour=3,
            minute=30,
            timezone=timezone('Asia/Shanghai')
        ),
        id='github_sync',
        name='Sync GitHub Contributions',
        replace_existing=True
    )
    
    scheduler.start()
    print("✅ Scheduler started - GitHub sync scheduled at 3:30 AM daily")


def shutdown_scheduler():
    """Gracefully shutdown the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler shut down")
