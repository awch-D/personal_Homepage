"""
GitHub Data Synchronization Task
Fetches contribution data from GitHub API and stores in database
"""
import datetime
import httpx
from zoneinfo import ZoneInfo
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert

from app.core.config import get_settings
from app.core.database import async_session_maker
from app.models.github import GitHubContribution, GitHubStats


async def sync_github_contributions():
    """
    Sync GitHub contribution data to database
    Called daily at 3:30 AM Asia/Shanghai
    """
    settings = get_settings()
    
    if not settings.GITHUB_TOKEN:
        print("GitHub token not configured, skipping sync")
        return
    
    # Calculate date range: 365 days
    FETCH_DAYS = 365
    tz = ZoneInfo('Asia/Shanghai')
    now = datetime.datetime.now(tz)
    
    # End date logic (same as before)
    cutoff_time = now.replace(hour=3, minute=30, second=0, microsecond=0)
    if now < cutoff_time:
        end_date = (now - datetime.timedelta(days=1)).date()
    else:
        end_date = now.date()
    
    start_date = end_date - datetime.timedelta(days=FETCH_DAYS - 1)
    
    # GraphQL query
    from_iso = datetime.datetime.combine(start_date, datetime.time.min).isoformat() + "Z"
    to_iso = datetime.datetime.combine(end_date, datetime.time.max).isoformat() + "Z"
    
    query = f"""
    query {{
      viewer {{
        contributionsCollection(from: "{from_iso}", to: "{to_iso}") {{
          contributionCalendar {{
            totalContributions
            weeks {{
              contributionDays {{
                contributionCount
                date
              }}
            }}
          }}
        }}
      }}
    }}
    """
    
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
                "User-Agent": "Personal-Homepage-Backend"
            }
            response = await client.post(
                "https://api.github.com/graphql",
                json={"query": query},
                headers=headers,
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"❌ GitHub API error: {response.status_code}")
                print(f"Response body: {response.text}")
                return
            
            data = response.json()
            
            if "errors" in data:
                print(f"GitHub GraphQL errors: {data['errors']}")
                return
            
            calendar = data["data"]["viewer"]["contributionsCollection"]["contributionCalendar"]
            total_contributions = calendar["totalContributions"]
            
            # Flatten weeks
            raw_days = []
            for week in calendar["weeks"]:
                for day in week["contributionDays"]:
                    raw_days.append(day)
            
            # Calculate levels
            max_count = max((d["contributionCount"] for d in raw_days), default=0)
            
            contributions_data = []
            for day in raw_days:
                count = day["contributionCount"]
                
                # Calculate level (same logic as before)
                if count == 0:
                    level = 1
                elif max_count <= 4:
                    level = min(count + 1, 5)
                else:
                    ratio = count / max_count
                    if ratio <= 0.25:
                        level = 2
                    elif ratio <= 0.50:
                        level = 3
                    elif ratio <= 0.75:
                        level = 4
                    else:
                        level = 5
                
                contributions_data.append({
                    "date": datetime.date.fromisoformat(day["date"]),
                    "contribution_count": count,
                    "contribution_level": level
                })
            
            # Write to database
            async with async_session_maker() as db:
                # Upsert contributions
                stmt = insert(GitHubContribution).values(contributions_data)
                stmt = stmt.on_conflict_do_update(
                    index_elements=["date"],
                    set_={
                        "contribution_count": stmt.excluded.contribution_count,
                        "contribution_level": stmt.excluded.contribution_level,
                        "updated_at": datetime.datetime.now()
                    }
                )
                await db.execute(stmt)
                
                # Update stats
                stats_stmt = insert(GitHubStats).values({
                    "stat_key": "total_commits_year",
                    "stat_value": total_contributions
                })
                stats_stmt = stats_stmt.on_conflict_do_update(
                    index_elements=["stat_key"],
                    set_={
                        "stat_value": stats_stmt.excluded.stat_value,
                        "updated_at": datetime.datetime.now()
                    }
                )
                await db.execute(stats_stmt)
                
                await db.commit()
            
            print(f"✅ GitHub sync completed: {len(contributions_data)} days, {total_contributions} total contributions")
            
    except Exception as e:
        print(f"❌ GitHub sync failed: {e}")
        import traceback
        traceback.print_exc()
