// Input validation and sanitization

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validators = {
  email: (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.length > 254) {
      return { valid: false, error: "Invalid email format" };
    }
    if (!emailRegex.test(email)) {
      return { valid: false, error: "Invalid email format" };
    }
    return { valid: true };
  },

  password: (password: string): ValidationResult => {
    if (!password || password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }
    if (password.length > 128) {
      return { valid: false, error: "Password too long" };
    }
    // Check for at least one uppercase, one lowercase, one number
    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: "Password must contain uppercase letter" };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, error: "Password must contain lowercase letter" };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: "Password must contain number" };
    }
    return { valid: true };
  },

  url: (url: string): ValidationResult => {
    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      // Block localhost and private IPs
      if (
        urlObj.hostname === "localhost" ||
        urlObj.hostname === "127.0.0.1" ||
        urlObj.hostname.startsWith("192.168.") ||
        urlObj.hostname.startsWith("10.") ||
        urlObj.hostname.startsWith("172.")
      ) {
        return { valid: false, error: "Private URLs are not allowed" };
      }
      if (url.length > 2048) {
        return { valid: false, error: "URL too long" };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: "Invalid URL format" };
    }
  },

  slug: (slug: string): ValidationResult => {
    if (!slug || slug.length < 2 || slug.length > 50) {
      return { valid: false, error: "Slug must be between 2 and 50 characters" };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
      return { valid: false, error: "Slug can only contain letters, numbers, hyphens, and underscores" };
    }
    // Avoid common route conflicts
    const reserved = ["api", "auth", "admin", "dashboard", "account", "settings"];
    if (reserved.includes(slug.toLowerCase())) {
      return { valid: false, error: "This slug is reserved" };
    }
    return { valid: true };
  },

  name: (name: string): ValidationResult => {
    if (!name || name.trim().length < 2 || name.length > 100) {
      return { valid: false, error: "Name must be between 2 and 100 characters" };
    }
    // Remove suspicious characters
    if (/[<>{}[\]`]/.test(name)) {
      return { valid: false, error: "Name contains invalid characters" };
    }
    return { valid: true };
  },
};

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 500); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
