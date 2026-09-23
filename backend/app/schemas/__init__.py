"""Pydantic schemas - one module per resource, named <resource>_schema.py.

Input and output types are kept separate: no schema used as a `response_model`
carries a password or password hash.
"""
