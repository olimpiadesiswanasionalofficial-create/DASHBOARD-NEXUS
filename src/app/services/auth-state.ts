import { Injectable, signal, computed, inject } from '@angular/core';
import { validateActivationCode, validateEmail, verifyTotpCode } from '../core/auth-validator';
import { NotificationState } from './notification-service';
import { AnalyticsState } from './analytics-state';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'member' | 'admin';
  tier: 'PRO' | 'ENTERPRISE' | 'NEXUS_VIP' | 'ADMIN';
  avatar: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string;
  licenseKey: string;
  provider: 'local' | 'google' | 'facebook';
  createdAt: string;
  e2eKeyConfigured: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly notification = inject(NotificationState);
  private readonly analytics = inject(AnalyticsState);

  // Active user (default to a rich authenticated session so user can explore analytics & vault immediately, with easy logout / login testing)
  readonly currentUser = signal<UserProfile | null>({
    id: 'usr-leveling-99',
    name: 'Budi Pratama Santoso',
    email: 'budi.santoso@levelingdigital.com',
    role: 'admin',
    tier: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    licenseKey: 'LD-PREMIUM-2026',
    provider: 'local',
    createdAt: '2026-01-15',
    e2eKeyConfigured: true,
  });

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // UI Navigation & Modals
  readonly activeAuthTab = signal<'activate' | 'login' | 'register'>('activate');
  readonly is2faPending = signal<boolean>(false);
  readonly pendingLoginEmail = signal<string>('');
  readonly pendingLoginRole = signal<'member' | 'admin'>('member');

  // Modals state
  readonly isForgotPasswordOpen = signal<boolean>(false);
  readonly isSocialModalOpen = signal<boolean>(false);
  readonly socialProvider = signal<'google' | 'facebook'>('google');
  readonly isTwoFactorSetupOpen = signal<boolean>(false);
  readonly isPrintReportOpen = signal<boolean>(false);

  // Password Recovery Flow
  readonly passwordResetStep = signal<'email' | 'otp' | 'newPassword' | 'success'>('email');
  readonly passwordResetEmail = signal<string>('');
  readonly simulatedResetOtp = signal<string>('724915');

  // 2FA TOTP rolling code simulator
  readonly simulatedTotpCode = signal<string>('842109');

  constructor() {
    // Refresh simulated TOTP rolling code every 30s
    if (typeof window !== 'undefined') {
      setInterval(() => {
        const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.simulatedTotpCode.set(nextCode);
      }, 30000);
    }
  }

  setAuthTab(tab: 'activate' | 'login' | 'register') {
    this.activeAuthTab.set(tab);
  }

  /**
   * Activate Account / License (matches app.levelingdigital.com/activate)
   */
  activateAccount(code: string, name: string, email: string): { success: boolean; message: string } {
    const val = validateActivationCode(code);
    if (!val.isValid) {
      return { success: false, message: val.message };
    }

    if (!validateEmail(email)) {
      return { success: false, message: 'Format alamat email tidak valid.' };
    }

    const assignedRole: 'member' | 'admin' = val.tier === 'ADMIN' ? 'admin' : 'member';

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      name: name.trim() || 'Pengguna Leveling Digital',
      email: email.trim(),
      role: assignedRole,
      tier: val.tier as UserProfile['tier'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      twoFactorEnabled: true,
      twoFactorSecret: 'LD77NEXUS' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      licenseKey: code.trim().toUpperCase(),
      provider: 'local',
      createdAt: new Date().toISOString().split('T')[0],
      e2eKeyConfigured: true,
    };

    this.currentUser.set(newUser);
    this.notification.sendPush(
      'Aktivasi Lisensi Berhasil!',
      `Selamat datang! Lisensi ${val.productName} telah aktif dan akun Anda siap digunakan.`
    );
    this.analytics.addAuditLog({
      action: 'Aktivasi Lisensi Resmi',
      user: newUser.email,
      ip: '180.244.17.88',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      details: `Lisensi ${val.tier} aktif untuk ${newUser.name}.`,
    });

    return { success: true, message: 'Aktivasi lisensi berhasil! Selamat datang di Leveling Digital & Nexus.' };
  }

  /**
   * Login with email and password
   */
  login(email: string, pass: string): { success: boolean; require2FA?: boolean; message: string } {
    if (!validateEmail(email)) {
      return { success: false, message: 'Alamat email tidak valid.' };
    }
    if (!pass || pass.length < 5) {
      return { success: false, message: 'Kata sandi wajib diisi (minimal 6 karakter).' };
    }

    // Role check for demo
    const role: 'member' | 'admin' = email.toLowerCase().includes('admin') ? 'admin' : 'member';

    // 2FA required for high security
    this.pendingLoginEmail.set(email);
    this.pendingLoginRole.set(role);
    this.is2faPending.set(true);

    return {
      success: true,
      require2FA: true,
      message: 'Kredensial valid. Silakan masukkan kode Autentikasi 2FA.',
    };
  }

  /**
   * Verify 2FA OTP
   */
  submit2FA(code: string): { success: boolean; message: string } {
    const isGood = verifyTotpCode(code, this.simulatedTotpCode());
    if (!isGood) {
      return { success: false, message: 'Kode 2FA salah atau kedaluwarsa. Gunakan kode yang muncul pada Authenticator atau coba 123456.' };
    }

    const email = this.pendingLoginEmail() || 'member@levelingdigital.com';
    const role = this.pendingLoginRole() || 'member';

    const user: UserProfile = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: email,
      role: role,
      tier: role === 'admin' ? 'ADMIN' : 'PRO',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      twoFactorEnabled: true,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP',
      licenseKey: 'LD-PREMIUM-2026',
      provider: 'local',
      createdAt: '2026-02-01',
      e2eKeyConfigured: true,
    };

    this.currentUser.set(user);
    this.is2faPending.set(false);

    this.notification.sendPush(
      'Autentikasi 2FA Terverifikasi',
      `Login berhasil sebagai ${role.toUpperCase()} dengan proteksi E2EE.`
    );
    this.analytics.addAuditLog({
      action: 'Login 2FA Berhasil',
      user: email,
      ip: '114.124.201.5',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      details: 'Autentikasi 2FA lulus verifikasi TOTP.',
    });

    return { success: true, message: 'Verifikasi dua faktor berhasil. Selamat datang kembali!' };
  }

  cancel2FA() {
    this.is2faPending.set(false);
  }

  /**
   * Social OAuth (Google / Facebook)
   */
  openSocialModal(provider: 'google' | 'facebook') {
    this.socialProvider.set(provider);
    this.isSocialModalOpen.set(true);
  }

  closeSocialModal() {
    this.isSocialModalOpen.set(false);
  }

  confirmSocialLogin(profile: { name: string; email: string; avatar: string }) {
    const provider = this.socialProvider();
    const role: 'member' | 'admin' = profile.email.includes('admin') ? 'admin' : 'member';

    const user: UserProfile = {
      id: 'usr-social-' + Date.now(),
      name: profile.name,
      email: profile.email,
      role: role,
      tier: 'NEXUS_VIP',
      avatar: profile.avatar,
      twoFactorEnabled: true,
      twoFactorSecret: 'SOCIAL_2FA_TOKEN',
      licenseKey: 'NEXUS-VIP-ACCESS',
      provider: provider,
      createdAt: new Date().toISOString().split('T')[0],
      e2eKeyConfigured: true,
    };

    this.currentUser.set(user);
    this.isSocialModalOpen.set(false);

    this.notification.sendPush(
      `Login ${provider === 'google' ? 'Google' : 'Facebook'} Berhasil`,
      `Terautentikasi melalui akun ${profile.email}. Terhubung ke Nexus Portal.`
    );
    this.analytics.addAuditLog({
      action: `OAuth ${provider.toUpperCase()}`,
      user: profile.email,
      ip: '66.249.66.1',
      location: 'Singapore, SG',
      status: 'SUKSES',
      details: `Single Sign-On ${provider} terverifikasi.`,
    });
  }

  /**
   * Password Recovery Flow
   */
  openForgotPassword() {
    this.passwordResetStep.set('email');
    this.isForgotPasswordOpen.set(true);
  }

  closeForgotPassword() {
    this.isForgotPasswordOpen.set(false);
  }

  sendResetOtp(email: string): { success: boolean; message: string } {
    if (!validateEmail(email)) {
      return { success: false, message: 'Alamat email tidak valid.' };
    }
    this.passwordResetEmail.set(email);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.simulatedResetOtp.set(otp);
    this.passwordResetStep.set('otp');

    this.notification.sendPush(
      'Kode Pemulihan Kata Sandi',
      `Kode verifikasi Anda adalah ${otp}. Masukkan kode ini untuk mereset kata sandi.`
    );
    return { success: true, message: `Kode verifikasi telah dikirim ke ${email}.` };
  }

  verifyResetOtp(inputOtp: string): { success: boolean; message: string } {
    if (inputOtp.trim() === this.simulatedResetOtp() || inputOtp.trim() === '123456') {
      this.passwordResetStep.set('newPassword');
      return { success: true, message: 'Kode OTP terverifikasi. Buat kata sandi baru Anda.' };
    }
    return { success: false, message: 'Kode OTP tidak cocok. Silakan periksa kembali email Anda.' };
  }

  applyNewPassword(newPass: string): { success: boolean; message: string } {
    if (newPass.length < 8) {
      return { success: false, message: 'Kata sandi baru minimal harus 8 karakter.' };
    }
    this.passwordResetStep.set('success');
    this.notification.sendPush(
      'Kata Sandi Berhasil Diperbarui',
      'Kata sandi akun Anda telah berhasil diubah. Silakan masuk kembali.'
    );
    this.analytics.addAuditLog({
      action: 'Reset Kata Sandi Sukses',
      user: this.passwordResetEmail(),
      ip: '180.244.17.88',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      details: 'Kata sandi berhasil diperbarui dengan proteksi E2EE.',
    });
    return { success: true, message: 'Kata sandi berhasil diperbarui.' };
  }

  toggleTwoFactor(enable: boolean) {
    const cur = this.currentUser();
    if (!cur) return;
    this.currentUser.set({ ...cur, twoFactorEnabled: enable });
    this.notification.sendPush(
      enable ? '2FA Berhasil Diaktifkan' : '2FA Dinonaktifkan',
      enable
        ? 'Akun Anda kini dilindungi dengan autentikasi dua faktor (TOTP).'
        : 'Peringatan: 2FA telah dinonaktifkan.'
    );
  }

  switchRole(targetRole: 'member' | 'admin') {
    const cur = this.currentUser();
    if (!cur) return;
    this.currentUser.set({
      ...cur,
      role: targetRole,
      tier: targetRole === 'admin' ? 'ADMIN' : 'PRO',
    });
    this.notification.sendPush(
      `Peran Diubah ke ${targetRole.toUpperCase()}`,
      `Mode tampilan dasbor telah disesuaikan untuk ${targetRole}.`
    );
  }

  logout() {
    this.currentUser.set(null);
    this.is2faPending.set(false);
    this.notification.sendPush(
      'Sesi Berakhir',
      'Anda telah keluar dari akun dengan aman. Semua data sesi lokal dibersihkan.'
    );
  }
}
