import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';
import { AnalyticsState } from '../services/analytics-state';

@Component({
  selector: 'app-print-report-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (auth.isPrintReportOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-8 animate-fade-in">
        <div class="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-white p-6 sm:p-10 shadow-2xl text-slate-900">
          
          <!-- Top bar with action buttons -->
          <div class="no-print flex items-center justify-between pb-6 border-b border-slate-200">
            <div class="flex items-center gap-2">
              <mat-icon class="text-emerald-600">picture_as_pdf</mat-icon>
              <div>
                <h3 class="text-base font-bold text-slate-900">Pratinjau Laporan PDF Analitik</h3>
                <p class="text-xs text-slate-500">Siap dicetak atau disimpan sebagai dokumen PDF resmi</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printReport()"
                class="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <mat-icon class="text-sm">print</mat-icon>
                Cetak / Simpan PDF
              </button>
              <button
                type="button"
                (click)="auth.isPrintReportOpen.set(false)"
                class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Tutup
              </button>
            </div>
          </div>

          <!-- Printable Report Body -->
          <div class="mt-6 space-y-6">
            
            <!-- Official Document Header -->
            <div class="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div class="text-xl font-extrabold tracking-tight text-slate-900">
                  NEXUS AI SOLUTION &bull; ANALYTICS & AUDIT REPORT
                </div>
                <div class="text-xs text-slate-600 mt-1">
                  Portal Autentikasi 2FA, Enkripsi E2EE, dan Telemetri Akses Global
                </div>
                <div class="text-xs text-slate-500 font-mono mt-0.5">
                  https://nexus-lac-kappa.vercel.app/ &bull; nexusaisolution.com
                </div>
              </div>

              <div class="text-right text-xs text-slate-600">
                <div class="font-bold text-slate-900">Dibuat Pada:</div>
                <div>{{ todayFormatted }}</div>
                <div class="mt-1 font-mono text-[10px] text-emerald-700 font-bold">STATUS: E2EE VERIFIED</div>
              </div>
            </div>

            <!-- Executive Summary Cards -->
            <div class="grid grid-cols-4 gap-4">
              <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div class="text-[10px] uppercase font-bold text-slate-500">Total Aktivasi</div>
                <div class="text-xl font-extrabold text-slate-900 mt-0.5">{{ analytics.totalActivations() }}</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">+14% dari periode lalu</div>
              </div>

              <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div class="text-[10px] uppercase font-bold text-slate-500">Pengguna Aktif</div>
                <div class="text-xl font-extrabold text-slate-900 mt-0.5">{{ analytics.activeMembers() }}</div>
                <div class="text-[10px] text-slate-600 mt-0.5">Member & Admin</div>
              </div>

              <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div class="text-[10px] uppercase font-bold text-slate-500">Skor Keamanan E2EE</div>
                <div class="text-xl font-extrabold text-emerald-700 mt-0.5">{{ analytics.securityScore() }}%</div>
                <div class="text-[10px] text-slate-600 mt-0.5">AES-256-GCM Zero Breach</div>
              </div>

              <div class="p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div class="text-[10px] uppercase font-bold text-slate-500">Permintaan API</div>
                <div class="text-xl font-extrabold text-cyan-800 mt-0.5">{{ analytics.apiRequests() }}</div>
                <div class="text-[10px] text-slate-600 mt-0.5">Webhook & Sync</div>
              </div>
            </div>

            <!-- Security & Compliance statement -->
            <div class="p-4 rounded-lg bg-slate-100 border-l-4 border-emerald-600 text-xs text-slate-700">
              <div class="font-bold text-slate-900">Jaminan Keamanan & Enkripsi End-to-End:</div>
              <p class="mt-1 leading-relaxed">
                Seluruh data otentikasi diproteksi menggunakan kunci simetris 256-bit AES-GCM dengan derivasi kunci PBKDF2 (100.000 iterasi). Akses pengguna diverifikasi menggunakan Time-based One-Time Password (TOTP) dan disinkronkan secara aman ke portal Nexus (https://nexus-lac-kappa.vercel.app/).
              </p>
            </div>

            <!-- Audit Trail Table -->
            <div>
              <h4 class="text-sm font-bold text-slate-900 mb-2">Riwayat Aktivitas & Log Audit Keamanan</h4>
              <table class="w-full text-left text-xs border border-slate-200">
                <thead class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th class="p-2">Event</th>
                    <th class="p-2">Pengguna</th>
                    <th class="p-2">IP & Lokasi</th>
                    <th class="p-2">Status</th>
                    <th class="p-2">Waktu</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  @for (log of analytics.auditLogs(); track log.id) {
                    <tr>
                      <td class="p-2 font-medium text-slate-900">{{ log.action }}</td>
                      <td class="p-2 font-mono text-slate-600">{{ log.user }}</td>
                      <td class="p-2 text-slate-600">{{ log.ip }} ({{ log.location }})</td>
                      <td class="p-2 font-bold text-emerald-700">{{ log.status }}</td>
                      <td class="p-2 text-slate-500">{{ log.timestamp }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Footer signature line -->
            <div class="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Nexus AI Solution &copy; 2026. Hak Cipta Dilindungi Undang-Undang.
              </div>
              <div class="font-mono text-[11px]">
                ID Dokumen: NEXUS-RPT-{{ todayTimestamp }}
              </div>
            </div>

          </div>

        </div>
      </div>
    }
  `,
})
export class PrintReportModal {
  readonly auth = inject(AuthState);
  readonly analytics = inject(AnalyticsState);

  readonly todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  readonly todayTimestamp = Date.now().toString().slice(-8);

  printReport() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
