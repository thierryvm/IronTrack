import sys

with open('.github/workflows/contrast-check.yml', 'r') as f:
    content = f.read()

target = """  accessibility-audit:
    name: Full Accessibility Audit
    runs-on: ubuntu-latest
    needs: contrast-compliance
    if: github.event_name == 'pull_request'"""

replacement = """  accessibility-audit:
    name: Full Accessibility Audit
    runs-on: ubuntu-latest
    needs: contrast-compliance
    if: github.event_name == 'pull_request'
    permissions:
      pull-requests: write
      issues: write"""

content = content.replace(target, replacement)

with open('.github/workflows/contrast-check.yml', 'w') as f:
    f.write(content)
