import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';
import { evaluatePasswordStrength, PasswordStrength } from '../core/auth-validator';

@Component({
  selector: 'app-forgot-password-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    @if (auth.isForgotPasswordOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <mat-icon class="text-sm">mark_email_read</mat-icon>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Pemulihan Kata Sandi</h3>
                <p class="text-xs text-slate-400">Integrasi email verifikasi keamanan Nexus AI Solution</p>
              </div>
            </div>
            <button
              type="button"
              (click)="auth.closeForgotPassword()"
              class="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Dialog Pemulihan Sandi"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <!-- Step Progress Indicator -->
          <div class="mt-4 flex items-center justify-between text-xs text-slate-400 pb-2">
            <div [class]="auth.passwordResetStep() === 'email' ? 'text-cyan-400 font-bold' : 'text-slate-500'">1. Email</div>
            <div class="h-0.5 w-6 bg-slate-800"></div>
            <div [class]="auth.passwordResetStep() === 'otp' ? 'text-cyan-400 font-bold' : 'text-slate-500'">2. Kode OTP</div>
            <div class="h-0.5 w-6 bg-slate-800"></div>
            <div [class]="auth.passwordResetStep() === 'newPassword' ? 'text-cyan-400 font-bold' : 'text-slate-500'">3. Sandi Baru</div>
            <div class="h-0.5 w-6 bg-slate-800"></div>
            <div [class]="auth.passwordResetStep() === 'success' ? 'text-emerald-400 font-bold' : 'text-slate-500'">4. Selesai</div>
          </div>

          <!-- Step 1: Input Email -->
          @if (auth.passwordResetStep() === 'email') {
            <div class="mt-4 space-y-4">
              <p class="text-xs text-slate-300 leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun Anda. Sistem akan mengirimkan 6-digit kode OTP pemulihan kata sandi.
              </p>

              <div>
                <label for="recovery-email" class="block text-xs font-semibold text-slate-300 mb-1.5">Alamat Email Terdaftar</label>
                <div class="relative">
                  <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">alternate_email</mat-icon>
                  <input
                    id="recovery-email"
                    type="email"
                    [formControl]="emailControl"
                    placeholder="nama@domain.com"
                    class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              @if (errorMessage()) {
                <p class="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg p-2.5">
                  {{ errorMessage() }}
                </p>
              }

              <div class="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  (click)="auth.closeForgotPassword()"
                  class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  (click)="handleSendOtp()"
                  class="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95 shadow-md shadow-cyan-500/20"
                >
                  Kirim Kode OTP
                </button>
              </div>
            </div>
          }

          <!-- Step 2: Input OTP -->
          @if (auth.passwordResetStep() === 'otp') {
            <div class="mt-4 space-y-4">
              <div class="rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-3 text-xs text-cyan-300">
                <div class="font-semibold">Kode OTP Telah Dikirim!</div>
                <div class="mt-1 text-slate-400">
                  Periksa email Anda di <span class="text-white font-mono">{{ auth.passwordResetEmail() }}</span>.
                </div>
                <div class="mt-2 text-emerald-400 font-mono text-[11px] bg-slate-950/80 p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                  <span>Simulasi Kode OTP:</span>
                  <span class="font-bold text-sm text-emerald-300 tracking-widest">{{ auth.simulatedResetOtp() }}</span>
                </div>
              </div>

              <div>
                <label for="recovery-otp" class="block text-xs font-semibold text-slate-300 mb-1.5">Masukkan 6-Digit Kode OTP</label>
                <input
                  id="recovery-otp"
                  type="text"
                  [formControl]="otpControl"
                  maxlength="6"
                  placeholder="Contoh: {{ auth.simulatedResetOtp() }}"
                  class="w-full text-center tracking-widest font-mono text-lg rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              @if (errorMessage()) {
                <p class="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg p-2.5">
                  {{ errorMessage() }}
                </p>
              }

              <div class="flex items-center justify-between pt-2">
                <button
                  type="button"
                  (click)="handleResendOtp()"
                  class="text-xs text-cyan-400 hover:underline"
                >
                  Kirim Ulang Kode
                </button>
                <button
                  type="button"
                  (click)="handleVerifyOtp()"
                  class="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95"
                >
                  Verifikasi Kode
                </button>
              </div>
            </div>
          }

          <!-- Step 3: Set New Password -->
          @if (auth.passwordResetStep() === 'newPassword') {
            <div class="mt-4 space-y-4">
              <p class="text-xs text-slate-300 leading-relaxed">
                Buat kata sandi baru yang kuat. Pastikan memenuhi standar keamanan enkripsi.
              </p>

              <div>
                <label for="new-pass" class="block text-xs font-semibold text-slate-300 mb-1.5">Kata Sandi Baru</label>
                <input
                  id="new-pass"
                  type="password"
                  [formControl]="newPasswordControl"
                  (input)="checkStrength()"
                  placeholder="Minimal 8 karakter..."
                  class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />

                <!-- Strength Meter -->
                @if (newPasswordControl.value) {
                  <div class="mt-2.5 space-y-1.5">
                    <div class="flex items-center justify-between text-[11px]">
                      <span class="text-slate-400">Kekuatan Sandi:</span>
                      <span class="font-bold text-slate-200">{{ passwordStrength().label }}</span>
                    </div>
                    <div class="grid grid-cols-4 gap-1.5 h-1.5">
                      <div [class]="passwordStrength().score >= 1 ? passwordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                      <div [class]="passwordStrength().score >= 2 ? passwordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                      <div [class]="passwordStrength().score >= 3 ? passwordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                      <div [class]="passwordStrength().score >= 4 ? passwordStrength().color : 'bg-slate-800'" class="rounded-full"></div>
                    </div>
                  </div>
                }
              </div>

              <div>
                <label for="confirm-pass" class="block text-xs font-semibold text-slate-300 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <input
                  id="confirm-pass"
                  type="password"
                  [formControl]="confirmPasswordControl"
                  placeholder="Ulangi kata sandi..."
                  class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              @if (errorMessage()) {
                <p class="text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg p-2.5">
                  {{ errorMessage() }}
                </p>
              }

              <div class="flex justify-end pt-2">
                <button
                  type="button"
                  (click)="handleSaveNewPassword()"
                  class="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-95"
                >
                  Simpan & Perbarui Sandi
                </button>
              </div>
            </div>
          }

          <!-- Step 4: Success -->
          @if (auth.passwordResetStep() === 'success') {
            <div class="mt-4 text-center py-4 space-y-3">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <mat-icon class="text-3xl">check_circle</mat-icon>
              </div>
              <h4 class="text-base font-bold text-white">Kata Sandi Berhasil Diperbarui</h4>
              <p class="text-xs text-slate-400 max-w-xs mx-auto">
                Akun Anda telah diamankan dengan kata sandi baru. Anda sekarang dapat masuk kembali ke Nexus AI Solution.
              </p>
              <button
                type="button"
                (click)="finishAndLogin()"
                class="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:opacity-95"
              >
                Kembali ke Login
              </button>
            </div>
          }

        </div>
      </div>
    }
  `,
})
export class ForgotPasswordModal {
  readonly auth = inject(AuthState);

  readonly emailControl = new FormControl('', [Validators.required]);
  readonly otpControl = new FormControl('', [Validators.required]);
  readonly newPasswordControl = new FormControl('', [Validators.required]);
  readonly confirmPasswordControl = new FormControl('', [Validators.required]);

  readonly errorMessage = signal<string>('');
  readonly passwordStrength = signal<PasswordStrength>({
    score: 0,
    label: 'Sangat Lemah',
    color: 'bg-red-500',
    checks: { minLength: false, hasUppercase: false, hasLowercase: false, hasNumber: false, hasSpecial: false },
  });

  checkStrength() {
    const val = this.newPasswordControl.value || '';
    this.passwordStrength.set(evaluatePasswordStrength(val));
  }

  handleSendOtp() {
    this.errorMessage.set('');
    const email = this.emailControl.value || '';
    const res = this.auth.sendResetOtp(email);
    if (!res.success) {
      this.errorMessage.set(res.message);
    } else {
      this.otpControl.setValue(this.auth.simulatedResetOtp());
    }
  }

  handleResendOtp() {
    const email = this.auth.passwordResetEmail();
    this.auth.sendResetOtp(email);
    this.otpControl.setValue(this.auth.simulatedResetOtp());
  }

  handleVerifyOtp() {
    this.errorMessage.set('');
    const otp = this.otpControl.value || '';
    const res = this.auth.verifyResetOtp(otp);
    if (!res.success) {
      this.errorMessage.set(res.message);
    }
  }

  handleSaveNewPassword() {
    this.errorMessage.set('');
    const newPass = this.newPasswordControl.value || '';
    const confirm = this.confirmPasswordControl.value || '';

    if (newPass !== confirm) {
      this.errorMessage.set('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const res = this.auth.applyNewPassword(newPass);
    if (!res.success) {
      this.errorMessage.set(res.message);
    }
  }

  finishAndLogin() {
    this.auth.closeForgotPassword();
    this.auth.setAuthTab('login');
  }
}
