"""
conftest.py – pytest configuration for the Selenium test suite.

Placing this file here tells pytest to treat the selenium/ directory as the
root for test collection and adds it to sys.path so that the shared `helpers`
module can be imported with a plain `from helpers import ...` in every test file.
"""
