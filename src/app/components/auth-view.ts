import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthState, RegisteredMember } from '../services/auth-state';
import { validateActivationCode, ActivationCodeValidation, evaluatePasswordStrength, PasswordStrength } from '../core/auth-validator';

@Component({
  selector: 'app-auth-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="w-full max-w-xl mx-auto py-6 px-4 sm:px-0">
      
      <!-- Card Container with Glassmorphism -->
      <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        <!-- Glowing Ambient Accent -->
        <div class="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <!-- Brand Title -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 text-xs font-semibold text-cyan-400 mb-2">
            <mat-icon class="text-sm">verified_user</mat-icon>
            NEXUS AI SOLUTION &bull; PORTAL RESMI
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Autentikasi Lisensi Resmi
          </h1>
          <p class="mt-1 text-xs sm:text-sm text-slate-400">
            Masuk Langsung Menggunakan <span class="text-cyan-400 font-semibold">Kode Aktivasi / Lisensi</span>
          </p>
        </div>

        <!-- 2FA Active Challenge Screen (if triggered) -->
        @if (auth.is2faPending()) {
          <div class="space-y-4 animate-fade-in">
            <div class="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-3">
                <mat-icon class="text-3xl">security</mat-icon>
              </div>
              <h2 class="text-base font-bold text-white">Verifikasi Autentikasi Dua Faktor (2FA)</h2>
              <p class="mt-1 text-xs text-slate-300">
                Masukkan 6-digit kode verifikasi TOTP untuk otorisasi akun.
              </p>

              <!-- Helper Demo Code for testing -->
              <div class="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 border border-cyan-500/30 px-3 py-1.5 text-xs">
                <span class="text-slate-400">Kode TOTP Demo:</span>
                <span class="font-mono font-bold text-emerald-400 text-sm tracking-wider">{{ auth.simulatedTotpCode() }}</span>
                <button
                  type="button"
                  (click)="twoFactorInputControl.setValue(auth.simulatedTotpCode())"
                  class="ml-1 text-[11px] text-cyan-400 hover:underline cursor-pointer"
                >
                  Gunakan
                </button>
              </div>
            </div>

            <div>
              <label for="two-factor-code" class="block text-xs font-semibold text-slate-300 mb-1.5 text-center">Kode 6-Digit TOTP</label>
              <input
                id="two-factor-code"
                type="text"
                maxlength="6"
                [formControl]="twoFactorInputControl"
                placeholder="123456"
                class="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold rounded-2xl border border-cyan-500/50 bg-slate-950 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            @if (authErrorMessage()) {
              <div class="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                <mat-icon class="text-red-400 text-sm shrink-0">error_outline</mat-icon>
                <span>{{ authErrorMessage() }}</span>
              </div>
            }

            <div class="flex flex-col gap-2 pt-2">
              <button
                type="button"
                (click)="submit2FACode()"
                class="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition cursor-pointer"
              >
                Verifikasi & Buka Dasbor
              </button>
              <button
                type="button"
                (click)="auth.cancel2FA()"
                class="w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Batal / Kembali
              </button>
            </div>
          </div>
        } @else {

          <!-- Dual Tab Switcher: Masuk dengan Lisensi vs Pendaftaran Member -->
          <div class="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-950 p-1.5 mb-6 border border-slate-800 text-xs">
            <button
              type="button"
              (click)="auth.setAuthTab('login')"
              [class]="auth.activeAuthTab() === 'login' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'"
              class="rounded-xl py-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <mat-icon class="text-sm">key</mat-icon>
              <span>Masuk dengan Lisensi</span>
            </button>

            <button
              type="button"
              (click)="auth.setAuthTab('register')"
              [class]="auth.activeAuthTab() === 'register' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'"
              class="rounded-xl py-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <mat-icon class="text-sm">person_add</mat-icon>
              <span>Daftar Member Baru</span>
            </button>
          </div>

          <!-- Registration Success Banner with Quick Login Action -->
          @if (registrationSuccessMsg()) {
            <div class="mb-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs text-emerald-300 animate-fade-in space-y-2">
              <div class="flex items-center gap-2 font-bold text-sm text-white">
                <mat-icon class="text-emerald-400 text-base">task_alt</mat-icon>
                Pendaftaran Berhasil Disinkronkan ke Admin!
              </div>
              <p class="text-slate-300 leading-relaxed">{{ registrationSuccessMsg() }}</p>
              
              @if (registeredLicenseKey()) {
                <div class="rounded-xl bg-slate-950 border border-emerald-500/50 p-3 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 block">KODE LISENSI ANDA:</span>
                    <span class="font-mono text-base font-extrabold text-emerald-400">{{ registeredLicenseKey() }}</span>
                  </div>
                  <button
                    type="button"
                    (click)="useRegisteredLicense()"
                    class="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <mat-icon class="text-sm">login</mat-icon>
                    Gunakan & Masuk
                  </button>
                </div>
              }
            </div>
          }

          <!-- ============================================================== -->
          <!-- TAB 1: LOGIN MENGGUNAKAN KODE AKTIVASI / LISENSI SAJA           -->
          <!-- ============================================================== -->
          @if (auth.activeAuthTab() === 'login') {
            <form class="space-y-4 animate-fade-in" (submit)="$event.preventDefault(); handleLicenseLogin()">
              
              <!-- Activation Code / License Input (The ONLY input field on login) -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="login-license-code" class="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <mat-icon class="text-sm text-cyan-400">vpn_key</mat-icon>
                    Kode Aktivasi / Lisensi Resmi
                  </label>
                  <span class="text-[10px] text-slate-400 font-mono">Format: NEXUS-XXXX-XXXX-XXXX</span>
                </div>

                <div class="relative">
                  <input
                    id="login-license-code"
                    type="text"
                    [formControl]="licenseInputControl"
                    (input)="onLicenseInputChange()"
                    placeholder="Masukkan Kode Lisensi (Contoh: NEXUS-PREMIUM-2026 atau PRO-NEXUS-ADMIN)"
                    class="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-4 pr-10 text-sm font-mono uppercase text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                  @if (licenseValidation().isValid) {
                    <mat-icon class="absolute right-3.5 top-3.5 text-emerald-400 text-lg">check_circle</mat-icon>
                  }
                </div>

                <!-- Quick Preset Demo Keys for Fast Testing -->
                <div class="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span class="text-slate-500 text-[11px] font-medium">Kunci Demo Cepat:</span>
                  <button
                    type="button"
                    (click)="fillPresetLicense('NEXUS-PREMIUM-2026')"
                    class="rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-emerald-400 hover:bg-slate-700 hover:border-emerald-500/40 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">person</mat-icon>
                    NEXUS-PREMIUM-2026
                  </button>
                  <button
                    type="button"
                    (click)="fillPresetLicense('PRO-NEXUS-ADMIN')"
                    class="rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-cyan-400 hover:bg-slate-700 hover:border-cyan-500/40 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">shield</mat-icon>
                    PRO-NEXUS-ADMIN
                  </button>
                  <button
                    type="button"
                    (click)="fillPresetLicense('NEXUS-VIP-ACCESS')"
                    class="rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-purple-400 hover:bg-slate-700 hover:border-purple-500/40 font-mono text-[11px] transition cursor-pointer flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">workspace_premium</mat-icon>
                    NEXUS-VIP-ACCESS
                  </button>
                </div>

                <!-- Real-Time Cryptographic Validation Badge -->
                @if (licenseValidation().isValid) {
                  <div class="mt-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center justify-between animate-fade-in">
                    <div class="flex items-center gap-2.5">
                      <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <mat-icon class="text-sm">verified</mat-icon>
                      </div>
                      <div>
                        <div class="font-bold text-white text-xs">{{ licenseValidation().productName }}</div>
                        <div class="text-[11px] text-emerald-400/90">Lisensi Terverifikasi &bull; Siap Masuk ke Sistem</div>
                      </div>
                    </div>
                    <span class="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      {{ licenseValidation().tier }}
                    </span>
                  </div>
                }
              </div>

              @if (authErrorMessage()) {
                <div class="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                  <mat-icon class="text-red-400 text-sm shrink-0">error_outline</mat-icon>
                  <span>{{ authErrorMessage() }}</span>
                </div>
              }

              <!-- Submit Login with License Button -->
              <button
                type="submit"
                class="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-base">lock_open</mat-icon>
                <span>Masuk dengan Lisensi Resmi</span>
              </button>

              <!-- Not a Member Yet Callout Banner -->
              <div class="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 flex items-center justify-between gap-3 mt-4">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                    <mat-icon class="text-sm">person_add</mat-icon>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white">Belum Memiliki Kode Lisensi?</div>
                    <div class="text-[11px] text-slate-400">Daftar sekarang untuk sinkronisasi otomatis ke Admin</div>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="auth.setAuthTab('register')"
                  class="rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shrink-0 cursor-pointer"
                >
                  Daftar Baru &rarr;
                </button>
              </div>

              <!-- End-to-End Security Note -->
              <div class="text-center pt-2">
                <span class="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <mat-icon class="text-xs text-emerald-500">enhanced_encryption</mat-icon>
                  Dilindungi Enkripsi AES-256 E2EE & Otorisasi Kriptografis
                </span>
              </div>

            </form>
          }

          <!-- ============================================================== -->
          <!-- TAB 2: FORM PENDAFTARAN MEMBER (Daftar & Sinkronisasi ke Admin) -->
          <!-- ============================================================== -->
          @if (auth.activeAuthTab() === 'register') {
            <form class="space-y-4 animate-fade-in" (submit)="$event.preventDefault(); handleRegister()">
              
              <div class="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-emerald-300 flex items-start gap-2">
                <mat-icon class="text-emerald-400 text-sm shrink-0 mt-0.5">sync_alt</mat-icon>
                <div>
                  <span class="font-bold">Sinkronisasi Otomatis ke Dasbor Admin:</span>
                  <p class="text-[11px] text-slate-400 mt-0.5">
                    Data pendaftaran Anda langsung tersinkronisasi ke portal Admin Nexus untuk verifikasi & penerbitan lisensi resmi.
                  </p>
                </div>
              </div>

              <!-- Nama Lengkap -->
              <div>
                <label for="reg-name" class="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">badge</mat-icon>
                  <input
                    id="reg-name"
                    type="text"
                    [formControl]="regNameControl"
                    placeholder="Nama Lengkap Anda"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Email & Phone Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="reg-email" class="block text-xs font-semibold text-slate-300 mb-1">Alamat Email</label>
                  <div class="relative">
                    <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">alternate_email</mat-icon>
                    <input
                      id="reg-email"
                      type="email"
                      [formControl]="regEmailControl"
                      placeholder="nama@domain.com"
                      class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label for="reg-phone" class="block text-xs font-semibold text-slate-300 mb-1">Nomor WhatsApp / HP</label>
                  <div class="relative">
                    <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">phone</mat-icon>
                    <input
                      id="reg-phone"
                      type="tel"
                      [formControl]="regPhoneControl"
                      placeholder="08123456789"
                      class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <!-- Pilihan Paket Member -->
              <div>
                <label for="reg-plan" class="block text-xs font-semibold text-slate-300 mb-1">Pilihan Paket / Tingkat Akun</label>
                <select
                  id="reg-plan"
                  [formControl]="regPlanControl"
                  class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="MEMBER_GRATIS">Member Gratis (Akses Portal & Komunitas)</option>
                  <option value="PRO_LICENSE">Pro Member (Termasuk Lisensi NEXUS-PREMIUM-2026)</option>
                  <option value="NEXUS_VIP">Nexus VIP Member (Akses Global Nexus Portal)</option>
                  <option value="ENTERPRISE">Enterprise Corporate Suite</option>
                </select>
              </div>

              <!-- Kata Sandi & Konfirmasi -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="reg-pass" class="block text-xs font-semibold text-slate-300 mb-1">Kata Sandi Baru</label>
                  <input
                    id="reg-pass"
                    type="password"
                    [formControl]="regPasswordControl"
                    (input)="checkRegStrength()"
                    placeholder="Min 8 karakter..."
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label for="reg-confirm-pass" class="block text-xs font-semibold text-slate-300 mb-1">Konfirmasi Kata Sandi</label>
                  <input
                    id="reg-confirm-pass"
                    type="password"
                    [formControl]="regConfirmPasswordControl"
                    placeholder="Ulangi sandi..."
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Password Strength Meter -->
              @if (regPasswordControl.value) {
                <div class="space-y-1">
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-slate-400">Kekuatan Sandi:</span>
                    <span class="font-bold text-slate-200">{{ regPasswordStrength().label }}</span>
                  </div>
                  <div class="grid grid-cols-4 gap-1.5 h-1">
                    <div [class]="regPasswordStrength().score >= 1 ? regPasswordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                    <div [class]="regPasswordStrength().score >= 2 ? regPasswordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                    <div [class]="regPasswordStrength().score >= 3 ? regPasswordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                    <div [class]="regPasswordStrength().score >= 4 ? regPasswordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                  </div>
                </div>
              }

              <!-- Terms Checkbox -->
              <div class="flex items-start gap-2 text-xs text-slate-400 pt-1">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked
                  class="mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                <label for="agree-terms" class="cursor-pointer text-[11px]">
                  Saya setuju dengan enkripsi data E2EE & sinkronisasi otomatis ke Dasbor Admin Nexus.
                </label>
              </div>

              @if (authErrorMessage()) {
                <div class="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                  <mat-icon class="text-red-400 text-sm shrink-0">error_outline</mat-icon>
                  <span>{{ authErrorMessage() }}</span>
                </div>
              }

              <!-- Submit Register Button -->
              <button
                type="submit"
                class="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-sm">how_to_reg</mat-icon>
                <span>Daftar & Sinkronkan ke Admin Dashboard</span>
              </button>

              <div class="text-center text-[11px] text-slate-400 pt-1">
                Sudah memiliki Kode Lisensi?
                <button
                  type="button"
                  (click)="auth.setAuthTab('login')"
                  class="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  Masuk dengan Lisensi di sini
                </button>
              </div>

            </form>
          }

        }

      </div>
    </div>
  `,
})
export class AuthView {
  readonly auth = inject(AuthState);

  // License-Only Login Form Control (empty by default)
  readonly licenseInputControl = new FormControl('', [Validators.required]);
  readonly licenseValidation = signal<ActivationCodeValidation>(validateActivationCode(''));

  // 2FA TOTP Control
  readonly twoFactorInputControl = new FormControl('', [Validators.required]);

  // Registration Form Controls (empty by default)
  readonly regNameControl = new FormControl('', [Validators.required]);
  readonly regEmailControl = new FormControl('', [Validators.required]);
  readonly regPhoneControl = new FormControl('', [Validators.required]);
  readonly regPlanControl = new FormControl<RegisteredMember['plan']>('PRO_LICENSE', [Validators.required]);
  readonly regPasswordControl = new FormControl('', [Validators.required]);
  readonly regConfirmPasswordControl = new FormControl('', [Validators.required]);
  readonly regPasswordStrength = signal<PasswordStrength>({
    score: 0,
    label: 'Sangat Lemah',
    color: 'bg-red-500',
    checks: { minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false },
  });
  readonly registrationSuccessMsg = signal<string>('');
  readonly registeredLicenseKey = signal<string>('');

  readonly authErrorMessage = signal<string>('');

  onLicenseInputChange() {
    const val = validateActivationCode(this.licenseInputControl.value || '');
    this.licenseValidation.set(val);
  }

  fillPresetLicense(code: string) {
    this.licenseInputControl.setValue(code);
    this.onLicenseInputChange();
  }

  handleLicenseLogin() {
    this.authErrorMessage.set('');
    this.registrationSuccessMsg.set('');

    const code = this.licenseInputControl.value || '';
    if (!code.trim()) {
      this.authErrorMessage.set('Silakan masukkan Kode Aktivasi / Lisensi untuk masuk.');
      return;
    }

    const res = this.auth.loginWithLicense(code);
    if (!res.success) {
      this.authErrorMessage.set(res.message);
    }
  }

  checkRegStrength() {
    const val = this.regPasswordControl.value || '';
    this.regPasswordStrength.set(evaluatePasswordStrength(val));
  }

  handleRegister() {
    this.authErrorMessage.set('');
    this.registrationSuccessMsg.set('');

    const name = this.regNameControl.value || '';
    const email = this.regEmailControl.value || '';
    const phone = this.regPhoneControl.value || '';
    const password = this.regPasswordControl.value || '';
    const confirmPassword = this.regConfirmPasswordControl.value || '';
    const plan = this.regPlanControl.value || 'PRO_LICENSE';

    const res = this.auth.registerMember(
      { name, email, phone, password, confirmPassword },
      plan
    );

    if (!res.success) {
      this.authErrorMessage.set(res.message);
    } else {
      this.registrationSuccessMsg.set(res.message);
      if (res.generatedLicense) {
        this.registeredLicenseKey.set(res.generatedLicense);
        this.licenseInputControl.setValue(res.generatedLicense);
        this.onLicenseInputChange();
      }
      // Reset registration form
      this.regNameControl.reset();
      this.regEmailControl.reset();
      this.regPhoneControl.reset();
      this.regPasswordControl.reset();
      this.regConfirmPasswordControl.reset();
    }
  }

  useRegisteredLicense() {
    const key = this.registeredLicenseKey();
    if (key) {
      this.licenseInputControl.setValue(key);
      this.onLicenseInputChange();
      this.auth.setAuthTab('login');
      this.handleLicenseLogin();
    }
  }

  submit2FACode() {
    this.authErrorMessage.set('');
    const code = this.twoFactorInputControl.value || '';
    const res = this.auth.submit2FA(code);
    if (!res.success) {
      this.authErrorMessage.set(res.message);
    }
  }
}
