import sys

with open('src/middleware.ts', 'r') as f:
    content = f.read()

# Replace maxRequests logic
old_max = "const maxRequests = 100 // 100 requests per minute"
new_max = """const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const maxRequests = isApiRoute ? 200 : 100"""
content = content.replace(old_max, new_max)

# Replace cleanup logic
old_cleanup = """  // Cleanup old entries (simple approach, every 100 requests)
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.timestamp > windowMs) {
        rateLimitMap.delete(key)
      }
    }
  }"""
new_cleanup = """  // Cleanup old entries (deterministic size limit)
  if (rateLimitMap.size > 10000) {
    rateLimitMap.clear()
  }"""
content = content.replace(old_cleanup, new_cleanup)

with open('src/middleware.ts', 'w') as f:
    f.write(content)
