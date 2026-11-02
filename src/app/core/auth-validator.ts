/**
 * Pure validation and formatting logic for Nexus AI Solution Auth
 */

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Sangat Lemah' | 'Lemah' | 'Cukup' | 'Kuat' | 'Sangat Kuat';
  color: string;
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.minLength) score += 1;
  if (checks.hasUppercase && checks.hasLowercase) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  const scoreMap: Record<number, { label: PasswordStrength['label']; color: string }> = {
    0: { label: 'Sangat Lemah', color: 'bg-red-500' },
    1: { label: 'Lemah', color: 'bg-orange-500' },
    2: { label: 'Cukup', color: 'bg-amber-500' },
    3: { label: 'Kuat', color: 'bg-emerald-500' },
    4: { label: 'Sangat Kuat', color: 'bg-teal-400' },
  };

  return {
    score,
    label: scoreMap[score].label,
    color: scoreMap[score].color,
    checks,
  };
}

export interface ActivationCodeValidation {
  isValid: boolean;
  tier: 'PRO' | 'ENTERPRISE' | 'NEXUS_VIP' | 'ADMIN' | 'INVALID';
  productName: string;
  expiresInDays: number;
  message: string;
}

export function validateActivationCode(code: string): ActivationCodeValidation {
  const clean = code.trim().toUpperCase();
  if (!clean) {
    return {
      isValid: false,
      tier: 'INVALID',
      productName: '',
      expiresInDays: 0,
      message: 'Kode aktivasi wajib diisi.',
    };
  }

  // Preset quick test keys
  if (clean === 'LD-PREMIUM-2026' || clean === 'LD-PRO-2026' || clean === 'NEXUS-PRO-2026' || clean === 'NEXUS-PREMIUM-2026') {
    return {
      isValid: true,
      tier: 'PRO',
      productName: 'Nexus AI Solution Pro License',
      expiresInDays: 365,
      message: 'Kode Pro Nexus AI Solution valid! Siap diaktifkan.',
    };
  }

  if (clean === 'LD-ENTERPRISE-VIP' || clean === 'ENTERPRISE' || clean === 'NEXUS-ENTERPRISE') {
    return {
      isValid: true,
      tier: 'ENTERPRISE',
      productName: 'Nexus AI Solution Enterprise Suite',
      expiresInDays: 730,
      message: 'Lisensi Enterprise Unlimited terverifikasi.',
    };
  }

  if (clean === 'NEXUS-VIP-ACCESS' || clean === 'NEXUS-VIP') {
    return {
      isValid: true,
      tier: 'NEXUS_VIP',
      productName: 'Nexus AI Solution VIP License',
      expiresInDays: 365,
      message: 'Akses VIP Nexus AI Solution aktif dan terhubung.',
    };
  }

  if (clean === 'PRO-NEXUS-ADMIN' || clean === 'ADMIN-ACCESS') {
    return {
      isValid: true,
      tier: 'ADMIN',
      productName: 'Nexus AI Solution Master Administrator',
      expiresInDays: 9999,
      message: 'Kunci Otoritas Master Admin terkonfirmasi.',
    };
  }

  // Nexus AI Solution format: NEXUS-XXXX-XXXX-XXXX or LD-XXXX-XXXX-XXXX
  const pattern = /^(LD|NEXUS)-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (pattern.test(clean)) {
    return {
      isValid: true,
      tier: 'PRO',
      productName: 'Nexus AI Solution Standard License',
      expiresInDays: 365,
      message: 'Kode aktivasi resmi Nexus AI Solution valid.',
    };
  }

  return {
    isValid: false,
    tier: 'INVALID',
    productName: '',
    expiresInDays: 0,
    message: 'Kode aktivasi tidak valid. Gunakan format NEXUS-XXXX-XXXX-XXXX atau coba kode demo: NEXUS-PREMIUM-2026 / PRO-NEXUS-ADMIN',
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function verifyTotpCode(inputCode: string, expectedCode = '123456'): boolean {
  const clean = inputCode.trim().replace(/\s/g, '');
  // Accepts standard 6 digits
  if (clean.length !== 6 || !/^\d{6}$/.test(clean)) {
    return false;
  }
  // For demo/testing, accept the generated code or universal test codes '123456' / '888888'
  return clean === expectedCode || clean === '123456' || clean === '888888';
}

export function convertToCsv(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (val: string | number) => {
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(escapeCell).join(',');
  const dataRows = rows.map((row) => row.map(escapeCell).join(','));
  return [headerRow, ...dataRows].join('\r\n');
}

export interface RegistrationInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface RegistrationValidationResult {
  isValid: boolean;
  message?: string;
  field?: 'name' | 'email' | 'phone' | 'password' | 'confirmPassword';
}

export function validateRegistration(data: RegistrationInput): RegistrationValidationResult {
  if (!data.name || data.name.trim().length < 2) {
    return { isValid: false, message: 'Nama lengkap wajib diisi (minimal 2 karakter).', field: 'name' };
  }
  if (!data.email || !validateEmail(data.email)) {
    return { isValid: false, message: 'Format alamat email tidak valid.', field: 'email' };
  }
  const cleanPhone = data.phone.trim().replace(/[\s-]/g, '');
  if (!cleanPhone || cleanPhone.length < 8) {
    return { isValid: false, message: 'Nomor WhatsApp / telepon wajib diisi (minimal 8 digit).', field: 'phone' };
  }
  if (!data.password || data.password.length < 8) {
    return { isValid: false, message: 'Kata sandi minimal harus 8 karakter.', field: 'password' };
  }
  if (data.password !== data.confirmPassword) {
    return { isValid: false, message: 'Konfirmasi kata sandi tidak cocok.', field: 'confirmPassword' };
  }
  return { isValid: true };
}

