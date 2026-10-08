"""JOBS automation engine: deterministic rules, tracker, portals and previews.

The engine never sends email, never submits an application and never types a
credential. It decides, tracks and drafts. Sending and applying are done by the
Claude routines (Gmail connector, browser) only after the gates in gates.py pass.
"""
__version__ = "8.0.0"
