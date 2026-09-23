"""Database access functions - one module per resource, named <resource>_crud.py.

Routers import these modules and call them; they never query a Session directly.
Import the module (`from app.crud import user_crud`) rather than individual
functions, so call sites read as `user_crud.get_user(...)`.
"""
