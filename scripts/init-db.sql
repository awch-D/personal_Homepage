-- ===========================================
-- Personal Homepage Database Initialization
-- ===========================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ===========================================
-- Tables
-- ===========================================

-- Personal information table
CREATE TABLE IF NOT EXISTS personal_info (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Embeddings table (vector storage)
CREATE TABLE IF NOT EXISTS embeddings (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1024) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================
-- Indexes
-- ===========================================

-- Category index for personal_info
CREATE INDEX IF NOT EXISTS idx_personal_info_category 
ON personal_info(category);

-- Source index for embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_source 
ON embeddings(source_type, source_id);

-- HNSW index for vector similarity search
-- Using cosine distance for semantic similarity
CREATE INDEX IF NOT EXISTS embeddings_embedding_idx 
ON embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ===========================================
-- Update trigger for updated_at
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_info_updated_at
    BEFORE UPDATE ON personal_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Sample data (optional, for testing)
-- ===========================================

-- Insert sample personal info
INSERT INTO personal_info (category, content) VALUES
    ('profile', '我是 Arno，一名全栈工程师和 AI 应用开发者，专注于构建高效、可扩展的系统。'),
    ('skills', '后端开发: Python, FastAPI, Go, Node.js'),
    ('skills', 'AI/ML: RAG, 向量数据库, Prompt Engineering, LangChain'),
    ('skills', '前端开发: React, Next.js, TypeScript, Vue.js'),
    ('skills', '基础设施: Docker, Kubernetes, PostgreSQL, Redis')
ON CONFLICT DO NOTHING;

-- Insert sample project
INSERT INTO projects (name, description, tech_stack, highlights, url) VALUES
    ('Personal Homepage', 
     '集成 AI 智能体的个人主页，基于 RAG 技术回答访客问题',
     ARRAY['FastAPI', 'Next.js', 'PostgreSQL', 'pgvector', 'Redis'],
     ARRAY['流式对话', '向量检索', 'Rerank 重排序', '多级缓存'],
     'https://arnostack.top')
ON CONFLICT DO NOTHING;

-- ===========================================
-- Verify installation
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully!';
    RAISE NOTICE 'pgvector extension: %', (SELECT extversion FROM pg_extension WHERE extname = 'vector');
END $$;
