#!/usr/bin/env python3
"""
Import personal profile data into database with vector embeddings
"""
import asyncio
import json
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.core.database import async_session_maker, engine
from app.services.embedding import embedding_service


async def clear_existing_data():
    """Clear existing data from tables"""
    async with async_session_maker() as session:
        await session.execute(text("TRUNCATE embeddings RESTART IDENTITY CASCADE"))
        await session.execute(text("TRUNCATE personal_info RESTART IDENTITY CASCADE"))
        await session.execute(text("TRUNCATE projects RESTART IDENTITY CASCADE"))
        await session.commit()
        print("✓ Cleared existing data")


async def import_profile(profile_path: str):
    """Import profile data from JSON file"""
    with open(profile_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    async with async_session_maker() as session:
        # Import personal info
        for category, items in data.get("personal_info", {}).items():
            if isinstance(items, list):
                for item in items:
                    await session.execute(
                        text("INSERT INTO personal_info (category, content) VALUES (:category, :content)"),
                        {"category": category, "content": item}
                    )
            else:
                await session.execute(
                    text("INSERT INTO personal_info (category, content) VALUES (:category, :content)"),
                    {"category": category, "content": str(items)}
                )
        
        # Import projects
        for project in data.get("projects", []):
            await session.execute(
                text("""
                    INSERT INTO projects (name, description, tech_stack, highlights, url)
                    VALUES (:name, :description, :tech_stack, :highlights, :url)
                """),
                {
                    "name": project.get("name", ""),
                    "description": project.get("description", ""),
                    "tech_stack": project.get("tech_stack", []),
                    "highlights": project.get("highlights", []),
                    "url": project.get("url", ""),
                }
            )
        
        await session.commit()
        print(f"✓ Imported {len(data.get('personal_info', {}))} categories and {len(data.get('projects', []))} projects")


async def generate_embeddings():
    """Generate embeddings for all content"""
    async with async_session_maker() as session:
        # Get all personal info
        result = await session.execute(
            text("SELECT id, category, content FROM personal_info")
        )
        personal_rows = result.fetchall()
        
        # Get all projects
        result = await session.execute(
            text("SELECT id, name, description, tech_stack, highlights FROM projects")
        )
        project_rows = result.fetchall()
        
        # Prepare texts for embedding
        texts = []
        sources = []
        
        for row in personal_rows:
            texts.append(f"{row.category}: {row.content}")
            sources.append(("personal_info", row.id))
        
        for row in project_rows:
            # Create rich text for project
            tech_str = ", ".join(row.tech_stack) if row.tech_stack else ""
            highlights_str = "; ".join(row.highlights) if row.highlights else ""
            content = f"项目: {row.name}\n描述: {row.description}\n技术栈: {tech_str}\n亮点: {highlights_str}"
            texts.append(content)
            sources.append(("project", row.id))
        
        if not texts:
            print("⚠ No content to embed")
            return
        
        print(f"⏳ Generating embeddings for {len(texts)} items...")
        
        # Generate embeddings in batches
        batch_size = 10
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            batch_sources = sources[i:i + batch_size]
            
            embeddings = await embedding_service.embed_texts(batch_texts)
            
            for text_content, embedding, (source_type, source_id) in zip(batch_texts, embeddings, batch_sources):
                embedding_str = "[" + ",".join(map(str, embedding)) + "]"
                await session.execute(
                    text("""
                        INSERT INTO embeddings (content, embedding, source_type, source_id)
                        VALUES (:content, CAST(:embedding AS vector), :source_type, :source_id)
                    """),
                    {
                        "content": text_content,
                        "embedding": embedding_str,
                        "source_type": source_type,
                        "source_id": source_id,
                    }
                )
            
            await session.commit()
            print(f"  ✓ Batch {i // batch_size + 1}/{(len(texts) + batch_size - 1) // batch_size}")
        
        print(f"✓ Generated {len(texts)} embeddings")


async def clear_cache():
    """Clear Redis cache"""
    from app.core.redis import get_redis
    redis_client = await get_redis()
    await redis_client.flushdb()
    print("✓ Cleared Redis cache")


async def main():
    """Main import function"""
    profile_path = Path(__file__).parent.parent / "data" / "personal_profile.json"
    
    if not profile_path.exists():
        print(f"❌ Profile file not found: {profile_path}")
        print("Creating sample profile...")
        
        # Create sample profile
        sample_profile = {
            "personal_info": {
                "profile": [
                    "我是 Arno，一名全栈工程师和 AI 应用开发者，专注于构建高效、可扩展的系统。"
                ],
                "skills": [
                    "后端开发: Python, FastAPI, Go, Node.js",
                    "AI/ML: RAG, 向量数据库, Prompt Engineering, LangChain",
                    "前端开发: React, Next.js, TypeScript, Vue.js",
                    "基础设施: Docker, Kubernetes, PostgreSQL, Redis"
                ],
                "experience": [
                    "5年全栈开发经验",
                    "专注于 AI 应用开发和系统架构设计"
                ],
                "contact": [
                    "邮箱: stevearno76@gmail.com",
                ]
            },
            "projects": [
                {
                    "name": "Personal Homepage",
                    "description": "集成 AI 智能体的个人主页，基于 RAG 技术回答访客问题",
                    "tech_stack": ["FastAPI", "Next.js", "PostgreSQL", "pgvector", "Redis"],
                    "highlights": ["流式对话", "向量检索", "Rerank 重排序", "多级缓存"],
                    "url": "https://arnostack.top"
                }
            ]
        }
        
        profile_path.parent.mkdir(parents=True, exist_ok=True)
        with open(profile_path, "w", encoding="utf-8") as f:
            json.dump(sample_profile, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Created sample profile at: {profile_path}")
    
    print("=" * 50)
    print("Personal Profile Import Script")
    print("=" * 50)
    
    print("\n[1/4] Clearing existing data...")
    await clear_existing_data()
    
    print("\n[2/4] Importing profile data...")
    await import_profile(str(profile_path))
    
    print("\n[3/4] Generating embeddings...")
    await generate_embeddings()
    
    print("\n[4/4] Clearing cache...")
    await clear_cache()
    
    print("\n" + "=" * 50)
    print("✓ Import completed successfully!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
