"""Cross-cutting infrastructure: settings, database wiring, and security primitives.

Nothing here knows about HTTP. Import `settings` from `app.core.config` rather than
reading environment variables anywhere else.
"""
