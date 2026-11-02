import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NexusBridge } from '../services/nexus-bridge';
import { AuthState } from '../services/auth-state';

@Component({
  selector: 'app-nexus-bridge-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (nexus.isPreviewModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
        <div class="w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-2xl text-slate-100 flex flex-col max-h-[92vh]">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <mat-icon class="text-xl">hub</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white">Jembatan Integrasi Nexus Portal</h3>
                  <span class="rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                    TERHUBUNG
                  </span>
                </div>
                <p class="text-xs text-slate-400 font-mono">
                  https://nexus-lac-kappa.vercel.app/
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="nexus.closePreview()"
              class="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Jembatan Nexus"
            >
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-4 sm:p-6 overflow-y-auto space-y-4">
            
            <!-- Connection Card -->
            <div class="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peran SSO Target:</div>
                  <div class="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                    <mat-icon class="text-cyan-400 text-sm">badge</mat-icon>
                    <span>{{ nexus.bridgeConfig().targetRole === 'admin' ? 'Administrator Portal' : 'Member Portal' }}</span>
                  </div>
                </div>

                <!-- Role Selector for Nexus -->
                <div class="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1">
                  <button
                    type="button"
                    (click)="selectRole('member')"
                    [class]="nexus.bridgeConfig().targetRole === 'member' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'"
                    class="px-3 py-1 text-xs rounded-lg transition"
                  >
                    Member
                  </button>
                  <button
                    type="button"
                    (click)="selectRole('admin')"
                    [class]="nexus.bridgeConfig().targetRole === 'admin' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'"
                    class="px-3 py-1 text-xs rounded-lg transition"
                  >
                    Admin
                  </button>
                </div>
              </div>

              <!-- SSO Token Preview -->
              <div class="mt-4 pt-3 border-t border-slate-800/80">
                <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span class="font-semibold">Tiket Autentikasi SSO (Signed JWT Token):</span>
                  <button
                    type="button"
                    (click)="copySsoLink()"
                    class="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <mat-icon class="text-xs">{{ copied() ? 'done' : 'content_copy' }}</mat-icon>
                    {{ copied() ? 'Tersalin!' : 'Salin Token' }}
                  </button>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {{ nexus.bridgeConfig().ssoTicket }}
                </div>
              </div>
            </div>

            <!-- Portal Features Checklist -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div class="font-bold text-white flex items-center gap-1.5">
                  <mat-icon class="text-emerald-400 text-sm">verified</mat-icon>
                  Fitur Member Nexus
                </div>
                <ul class="text-slate-400 space-y-1 text-[11px]">
                  <li>• Sinkronisasi lisensi aktivasi Leveling Digital</li>
                  <li>• Akses instan modul member & konten eksklusif</li>
                  <li>• Keamanan sesi dua faktor terverifikasi</li>
                </ul>
              </div>

              <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2">
                <div class="font-bold text-white flex items-center gap-1.5">
                  <mat-icon class="text-cyan-400 text-sm">shield</mat-icon>
                  Fitur Admin Nexus
                </div>
                <ul class="text-slate-400 space-y-1 text-[11px]">
                  <li>• Manajemen hak akses seluruh pengguna & staf</li>
                  <li>• Kontrol API Webhook & integrasi pihak ketiga</li>
                  <li>• Audit trail keamanan real-time berenkripsi</li>
                </ul>
              </div>
            </div>

            <!-- Direct URL Action Box -->
            <div class="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 to-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-white">Buka Langsung ke Nexus Portal</div>
                <p class="text-xs text-slate-400">
                  Membuka https://nexus-lac-kappa.vercel.app/ dengan parameter token otomatis.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="nexus.openNexusPortal()"
                  class="rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
                >
                  <mat-icon class="text-sm">open_in_new</mat-icon>
                  Buka Portal Nexus
                </button>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-4 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              (click)="nexus.closePreview()"
              class="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class NexusBridgeModal {
  readonly nexus = inject(NexusBridge);
  readonly auth = inject(AuthState);
  readonly copied = signal<boolean>(false);

  selectRole(role: 'member' | 'admin') {
    const email = this.auth.currentUser()?.email || 'user@levelingdigital.com';
    this.nexus.setTargetRole(role, email);
  }

  copySsoLink() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.nexus.getSsoLaunchUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    }
  }
}
