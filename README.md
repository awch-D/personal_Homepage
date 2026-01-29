# Arno's AI-Powered Personal Homepage 🚀

> 基于 RAG (Retrieval-Augmented Generation) 技术的智能个人主页。集成 AI 智能体，能够像我本人一样回答访客关于我的经历、技能和项目的问题。

![Primary Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI%20%7C%20PostgreSQL-blue)
![AI Powered](https://img.shields.io/badge/AI-RAG%20%7C%20LLM%20%7C%20Vector%20Search-emerald)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ 核心特性

- **🤖 AI 智能对话**: 访客可以与我的数字孪生进行对话，获取关于我的实时解答。
- **📚 深度知识库 (RAG)**: 利用 `pgvector` 和 `DashScope` 向量化技术，实现对个人简历、项目文档的精准检索。
- **⚡ 极致性能**:
  - **三级缓存机制**: L1 (结果缓存), L2 (检索缓存), L3 (向量化缓存)，响应延迟低至毫秒级。
  - **生产环境优化**: 基于 Next.js 生产模式构建，极速加载体验。
- **📊 专业管理后台**:
  - **实时仪表盘**: 监控 API 调用频率、令牌消耗及成本预算。
  - **数据动态导入**: 支持 JSON 一键导入，自动完成文档切片、向量化及入库。
- **🔒 全方位安全**:
  - JWT + HttpOnly 安全认证。
  - 内置 8 种模式的 Prompt 注入防御。
  - 完善的限速与日志审计机制。

---

## 🛠️ 技术架构

### 核心技术栈
- **前端**: [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/)
- **后端**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11)
- **数据库**: [PostgreSQL](https://www.postgresql.org/) + [pgvector](https://github.com/pgvector/pgvector)
- **缓存**: [Redis](https://redis.io/)
- **部署**: [Docker Compose](https://www.docker.com/) + [Nginx](https://www.nginx.com/) (Reverse Proxy & SSL)

### RAG 工作流
1. **数据处理**: 提取个人 JSON 数据 -> 文档切片 -> 调用 DashScope 生成向量。
2. **检索阶段**: 用户提问 -> 向量化 -> 语义检索 (Cosine Similarity) -> GTE-Rerank 重排序。
3. **生成阶段**: 提示词模板注入上下文 -> LLM (GLM-4) 生成流式响应。

---

## 🚀 快速部署

### 1. 克隆代码与配置
```bash
git clone https://github.com/awch-D/personal_Homepage.git
cd personal_Homepage
cp .env.example .env
# 编辑 .env 填入您的 API Keys 和数据库密码
```

### 2. 一键启动
```bash
# 构建并运行容器
docker compose up -d --build
```

### 3. 数据初始化
```bash
# 将您的资料放入 backend/data/personal_profile.json
# 执行导入任务
docker compose exec backend python scripts/import_profile.py
```

### 4. 访问系统
- **主页**: `https://arnostack.top`
- **后台**: `https://arnostack.top/admin`
- **交互文档**: `https://arnostack.top/api/docs`

---

## 📂 目录结构

```text
├── backend/                   #  FastAPI 后端应用
│   ├── app/                   # 核心逻辑 (API, Services, Core)
│   ├── data/                  # 待导入的知识库 JSON
│   └── scripts/               # 数据处理与导入脚本
├── frontend/                  # Next.js 个性化前端
├── nginx/                     # 生产环境反向代理与 SSL 配置
├── scripts/                   # 自动化部署、备份与安全检查脚本
├── docker-compose.yml         # 编排定义
└── .env.example               # 环境配置模板
```

---

## 🛡️ 安全合规

系统内置了针对大模型的安全防护墙，能有效防御以下攻击：
- 提示词越狱 (Prompt Jailbreaking)
- 指令劫持 (Instruction Hijacking)
- 敏感数据泄露过滤
- 恶意脚本注入

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议。

---

> **Built with ❤️ by Arno.** 如果这个项目对你有帮助，欢迎点个 Star! ⭐
