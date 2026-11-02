import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';

@Component({
  selector: 'app-social-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (auth.isSocialModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <div class="flex items-center gap-3">
              @if (auth.socialProvider() === 'google') {
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow-md">
                  <svg class="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Masuk dengan Google</h3>
                  <p class="text-xs text-slate-400">Pilih akun untuk melanjutkan ke Nexus AI Solution</p>
                </div>
              } @else {
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md">
                  <svg class="h-6 w-6 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-bold text-white">Masuk dengan Facebook</h3>
                  <p class="text-xs text-slate-400">Hubungkan profil Meta Anda secara aman</p>
                </div>
              }
            </div>

            <button
              type="button"
              (click)="auth.closeSocialModal()"
              class="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Dialog"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <!-- Account selector -->
          <div class="mt-4 space-y-2.5">
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Pilih Akun Terhubung:</p>

            <button
              type="button"
              (click)="selectAccount('olimpiadesiswanasionalofficial@gmail.com', 'Olimpiade Siswa Nasional', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-emerald-500/50 hover:bg-slate-800/80 transition text-left group"
            >
              <div class="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="User"
                  referrerpolicy="no-referrer"
                  class="h-9 w-9 rounded-full border border-emerald-500 object-cover"
                />
                <div>
                  <div class="text-sm font-semibold text-white group-hover:text-emerald-400">Olimpiade Siswa Nasional</div>
                  <div class="text-xs text-slate-400 font-mono">olimpiadesiswanasionalofficial&#64;gmail.com</div>
                </div>
              </div>
              <mat-icon class="text-slate-500 group-hover:text-emerald-400 text-sm">arrow_forward</mat-icon>
            </button>

            <button
              type="button"
              (click)="selectAccount('admin.nexus@nexusaisolution.com', 'Administrator Nexus AI', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80')"
              class="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-cyan-500/50 hover:bg-slate-800/80 transition text-left group"
            >
              <div class="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Admin"
                  referrerpolicy="no-referrer"
                  class="h-9 w-9 rounded-full border border-cyan-500 object-cover"
                />
                <div>
                  <div class="text-sm font-semibold text-white group-hover:text-cyan-400">Administrator Nexus AI Solution</div>
                  <div class="text-xs text-slate-400 font-mono">admin.nexus&#64;nexusaisolution.com</div>
                </div>
              </div>
              <mat-icon class="text-slate-500 group-hover:text-cyan-400 text-sm">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- Security note -->
          <div class="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start gap-2">
            <mat-icon class="text-emerald-400 text-sm shrink-0 mt-0.5">verified_user</mat-icon>
            <span>Autentikasi ini dilindungi enkripsi TLS 1.3 & token OAuth 2.0 PKCE yang terhubung langsung ke dashboard Nexus.</span>
          </div>

          <div class="mt-5 flex justify-end">
            <button
              type="button"
              (click)="auth.closeSocialModal()"
              class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              Batal
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class SocialModal {
  readonly auth = inject(AuthState);

  selectAccount(email: string, name: string, avatar: string) {
    this.auth.confirmSocialLogin({ email, name, avatar });
  }
}
