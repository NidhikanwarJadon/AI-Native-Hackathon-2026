"""corrective-rizz backend application package.

Layout (see .claude/skills/fastapi-development/SKILL.md for the conventions):
    core/         settings, database engine/session, security primitives
    models/       SQLAlchemy models        - one file per resource, *_model.py
    schemas/      Pydantic request/response - one file per resource, *_schema.py
    crud/         all database access       - one file per resource, *_crud.py
    routers/      HTTP endpoints            - one file per feature, no suffix
    dependencies  shared FastAPI dependencies (get_current_user)
"""
