"""API routers - one module per feature, named after the feature with no suffix.

Routers are named by feature/domain (auth.py, users.py), not by resource, because
one router commonly spans several resources. Each declares its own `/api` prefix
and is registered in app/main.py.
"""
