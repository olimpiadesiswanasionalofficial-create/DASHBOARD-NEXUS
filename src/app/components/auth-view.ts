import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';
import { validateActivationCode, ActivationCodeValidation } from '../core/auth-validator';

@Component({
  selector: 'app-auth-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="w-full max-w-lg mx-auto py-6 px-4 sm:px-0">
      
      <!-- Card Container with Glassmorphism -->
      <div class="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        
        <!-- Glowing Ambient Accent -->
        <div class="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <!-- Brand Title -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center gap-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <mat-icon class="text-sm">verified_user</mat-icon>
            LEVELING DIGITAL &bull; PORTAL RESMI
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Akses & Aktivasi Lisensi
          </h1>
          <p class="mt-1 text-xs sm:text-sm text-slate-400">
            Terintegrasi dengan <span class="text-cyan-400 font-semibold">Nexus Dashboard</span> & Proteksi End-to-End
          </p>
        </div>

        <!-- 2FA Active Screen (When user is in 2FA challenge) -->
        @if (auth.is2faPending()) {
          <div class="space-y-4 animate-fade-in">
            <div class="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-5 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mb-3">
                <mat-icon class="text-3xl">security</mat-icon>
              </div>
              <h2 class="text-base font-bold text-white">Verifikasi Autentikasi Dua Faktor</h2>
              <p class="mt-1 text-xs text-slate-300">
                Masukkan 6-digit kode verifikasi dari aplikasi Authenticator Anda untuk akun <span class="text-cyan-300 font-mono">{{ auth.pendingLoginEmail() }}</span>.
              </p>

              <!-- Helper Demo Code for seamless testing -->
              <div class="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 border border-cyan-500/30 px-3 py-1.5 text-xs">
                <span class="text-slate-400">Kode TOTP Demo:</span>
                <span class="font-mono font-bold text-emerald-400 text-sm tracking-wider">{{ auth.simulatedTotpCode() }}</span>
                <button
                  type="button"
                  (click)="twoFactorInputControl.setValue(auth.simulatedTotpCode())"
                  class="ml-1 text-[11px] text-cyan-400 hover:underline"
                >
                  Gunakan
                </button>
              </div>
            </div>

            <div>
              <label for="2fa-code" class="block text-xs font-semibold text-slate-300 mb-1.5 text-center">Kode 6-Digit TOTP</label>
              <input
                id="2fa-code"
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
                class="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
              >
                Verifikasi & Buka Dasbor
              </button>
              <button
                type="button"
                (click)="auth.cancel2FA()"
                class="w-full rounded-xl border border-slate-800 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Batal / Kembali
              </button>
            </div>
          </div>
        } @else {

          <!-- Tabs Switcher -->
          <div class="grid grid-cols-2 gap-1 rounded-2xl bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              (click)="auth.setAuthTab('activate')"
              [class]="auth.activeAuthTab() === 'activate' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'"
              class="rounded-xl py-2 text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <mat-icon class="text-sm">key</mat-icon> Aktivasi Lisensi
            </button>
            <button
              type="button"
              (click)="auth.setAuthTab('login')"
              [class]="auth.activeAuthTab() === 'login' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'"
              class="rounded-xl py-2 text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <mat-icon class="text-sm">login</mat-icon> Masuk Akun
            </button>
          </div>

          <!-- TAB 1: AKTIVASI LISENSI (Leveling Digital /activate) -->
          @if (auth.activeAuthTab() === 'activate') {
            <form class="space-y-4" (submit)="$event.preventDefault(); handleActivate()">
              
              <!-- Activation Code Input -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="activation-code" class="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <mat-icon class="text-xs text-emerald-400">vpn_key</mat-icon>
                    Kode Aktivasi / Lisensi
                  </label>
                  <span class="text-[10px] text-slate-400 font-mono">Format: LD-XXXX-XXXX-XXXX</span>
                </div>

                <input
                  id="activation-code"
                  type="text"
                  [formControl]="activationCodeControl"
                  (input)="onActivationCodeChange()"
                  placeholder="Contoh: LD-PREMIUM-2026"
                  class="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3 px-4 text-sm font-mono uppercase text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />

                <!-- Quick Test Keys Chips -->
                <div class="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span class="text-slate-500 text-[10px]">Coba Demo:</span>
                  <button
                    type="button"
                    (click)="fillPresetCode('LD-PREMIUM-2026')"
                    class="rounded-lg bg-slate-800/80 px-2 py-0.5 text-emerald-400 hover:bg-slate-700 font-mono"
                  >
                    LD-PREMIUM-2026
                  </button>
                  <button
                    type="button"
                    (click)="fillPresetCode('PRO-NEXUS-ADMIN')"
                    class="rounded-lg bg-slate-800/80 px-2 py-0.5 text-cyan-400 hover:bg-slate-700 font-mono"
                  >
                    PRO-NEXUS-ADMIN
                  </button>
                  <button
                    type="button"
                    (click)="fillPresetCode('NEXUS-VIP-ACCESS')"
                    class="rounded-lg bg-slate-800/80 px-2 py-0.5 text-purple-400 hover:bg-slate-700 font-mono"
                  >
                    NEXUS-VIP-ACCESS
                  </button>
                </div>

                <!-- Validation Status Badge -->
                @if (activationValidation().isValid) {
                  <div class="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-emerald-400 text-sm">check_circle</mat-icon>
                      <span class="font-semibold">{{ activationValidation().productName }}</span>
                    </div>
                    <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {{ activationValidation().tier }}
                    </span>
                  </div>
                }
              </div>

              <!-- Name & Email Inputs -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="reg-name" class="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    id="reg-name"
                    type="text"
                    [formControl]="nameControl"
                    placeholder="Nama Pengguna"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label for="reg-email" class="block text-xs font-semibold text-slate-300 mb-1">Email Aktif</label>
                  <input
                    id="reg-email"
                    type="email"
                    [formControl]="emailControl"
                    placeholder="user@domain.com"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              @if (authErrorMessage()) {
                <div class="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                  <mat-icon class="text-red-400 text-sm shrink-0">error_outline</mat-icon>
                  <span>{{ authErrorMessage() }}</span>
                </div>
              }

              <!-- Submit Button -->
              <button
                type="submit"
                class="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-sm">verified</mat-icon>
                Aktivasi Lisensi & Masuk
              </button>

              <div class="text-center text-[11px] text-slate-400 pt-1">
                Sudah memiliki akun aktif?
                <button
                  type="button"
                  (click)="auth.setAuthTab('login')"
                  class="text-emerald-400 font-semibold hover:underline"
                >
                  Masuk di sini
                </button>
              </div>
            </form>
          }

          <!-- TAB 2: MASUK / LOGIN -->
          @if (auth.activeAuthTab() === 'login') {
            <form class="space-y-4" (submit)="$event.preventDefault(); handleLogin()">
              
              <!-- Email Input -->
              <div>
                <label for="login-email" class="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">alternate_email</mat-icon>
                  <input
                    id="login-email"
                    type="email"
                    [formControl]="loginEmailControl"
                    placeholder="admin@nexus-digital.com"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <!-- Password Input -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="login-pass" class="text-xs font-semibold text-slate-300">Kata Sandi</label>
                  <button
                    type="button"
                    (click)="auth.openForgotPassword()"
                    class="text-xs text-cyan-400 hover:underline"
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">lock</mat-icon>
                  <input
                    id="login-pass"
                    [type]="showPassword() ? 'text' : 'password'"
                    [formControl]="loginPasswordControl"
                    placeholder="Masukkan kata sandi..."
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                  >
                    <mat-icon class="text-sm">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Remember Me & 2FA notice -->
              <div class="flex items-center justify-between text-xs text-slate-400">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked class="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0" />
                  <span>Ingat perangkat ini</span>
                </label>
                <span class="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <mat-icon class="text-xs">shield</mat-icon> Dilindungi 2FA
                </span>
              </div>

              @if (authErrorMessage()) {
                <div class="rounded-xl border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
                  <mat-icon class="text-red-400 text-sm shrink-0">error_outline</mat-icon>
                  <span>{{ authErrorMessage() }}</span>
                </div>
              }

              <!-- Submit Login Button -->
              <button
                type="submit"
                class="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <mat-icon class="text-sm">lock_open</mat-icon>
                Masuk dengan Proteksi 2FA
              </button>

              <!-- Social Login Divider -->
              <div class="relative my-4">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-slate-800"></div>
                </div>
                <div class="relative flex justify-center text-[10px] uppercase">
                  <span class="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                    Atau masuk langsung dengan
                  </span>
                </div>
              </div>

              <!-- Google & Facebook Buttons -->
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="auth.openSocialModal('google')"
                  class="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
                >
                  <svg class="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  (click)="auth.openSocialModal('facebook')"
                  class="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 p-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition"
                >
                  <svg class="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <div class="text-center text-[11px] text-slate-400 pt-1">
                Belum memiliki lisensi aktivasi?
                <button
                  type="button"
                  (click)="auth.setAuthTab('activate')"
                  class="text-cyan-400 font-semibold hover:underline"
                >
                  Aktivasi Lisensi
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

  // Form Controls
  readonly activationCodeControl = new FormControl('LD-PREMIUM-2026', [Validators.required]);
  readonly nameControl = new FormControl('Budi Pratama Santoso', [Validators.required]);
  readonly emailControl = new FormControl('budi.santoso@levelingdigital.com', [Validators.required]);

  readonly loginEmailControl = new FormControl('admin@nexus-digital.com', [Validators.required]);
  readonly loginPasswordControl = new FormControl('Leveling2026!', [Validators.required]);
  readonly twoFactorInputControl = new FormControl('123456', [Validators.required]);

  readonly showPassword = signal<boolean>(false);
  readonly authErrorMessage = signal<string>('');
  readonly activationValidation = signal<ActivationCodeValidation>(validateActivationCode('LD-PREMIUM-2026'));

  onActivationCodeChange() {
    const val = validateActivationCode(this.activationCodeControl.value || '');
    this.activationValidation.set(val);
  }

  fillPresetCode(code: string) {
    this.activationCodeControl.setValue(code);
    this.onActivationCodeChange();
  }

  handleActivate() {
    this.authErrorMessage.set('');
    const code = this.activationCodeControl.value || '';
    const name = this.nameControl.value || '';
    const email = this.emailControl.value || '';

    const res = this.auth.activateAccount(code, name, email);
    if (!res.success) {
      this.authErrorMessage.set(res.message);
    }
  }

  handleLogin() {
    this.authErrorMessage.set('');
    const email = this.loginEmailControl.value || '';
    const pass = this.loginPasswordControl.value || '';

    const res = this.auth.login(email, pass);
    if (!res.success) {
      this.authErrorMessage.set(res.message);
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
