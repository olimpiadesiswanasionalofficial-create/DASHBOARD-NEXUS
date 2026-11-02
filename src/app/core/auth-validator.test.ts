import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePasswordStrength,
  validateActivationCode,
  validateEmail,
  verifyTotpCode,
  convertToCsv,
  validateRegistration
} from './auth-validator';
import { encryptText, decryptText } from './crypto-e2e';

test('validateRegistration rejects invalid inputs', () => {
  const emptyName = validateRegistration({
    name: '',
    email: 'test@example.com',
    phone: '081234567890',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  assert.equal(emptyName.isValid, false);
  assert.equal(emptyName.field, 'name');

  const badEmail = validateRegistration({
    name: 'Budi Santoso',
    email: 'bad-email',
    phone: '081234567890',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  });
  assert.equal(badEmail.isValid, false);
  assert.equal(badEmail.field, 'email');

  const mismatchedPassword = validateRegistration({
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
    password: 'Password123!',
    confirmPassword: 'DifferentPassword!',
  });
  assert.equal(mismatchedPassword.isValid, false);
  assert.equal(mismatchedPassword.field, 'confirmPassword');
});

test('validateRegistration accepts valid registration payload', () => {
  const valid = validateRegistration({
    name: 'Ahmad Faisal',
    email: 'ahmad.faisal@nexusaisolution.com',
    phone: '081298765432',
    password: 'SecurePass2026!',
    confirmPassword: 'SecurePass2026!',
  });
  assert.equal(valid.isValid, true);
});


test('evaluatePasswordStrength evaluates weak passwords correctly', () => {
  const weak = evaluatePasswordStrength('12345');
  assert.equal(weak.checks.minLength, false);
  assert.equal(weak.score < 2, true);
});

test('evaluatePasswordStrength evaluates strong passwords correctly', () => {
  const strong = evaluatePasswordStrength('P@ssw0rdNexus2026!');
  assert.equal(strong.checks.minLength, true);
  assert.equal(strong.checks.hasUppercase, true);
  assert.equal(strong.checks.hasLowercase, true);
  assert.equal(strong.checks.hasNumber, true);
  assert.equal(strong.checks.hasSpecial, true);
  assert.equal(strong.score >= 3, true);
});

test('validateActivationCode recognizes preset and format codes', () => {
  const pro = validateActivationCode('LD-PREMIUM-2026');
  assert.equal(pro.isValid, true);
  assert.equal(pro.tier, 'PRO');

  const nexusPro = validateActivationCode('NEXUS-PREMIUM-2026');
  assert.equal(nexusPro.isValid, true);
  assert.equal(nexusPro.tier, 'PRO');

  const admin = validateActivationCode('PRO-NEXUS-ADMIN');
  assert.equal(admin.isValid, true);
  assert.equal(admin.tier, 'ADMIN');

  const formatted = validateActivationCode('LD-A1B2-C3D4-E5F6');
  assert.equal(formatted.isValid, true);

  const invalid = validateActivationCode('WRONG-CODE');
  assert.equal(invalid.isValid, false);
});

test('validateEmail validates RFC compliant emails', () => {
  assert.equal(validateEmail('test@nexusaisolution.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('user@domain'), false);
});

test('verifyTotpCode accepts valid 6-digit codes and demo tokens', () => {
  assert.equal(verifyTotpCode('123456'), true);
  assert.equal(verifyTotpCode('888888'), true);
  assert.equal(verifyTotpCode('999999', '999999'), true);
  assert.equal(verifyTotpCode('12345'), false); // Too short
  assert.equal(verifyTotpCode('abcdef'), false); // Not digits
});

test('convertToCsv correctly formats data rows with quotes escaping', () => {
  const headers = ['Nama', 'Email', 'Lisensi'];
  const rows = [
    ['Budi Santoso', 'budi@example.com', 'PRO'],
    ['Citra "Dewi"', 'citra@example.com', 'ENTERPRISE']
  ];
  const csv = convertToCsv(headers, rows);
  assert.match(csv, /"Nama","Email","Lisensi"/);
  assert.match(csv, /"Citra ""Dewi"""/);
});

test('encryptText and decryptText successfully roundtrips sensitive data with AES-GCM', async () => {
  const secretData = 'API_SECRET_KEY=nexus_live_998877665544332211';
  const passphrase = 'MasterSecurityPassphrase2026!';

  const encrypted = await encryptText(secretData, passphrase);
  assert.ok(encrypted.ciphertext.length > 0);
  assert.ok(encrypted.iv.length > 0);
  assert.equal(encrypted.algorithm, 'AES-256-GCM');

  const decrypted = await decryptText(encrypted, passphrase);
  assert.equal(decrypted, secretData);
});
