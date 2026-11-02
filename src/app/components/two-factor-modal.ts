import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';

@Component({
  selector: 'app-two-factor-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    @if (auth.isTwoFactorSetupOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
          
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <mat-icon class="text-sm">security</mat-icon>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Konfigurasi Autentikasi 2FA</h3>
                <p class="text-xs text-slate-400">Time-based One-Time Password (TOTP) / Google Authenticator</p>
              </div>
            </div>
            <button
              type="button"
              (click)="auth.isTwoFactorSetupOpen.set(false)"
              class="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Dialog 2FA"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <!-- Status Pill -->
            <div class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
              <div class="flex items-center gap-2.5">
                <mat-icon [class]="auth.currentUser()?.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-500'">
                  {{ auth.currentUser()?.twoFactorEnabled ? 'verified' : 'gpp_bad' }}
                </mat-icon>
                <div>
                  <div class="text-xs font-semibold text-white">
                    Status 2FA: {{ auth.currentUser()?.twoFactorEnabled ? 'AKTIF (Terproteksi)' : 'TIDAK AKTIF' }}
                  </div>
                  <div class="text-[11px] text-slate-400">
                    Setiap login memerlukan kode verifikasi 6-digit.
                  </div>
                </div>
              </div>
              <button
                type="button"
                (click)="toggleActive()"
                [class]="auth.currentUser()?.twoFactorEnabled ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500 text-slate-950 font-bold'"
                class="rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
              >
                {{ auth.currentUser()?.twoFactorEnabled ? 'Nonaktifkan' : 'Aktifkan 2FA' }}
              </button>
            </div>

            <!-- QR Code Simulator & Secret -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <!-- Visual QR code simulator -->
              <div class="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-900 shadow-inner">
                <div class="p-2 border-2 border-slate-900 rounded-lg">
                  <!-- SVG QR pattern -->
                  <svg class="h-32 w-32" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="30" height="30" />
                    <rect x="5" y="5" width="20" height="20" fill="white" />
                    <rect x="9" y="9" width="12" height="12" />
                    <rect x="70" y="0" width="30" height="30" />
                    <rect x="75" y="5" width="20" height="20" fill="white" />
                    <rect x="79" y="9" width="12" height="12" />
                    <rect x="0" y="70" width="30" height="30" />
                    <rect x="5" y="75" width="20" height="20" fill="white" />
                    <rect x="9" y="79" width="12" height="12" />
                    <rect x="40" y="10" width="10" height="10" />
                    <rect x="55" y="20" width="10" height="10" />
                    <rect x="35" y="45" width="15" height="15" />
                    <rect x="55" y="45" width="10" height="10" />
                    <rect x="40" y="75" width="15" height="15" />
                    <rect x="75" y="45" width="15" height="15" />
                    <rect x="70" y="70" width="20" height="20" />
                  </svg>
                </div>
                <span class="mt-2 text-[10px] font-mono text-slate-600">Scan via Authenticator</span>
              </div>

              <div class="space-y-3">
                <div>
                  <div class="text-[11px] font-semibold text-slate-400">Kunci Rahasia Manual (Secret):</div>
                  <div class="mt-1 flex items-center justify-between rounded-lg bg-slate-900 border border-slate-700 p-2 font-mono text-xs text-emerald-400">
                    <span>{{ auth.currentUser()?.twoFactorSecret || 'JBSWY3DPEHPK3PXP' }}</span>
                    <button
                      type="button"
                      (click)="copiedKey.set(true)"
                      class="text-slate-400 hover:text-white"
                      title="Salin Kunci"
                    >
                      <mat-icon class="text-xs">{{ copiedKey() ? 'done' : 'content_copy' }}</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                  <div class="text-[11px] text-slate-400">Kode Berjalan Saat Ini:</div>
                  <div class="mt-1 flex items-center gap-2">
                    <span class="font-mono text-base font-bold text-cyan-400 tracking-wider">
                      {{ auth.simulatedTotpCode() }}
                    </span>
                    <span class="text-[10px] text-slate-500">(Refresh otomatis)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Backup codes -->
            <div>
              <div class="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Kode Cadangan Pemulihan (Emergency Codes):</span>
                <span class="text-[10px] text-slate-500">8 kode sekali pakai</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px] text-slate-300">
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">8491-0294</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">3910-4821</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">9012-7483</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">1948-2039</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">5029-1834</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">7829-4019</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">4402-9182</div>
                <div class="rounded bg-slate-950 border border-slate-800 p-1.5 text-center">6192-3841</div>
              </div>
            </div>

          </div>

          <div class="mt-6 flex justify-end">
            <button
              type="button"
              (click)="auth.isTwoFactorSetupOpen.set(false)"
              class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Selesai
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class TwoFactorModal {
  readonly auth = inject(AuthState);
  readonly copiedKey = signal<boolean>(false);

  toggleActive() {
    const cur = this.auth.currentUser();
    if (!cur) return;
    this.auth.toggleTwoFactor(!cur.twoFactorEnabled);
  }
}
