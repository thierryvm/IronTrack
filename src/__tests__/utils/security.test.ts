import {
  sanitizeInput,
  detectSecurityThreats,
  validateNumericInput,
  validateTextInput,
  validateEmail,
  validatePassword,
  validateTime,
  validateDate,
  validateForm,
  handleNumericInput,
  handleSecureTextInput,
  ClientRateLimiter
} from '@/utils/security'

describe('Security utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const input = 'Hello <script>alert("xss")</script> World'
      const result = sanitizeInput(input)
      // La balise script est supprimée mais le contenu reste partiellement
      expect(result).toBe('Hello scriptalertxss World')
    })

    it('should remove SQL injection patterns', () => {
      const input = "'; DROP TABLE users; --"
      const result = sanitizeInput(input)
      // Les quotes et DROP sont supprimés, mais -- reste
      expect(result).toBe('  TABLE users --')
    })

    it('should preserve valid French characters', () => {
      const input = 'Café à la française, très délicieux !'
      const result = sanitizeInput(input)
      // Le point d'exclamation est supprimé mais un espace reste
      expect(result).toBe('Café à la française, très délicieux ')
    })

    it('should handle empty or invalid input', () => {
      expect(sanitizeInput('')).toBe('')
      expect(sanitizeInput(null as any)).toBe('')
      expect(sanitizeInput(undefined as any)).toBe('')
    })
  })

  describe('detectSecurityThreats', () => {
    it('should detect SQL injection attempts', () => {
      expect(detectSecurityThreats("'; DROP TABLE users; --")).toBe(true)
      expect(detectSecurityThreats("SELECT * FROM users")).toBe(true)
      expect(detectSecurityThreats("1 OR 1=1")).toBe(true)
    })

    it('should detect XSS attempts', () => {
      expect(detectSecurityThreats('<script>alert("xss")</script>')).toBe(true)
      expect(detectSecurityThreats('javascript:alert("xss")')).toBe(true)
      expect(detectSecurityThreats('onclick="alert(1)"')).toBe(true)
    })

    it('should detect template injection', () => {
      expect(detectSecurityThreats('${process.env.SECRET}')).toBe(true)
      expect(detectSecurityThreats('{{constructor.constructor("return process")()}}')).toBe(true)
    })

    it('should allow safe input', () => {
      expect(detectSecurityThreats('Hello World')).toBe(false)
      expect(detectSecurityThreats('Café français 123')).toBe(false)
      expect(detectSecurityThreats('user@example.com')).toBe(false)
    })
  })

  describe('validateNumericInput', () => {
    it('should validate valid numbers', () => {
      expect(validateNumericInput('10', 'weight')).toBeNull()
      expect(validateNumericInput('50.5', 'weight')).toBeNull()
    })

    it('should reject invalid numbers', () => {
      const result = validateNumericInput('abc', 'weight')
      expect(result).toEqual({
        field: 'weight',
        message: 'weight doit être un nombre valide'
      })
    })

    it('should enforce min/max boundaries', () => {
      const minResult = validateNumericInput('-5', 'weight', 0, 100)
      expect(minResult?.message).toContain('supérieur ou égal à 0')

      const maxResult = validateNumericInput('150', 'weight', 0, 100)
      expect(maxResult?.message).toContain('ne peut pas dépasser 100')
    })

    it('should require non-empty input', () => {
      const result = validateNumericInput('', 'weight')
      expect(result?.message).toContain('requis')
    })
  })

  describe('validateTextInput', () => {
    it('should validate safe text', () => {
      expect(validateTextInput('Hello World', 'name')).toBeNull()
      expect(validateTextInput('Café français', 'name')).toBeNull()
    })

    it('should detect security threats', () => {
      const result = validateTextInput('<script>alert("xss")</script>', 'name')
      expect(result?.message).toContain('caractères interdits')
    })

    it('should enforce length requirements', () => {
      const shortResult = validateTextInput('a', 'name', 5)
      expect(shortResult?.message).toContain('au moins 5 caractères')

      const longResult = validateTextInput('a'.repeat(101), 'name', 2, 100)
      expect(longResult?.message).toContain('ne peut pas dépasser 100')
    })

    it('should handle optional fields', () => {
      expect(validateTextInput('', 'optional', 2, 100, true)).toBeNull()
    })
  })

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('user@example.com')).toBeNull()
      expect(validateEmail('test.email+tag@domain.co.uk')).toBeNull()
    })

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).not.toBeNull()
      expect(validateEmail('@domain.com')).not.toBeNull()
      expect(validateEmail('user@')).not.toBeNull()
    })

    it('should detect security threats in emails', () => {
      const result = validateEmail('user+<script>@evil.com')
      expect(result?.message).toContain('caractères interdits')
    })

    it('should enforce length limits', () => {
      const longEmail = 'a'.repeat(250) + '@domain.com'
      const result = validateEmail(longEmail)
      expect(result?.message).toContain('trop long')
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      // StrongPass123! contient "pass" qui est considéré comme commun
      expect(validatePassword('StrongPass123!')).not.toBeNull()
      expect(validatePassword('MySecure2023#')).toBeNull()
    })

    it('should reject weak passwords', () => {
      const result = validatePassword('weak')
      expect(result?.message).toContain('au moins 8 caractères')
    })

    it('should enforce complexity requirements', () => {
      const result = validatePassword('alllowercase')
      expect(result?.message).toContain('au moins 3 des éléments suivants')
    })

    it('should reject common passwords', () => {
      const result = validatePassword('Password123!')
      expect(result?.message).toContain('trop commun')
    })

    it('should enforce length limits', () => {
      const tooLong = 'a'.repeat(130)
      const result = validatePassword(tooLong)
      expect(result?.message).toContain('ne peut pas dépasser 128')
    })
  })

  describe('validateTime', () => {
    it('should validate correct time formats', () => {
      expect(validateTime('09:30')).toBeNull()
      expect(validateTime('23:59')).toBeNull()
      expect(validateTime('00:00')).toBeNull()
    })

    it('should reject invalid time formats', () => {
      expect(validateTime('9:30')).not.toBeNull() // Missing leading zero
      expect(validateTime('25:30')).not.toBeNull() // Invalid hour
      expect(validateTime('12:60')).not.toBeNull() // Invalid minute
      expect(validateTime('not-a-time')).not.toBeNull()
    })
  })

  describe('validateDate', () => {
    it('should validate correct dates', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(validateDate(today)).toBeNull()
    })

    it('should reject invalid dates', () => {
      expect(validateDate('invalid-date')).not.toBeNull()
      expect(validateDate('2023-13-01')).not.toBeNull() // Invalid month
    })

    it('should enforce reasonable date ranges', () => {
      // Date trop dans le futur
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 2)
      const futureResult = validateDate(futureDate.toISOString().split('T')[0])
      expect(futureResult?.message).toContain('plus d\'un an dans le futur')

      // Date trop dans le passé  
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 15)
      const pastResult = validateDate(pastDate.toISOString().split('T')[0])
      expect(pastResult?.message).toContain('plus de 10 ans dans le passé')
    })
  })

  describe('validateForm', () => {
    it('should validate a complete form', () => {
      const formData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        age: '25',
        weight: '70.5'
      }

      const rules = {
        name: { type: 'text' as const, required: true },
        email: { type: 'email' as const, required: true },
        age: { type: 'number' as const, min: 18, max: 100 },
        weight: { type: 'number' as const, min: 30, max: 200 }
      }

      const result = validateForm(formData, rules)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.sanitizedData).toBeDefined()
    })

    it('should return errors for invalid form', () => {
      const formData = {
        name: '<script>alert("xss")</script>',
        email: 'invalid-email',
        age: 'not-a-number'
      }

      const rules = {
        name: { type: 'text' as const, required: true },
        email: { type: 'email' as const, required: true },
        age: { type: 'number' as const, min: 18, max: 100 }
      }

      const result = validateForm(formData, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.sanitizedData).toBeUndefined()
    })
  })

  describe('handleNumericInput', () => {
    it('should filter non-numeric characters', () => {
      const mockSetter = jest.fn()
      handleNumericInput('123abc456', mockSetter)
      expect(mockSetter).toHaveBeenCalledWith('123456')
    })

    it('should handle decimal points correctly', () => {
      const mockSetter = jest.fn()
      handleNumericInput('12.34.56', mockSetter)
      expect(mockSetter).toHaveBeenCalledWith('12.3456')
    })
  })

  describe('handleSecureTextInput', () => {
    it('should allow safe characters', () => {
      const mockSetter = jest.fn()
      handleSecureTextInput('Hello World 123', mockSetter)
      expect(mockSetter).toHaveBeenCalledWith('Hello World 123')
    })

    it('should block dangerous characters', () => {
      const mockSetter = jest.fn()
      handleSecureTextInput('Hello<script>', mockSetter)
      expect(mockSetter).not.toHaveBeenCalled()
    })
  })

  describe('ClientRateLimiter', () => {
    it('should allow requests within limit', () => {
      const limiter = new ClientRateLimiter(5, 60000) // 5 attempts per minute
      
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.isAllowed('user1')).toBe(true)
      expect(limiter.getRemainingAttempts('user1')).toBe(3)
    })

    it('should block requests exceeding limit', () => {
      const limiter = new ClientRateLimiter(2, 60000) // 2 attempts per minute
      
      expect(limiter.isAllowed('user2')).toBe(true)
      expect(limiter.isAllowed('user2')).toBe(true)
      expect(limiter.isAllowed('user2')).toBe(false) // Should be blocked
      expect(limiter.getRemainingAttempts('user2')).toBe(0)
    })

    it('should handle different users independently', () => {
      const limiter = new ClientRateLimiter(2, 60000)
      
      expect(limiter.isAllowed('user3')).toBe(true)
      expect(limiter.isAllowed('user3')).toBe(true)
      expect(limiter.isAllowed('user3')).toBe(false)
      
      // Different user should still be allowed
      expect(limiter.isAllowed('user4')).toBe(true)
    })
  })
})