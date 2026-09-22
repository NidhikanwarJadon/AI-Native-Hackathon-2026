# AI-Native Hackathon 2026

Starter template for the hackathon build: a React frontend, a FastAPI backend, and Claude Code agents/skills to support an AI-native workflow.

## Structure

```
AI-Native-Hackathon-2026/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Python + FastAPI
├── docs/
│   ├── problem.md         # Problem statement & requirements
│   ├── solution.md        # What we're building and for whom
│   ├── architecture.md    # Architecture, API contracts, data model
│   ├── decision-log.md    # Append-only, unowned: every human override of an AI proposal
│   ├── ai-evidence.md     # Append-only, unowned: every useful agent/skill output
│   ├── ai-approach.md     # Synthesis of the two logs above + traditional-vs-AI comparison
│   ├── testing.md         # Test cases & QA notes
│   └── demo-script.md     # Demo walkthrough script
├── .claude/
│   ├── agents/        # product-analyst, solution-architect, frontend-engineer, backend-engineer, qa-reviewer
│   └── skills/        # requirements-analysis, architecture-design, react-development, fastapi-development, testing, demo-preparation
└── README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Docs

Problem definition, architecture decisions, and testing/demo notes live in [`docs/`](docs/). Fill these in as the solution takes shape.

## Claude Code

Custom agents live in [`.claude/agents/`](.claude/agents/) and reusable skills in [`.claude/skills/`](.claude/skills/) — use these to keep requirements analysis, implementation, testing, and demo prep consistent across the team.
