# Security Implementation Guide

## Overview
This document outlines all security measures implemented in the URL Shortener application.

## 1. Rate Limiting

### Implementation
- **Signup**: 5 attempts per 15 minutes per IP
- **Login**: 10 attempts per 15 minutes per IP
- **URL Creation**: 30 URLs per hour per user
- **URL Retrieval**: 100 requests per hour per user
- **Account Deletion**: 2 attempts per 24 hours per user

### Location: `/lib/rateLimiter.ts`

## 2. Input Validation & Sanitization

### Email Validation
- Format check (RFC 5322 based)
- Length limit (max 254 characters)
- Case-insensitive storage

### Password Requirements
- Minimum 8 characters
- Maximum 128 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Hashed with bcrypt (12 rounds)

### URL Validation
- Valid URL format check
- Blocks private/local IP addresses
- Length limit (max 2048 characters)
- Protocol verification

### Custom Slug Validation
- Only alphanumeric, hyphens, underscores
- Length: 2-50 characters
- Reserved slugs blocked (api, auth, admin, dashboard, account, settings)

### Name Validation
- Length: 2-100 characters
- Removes suspicious characters (<, >, {, }, [, ], `)

### Location: `/lib/validators.ts`

## 3. Authentication Security

### Password Hashing
- Algorithm: bcrypt with 12 rounds (vs default 10)
- Cost: Increased security with slight performance trade-off

### JWT Tokens
- Expiration: 24 hours
- Claims: email, user ID, token type
- HttpOnly cookies (prevents XSS access)
- Secure flag (HTTPS only in production)
- SameSite: strict (prevents CSRF)

### Account Lockout
- 5 failed login attempts trigger 15-minute lockout
- Per-email tracking
- Automatic unlock after lockout period

## 4. Security Headers

### Implemented Headers
```
X-Frame-Options: DENY                    # Clickjacking prevention
X-Content-Type-Options: nosniff          # MIME sniffing prevention
X-XSS-Protection: 1; mode=block          # XSS protection
Referrer-Policy: strict-origin-when-cross-origin # Referrer control
Content-Security-Policy: ...             # XSS, injection prevention
Permissions-Policy: ...                  # Feature restrictions
Strict-Transport-Security: ...           # HTTPS enforcement (1 year)
```

### Location: `/lib/security.ts`

## 5. Database Security

### SQL Injection Prevention
- Parameterized queries throughout
- All user inputs use placeholders ($1, $2, etc.)
- No string concatenation in queries

### Transaction Safety
- Account deletion uses database transactions
- Rollback on error to maintain data integrity
- Atomic operations for critical actions

### Indexes for Performance
- `idx_urls_user_id` - Fast user URL lookup
- `idx_urls_short_code` - Fast URL retrieval
- `idx_analytics_url_id` - Fast analytics lookup
- `idx_analytics_created_at` - Fast time-based queries

## 6. Error Handling & Information Disclosure

### Sanitized Error Messages
- Database errors don't expose internal details
- JWT errors don't leak validation info
- Generic messages for login/signup failures
- Prevents user enumeration

### Logging
- Sensitive data not logged
- Errors logged for debugging
- Request details for security monitoring

### Location: `/lib/security.ts` (`sanitizeErrorMessage`)

## 7. API Security

### CORS Configuration
- Only same-origin requests
- Only localhost:3000 in development
- Credentials required for cross-origin

### Request Validation
- Content-Type validation
- Required field checks
- Type validation for all inputs

### Endpoint Protection
- All protected endpoints require valid JWT
- Token verification on each request
- Email extraction from verified token

## 8. Cookie Security

### Settings
```javascript
httpOnly: true                    // Prevents JavaScript access
secure: true                      // HTTPS only (production)
sameSite: "strict"               // CSRF protection
path: "/"                        // Root path only
maxAge: 86400 (24 hours)        // Token expiration
```

## 9. Data Privacy

### Information Handling
- Passwords never logged or displayed
- Email addresses sanitized
- IP addresses stored only for analytics
- User agents tracked for device detection
- Referrer URLs stored for analytics

### Data Deletion
- User account deletion cascades to all related data
- URLs deletion cascades to analytics
- Complete data removal from database

## 10. IP Address Handling

### Detection Methods (in priority order)
1. `X-Forwarded-For` header (proxy/load balancer)
2. `X-Real-IP` header (reverse proxy)
3. `CF-Connecting-IP` header (Cloudflare)
4. Direct connection IP

### Usage
- Rate limiting identification
- Analytics tracking
- Security monitoring

## 11. XSS Prevention

### Content Security Policy
- `default-src 'self'` - Only same-origin
- `script-src 'self' 'unsafe-inline'` - Scripts from same origin
- `img-src 'self' data: https:` - Images from trusted sources
- Prevents inline script execution

### Input Escaping
- HTML special characters escaping function available
- Framework handles context-aware escaping

## 12. CSRF Prevention

### Cookie SameSite
- Set to `strict` to prevent cross-site cookie sending
- Blocks most CSRF attacks automatically

## 13. Account Security Features

### Duplicate Email Prevention
- Case-insensitive email uniqueness
- Database unique constraint on `LOWER(email)`

### Lockout & Rate Limiting
- Brute force protection on login
- Account lockout on repeated failures
- Automatic unlock after cooldown period

## 14. Best Practices Implemented

✅ Principle of Least Privilege
- Users can only access their own data
- API endpoints verify ownership

✅ Defense in Depth
- Multiple layers of security
- Fails securely if one layer is bypassed

✅ Input Validation
- Validate all user inputs
- Whitelist expected formats

✅ Secure Defaults
- HTTPS required in production
- Strict security headers
- Conservative rate limits

✅ Audit Trail
- Error logging for investigation
- Rate limit violations tracked
- Failed login attempts logged

## 15. Environment Variables Required

```
JWT_SECRET_KEY="long-random-secret-key"           # Min 32 characters
NEON_CONNECTION_STRING="postgresql://..."         # Database URL
NODE_ENV="production|development"                 # Environment
NEXT_PUBLIC_APP_URL="https://yourdomain.com"     # App URL
```

## 16. Security Testing Checklist

- [ ] Test SQL injection attempts on all endpoints
- [ ] Test XSS payloads in input fields
- [ ] Test rate limiting with automated requests
- [ ] Test account lockout after failed login
- [ ] Verify password complexity requirements
- [ ] Verify CORS blocks unauthorized origins
- [ ] Verify secure headers are present
- [ ] Test session expiration
- [ ] Test CSRF protection
- [ ] Verify sensitive data not in logs
- [ ] Test account deletion cascades properly
- [ ] Verify JWT token validation

## 17. Deployment Checklist

- [ ] Set JWT_SECRET_KEY to strong random value
- [ ] Enable HTTPS/SSL certificate
- [ ] Set NODE_ENV=production
- [ ] Verify CORS origins
- [ ] Enable database connection encryption
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting
- [ ] Regular security updates for dependencies
- [ ] Backup database regularly
- [ ] Review logs periodically

## 18. Ongoing Security Maintenance

### Regular Tasks
- Monthly dependency security updates
- Quarterly security audit
- Review rate limit thresholds
- Monitor failed login patterns
- Update CSP as needed
- Review and update ALLOWED ORIGINS

### Incident Response
- Document all security incidents
- Review logs and audit trail
- Patch vulnerabilities promptly
- Notify users of data breaches if required
- Update security measures based on learnings

## References
- OWASP Top 10 Prevention
- CWE/SANS Top 25
- NIST Cybersecurity Framework
- PostgreSQL Security Best Practices
- Next.js Security Guidelines
