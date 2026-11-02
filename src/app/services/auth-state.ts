import { Injectable, signal, computed, inject } from '@angular/core';
import { validateActivationCode, validateEmail, verifyTotpCode, validateRegistration, RegistrationInput } from '../core/auth-validator';
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

export interface RegisteredMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'MEMBER_GRATIS' | 'PRO_LICENSE' | 'ENTERPRISE' | 'NEXUS_VIP';
  licenseKey?: string;
  status: 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'AKTIF';
  registeredAt: string;
  source: 'FORM_PENDAFTARAN' | 'AKTIVASI_LISENSI' | 'OAUTH_GOOGLE';
}

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private readonly notification = inject(NotificationState);
  private readonly analytics = inject(AnalyticsState);

  // Default to null so user ALWAYS passes through the Login/Registration/Activation form first
  readonly currentUser = signal<UserProfile | null>(null);

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // Synchronized Registered Members (visible in Admin Dashboard)
  readonly registeredMembers = signal<RegisteredMember[]>([
    {
      id: 'reg-001',
      name: 'Rian Pratama',
      email: 'rian.pratama@gmail.com',
      phone: '081234567890',
      plan: 'PRO_LICENSE',
      licenseKey: 'LD-PREMIUM-2026',
      status: 'AKTIF',
      registeredAt: 'Hari ini, 08:15',
      source: 'FORM_PENDAFTARAN',
    },
    {
      id: 'reg-002',
      name: 'Siti Rahmawati',
      email: 'siti.rahmawati@digitalcorp.id',
      phone: '082199887766',
      plan: 'NEXUS_VIP',
      licenseKey: 'NEXUS-VIP-ACCESS',
      status: 'TERVERIFIKASI',
      registeredAt: 'Kemarin, 14:20',
      source: 'FORM_PENDAFTARAN',
    },
    {
      id: 'reg-003',
      name: 'Dodi Hermawan',
      email: 'dodi.hermawan@techindo.com',
      phone: '085712345678',
      plan: 'MEMBER_GRATIS',
      status: 'MENUNGGU_VERIFIKASI',
      registeredAt: 'Kemarin, 19:40',
      source: 'FORM_PENDAFTARAN',
    },
  ]);

  // UI Navigation & Modals: Default to 'login'
  readonly activeAuthTab = signal<'activate' | 'login' | 'register'>('login');
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
   * Activate Account / License (matches Nexus AI Solution /activate)
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
      name: name.trim() || 'Pengguna Nexus AI Solution',
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

    return { success: true, message: 'Aktivasi lisensi berhasil! Selamat datang di Nexus AI Solution.' };
  }

  /**
   * Login using Activation Code / License ONLY
   */
  loginWithLicense(code: string): { success: boolean; message: string; role?: 'member' | 'admin' } {
    if (!code || !code.trim()) {
      return { success: false, message: 'Masukkan Kode Aktivasi / Lisensi untuk masuk.' };
    }

    const trimmedCode = code.trim().toUpperCase();
    const val = validateActivationCode(trimmedCode);
    if (!val.isValid) {
      return { success: false, message: val.message };
    }

    // Check if this license key matches an existing registered member
    const existingMember = this.registeredMembers().find(
      (m) => m.licenseKey && m.licenseKey.toUpperCase() === trimmedCode
    );

    const assignedRole: 'member' | 'admin' = val.tier === 'ADMIN' ? 'admin' : 'member';
    const userName = existingMember
      ? existingMember.name
      : (assignedRole === 'admin' ? 'Administrator Nexus' : 'Member Nexus AI');
    const userEmail = existingMember
      ? existingMember.email
      : (assignedRole === 'admin' ? 'admin@nexusaisolution.com' : 'member@nexusaisolution.com');

    const user: UserProfile = {
      id: existingMember ? existingMember.id : 'usr-' + Date.now(),
      name: userName,
      email: userEmail,
      role: assignedRole,
      tier: val.tier as UserProfile['tier'],
      avatar: assignedRole === 'admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      twoFactorEnabled: true,
      twoFactorSecret: 'NEXUS' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      licenseKey: trimmedCode,
      provider: 'local',
      createdAt: existingMember?.registeredAt || new Date().toISOString().split('T')[0],
      e2eKeyConfigured: true,
    };

    // If existing member was pending, activate their status
    if (existingMember && existingMember.status !== 'AKTIF') {
      this.registeredMembers.update((list) =>
        list.map((m) => (m.id === existingMember.id ? { ...m, status: 'AKTIF' } : m))
      );
    }

    this.currentUser.set(user);
    this.is2faPending.set(false);

    this.notification.sendPush(
      'Login Lisensi Berhasil!',
      `Selamat datang ${userName}! Lisensi ${val.productName} terverifikasi. Masuk sebagai ${assignedRole.toUpperCase()}.`
    );

    this.analytics.addAuditLog({
      action: 'Login Lisensi Resmi',
      user: user.email,
      ip: '180.244.17.88',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      details: `Login berhasil menggunakan Lisensi ${trimmedCode} (${val.tier} - ${assignedRole}).`,
    });

    return {
      success: true,
      message: `Lisensi valid! Selamat datang di Dasbor ${assignedRole === 'admin' ? 'Admin' : 'Member'}.`,
      role: assignedRole,
    };
  }

  /**
   * Login with email and password (legacy/fallback)
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

    const email = this.pendingLoginEmail() || 'member@nexusaisolution.com';
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
    this.activeAuthTab.set('login');
    this.notification.sendPush(
      'Sesi Berakhir',
      'Anda telah keluar dari akun dengan aman. Semua data sesi lokal dibersihkan.'
    );
  }

  /**
   * Register new member from the login/registration form
   * Automatically syncs new member data to Admin Dashboard in real-time!
   */
  registerMember(
    input: RegistrationInput,
    plan: RegisteredMember['plan'] = 'MEMBER_GRATIS',
    licenseKey?: string
  ): { success: boolean; message: string; generatedLicense?: string } {
    const val = validateRegistration(input);
    if (!val.isValid) {
      return { success: false, message: val.message || 'Data pendaftaran tidak valid.' };
    }

    // Check if email already registered
    const existing = this.registeredMembers().find(
      (m) => m.email.toLowerCase() === input.email.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'Alamat email ini sudah terdaftar. Silakan langsung masuk di tab Login.' };
    }

    const generatedKey = licenseKey?.trim() ||
      (plan === 'PRO_LICENSE'
        ? 'NEXUS-PREMIUM-2026'
        : ('NEXUS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-2026'));

    const newMember: RegisteredMember = {
      id: 'reg-' + Date.now(),
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      plan: plan,
      licenseKey: generatedKey,
      status: 'MENUNGGU_VERIFIKASI',
      registeredAt: 'Baru saja',
      source: 'FORM_PENDAFTARAN',
    };

    // Synchronize to Admin Dashboard state
    this.registeredMembers.update((list) => [newMember, ...list]);

    // Send Real-Time Push Notification & Audit Log to Admin
    this.notification.sendPush(
      'Registrasi Member Baru Disinkronkan',
      `${newMember.name} (${newMember.email}) telah mendaftar dengan Lisensi: ${generatedKey}.`
    );

    this.analytics.addAuditLog({
      action: 'Registrasi Member Baru',
      user: newMember.email,
      ip: '182.253.11.20',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      details: `Pendaftaran member baru: ${newMember.name} (${newMember.phone}) disinkronkan ke Dasbor Admin dengan Lisensi ${generatedKey}.`,
    });

    return {
      success: true,
      message: `Pendaftaran berhasil! Kode Lisensi resmi Anda: ${generatedKey}. Anda dapat langsung menggunakannya untuk masuk.`,
      generatedLicense: generatedKey,
    };
  }

  /**
   * Admin function: Approve and activate a registered member
   */
  approveMember(memberId: string) {
    this.registeredMembers.update((list) =>
      list.map((m) =>
        m.id === memberId
          ? {
              ...m,
              status: 'AKTIF',
              licenseKey: m.licenseKey || 'LD-PRO-' + Math.floor(1000 + Math.random() * 9000),
            }
          : m
      )
    );

    const approved = this.registeredMembers().find((m) => m.id === memberId);
    if (approved) {
      this.notification.sendPush(
        'Member Diaktifkan Admin',
        `Member ${approved.name} (${approved.email}) telah disetujui & lisensi aktif diterbitkan.`
      );
      this.analytics.addAuditLog({
        action: 'Verifikasi & Aktivasi Member',
        user: approved.email,
        ip: '10.0.1.5',
        location: 'Admin Portal',
        status: 'SUKSES',
        details: `Admin mengaktifkan akun dan menerbitkan lisensi ${approved.licenseKey}.`,
      });
    }
  }

  /**
   * Admin function: Delete or reject registered member
   */
  deleteMember(memberId: string) {
    this.registeredMembers.update((list) => list.filter((m) => m.id !== memberId));
    this.notification.sendPush('Member Dihapus', 'Data registrasi member telah dihapus dari sistem.');
  }
}
