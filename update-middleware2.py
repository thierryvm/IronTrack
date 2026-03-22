import sys

with open('src/middleware.ts', 'r') as f:
    content = f.read()

# request.ip does not exist on NextRequest, so we have to use something else or cast to any, or drop it
# Since Next.js 15, `request.ip` was removed from NextRequest. We just drop `request.ip`.

old_ip_logic = "const ip = forwardedFor?.split(',')[0].trim() || xRealIp || request.ip || 'unknown'"
new_ip_logic = "const ip = forwardedFor?.split(',')[0].trim() || xRealIp || 'unknown'"

content = content.replace(old_ip_logic, new_ip_logic)

with open('src/middleware.ts', 'w') as f:
    f.write(content)
