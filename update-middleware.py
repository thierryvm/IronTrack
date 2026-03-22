import sys

with open('src/middleware.ts', 'r') as f:
    content = f.read()

old_ip_logic = "const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'"
new_ip_logic = """const forwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0].trim() || xRealIp || request.ip || 'unknown'"""

content = content.replace(old_ip_logic, new_ip_logic)

with open('src/middleware.ts', 'w') as f:
    f.write(content)
