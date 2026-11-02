import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsState, ChartPoint } from '../services/analytics-state';
import { AuthState } from '../services/auth-state';

@Component({
  selector: 'app-analytics-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Top Action Bar & Summary -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Dasbor Analitik Real-Time</span>
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-400">
            Pemantauan langsung telemetri aktivasi, verifikasi 2FA, dan integrasi Nexus Portal.
          </p>
        </div>

        <!-- Export Buttons (PDF & CSV) -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="analytics.exportCsv()"
            class="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition shadow-sm"
            aria-label="Ekspor Laporan ke Format CSV"
          >
            <mat-icon class="text-emerald-400 text-sm">table_view</mat-icon>
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            (click)="auth.isPrintReportOpen.set(true)"
            class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:opacity-95 transition shadow-md shadow-emerald-500/20"
            aria-label="Ekspor Laporan ke Format PDF"
          >
            <mat-icon class="text-slate-950 text-sm">picture_as_pdf</mat-icon>
            <span>Ekspor PDF</span>
          </button>
        </div>
      </div>

      <!-- KPI Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Total Aktivasi -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Aktivasi</span>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <mat-icon class="text-sm">verified</mat-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-white">{{ analytics.totalActivations() }}</span>
            <span class="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              +12.4%
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">Lisensi Leveling Digital aktif</p>
        </div>

        <!-- Pengguna Aktif -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Pengguna Aktif</span>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <mat-icon class="text-sm">people</mat-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-white">{{ analytics.activeMembers() }}</span>
            <span class="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
              Online
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">Member & Admin terhubung</p>
        </div>

        <!-- Skor Keamanan E2EE -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Skor Keamanan E2EE</span>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <mat-icon class="text-sm">lock</mat-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-white">{{ analytics.securityScore() }}%</span>
            <span class="text-xs font-bold text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
              Grade A+
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">AES-256-GCM Zero Breach</p>
        </div>

        <!-- Permintaan API -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg backdrop-blur-sm relative overflow-hidden group">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Permintaan API</span>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <mat-icon class="text-sm">api</mat-icon>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-2xl sm:text-3xl font-extrabold text-white">54.1k</span>
            <span class="text-xs font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
              99.98% Uptime
            </span>
          </div>
          <p class="mt-1 text-[11px] text-slate-400">Sinkronisasi Nexus Webhooks</p>
        </div>

      </div>

      <!-- Interactive Chart Section -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        
        <!-- Controls: Timeframe & Metric -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400 text-sm">show_chart</mat-icon>
              Tren Aktivitas & Autentikasi
            </h3>
            <p class="text-xs text-slate-400">Interaktif: arahkan kursor ke titik grafik untuk detail</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Metric selector pills -->
            <div class="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
              <button
                type="button"
                (click)="analytics.setMetric('activations')"
                [class]="analytics.selectedMetric() === 'activations' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                Aktivasi
              </button>
              <button
                type="button"
                (click)="analytics.setMetric('logins')"
                [class]="analytics.selectedMetric() === 'logins' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                Login
              </button>
              <button
                type="button"
                (click)="analytics.setMetric('securityChecks')"
                [class]="analytics.selectedMetric() === 'securityChecks' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                2FA & E2EE
              </button>
            </div>

            <!-- Timeframe selector -->
            <div class="flex items-center rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
              <button
                type="button"
                (click)="analytics.setTimeframe('24h')"
                [class]="analytics.timeframe() === '24h' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                24 Jam
              </button>
              <button
                type="button"
                (click)="analytics.setTimeframe('7d')"
                [class]="analytics.timeframe() === '7d' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                7 Hari
              </button>
              <button
                type="button"
                (click)="analytics.setTimeframe('30d')"
                [class]="analytics.timeframe() === '30d' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 rounded-lg transition"
              >
                30 Hari
              </button>
            </div>
          </div>
        </div>

        <!-- SVG Interactive Chart Canvas -->
        <div class="mt-6 relative">
          
          <!-- Tooltip preview when hovering a point -->
          @if (hoveredPoint()) {
            <div class="absolute top-2 right-4 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-1.5 text-xs text-white shadow-xl z-10 flex items-center gap-3">
              <span class="text-slate-400">{{ hoveredPoint()?.label }}:</span>
              <span class="font-bold font-mono text-emerald-400">
                {{ getMetricValue(hoveredPoint()!) }} {{ getMetricLabel() }}
              </span>
            </div>
          }

          <!-- Responsive SVG Vector Graphic -->
          <div class="w-full h-64 sm:h-72">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
              <defs>
                <!-- Gradients for area fill -->
                <linearGradient id="areaGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradientCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.0" />
                </linearGradient>
                <linearGradient id="areaGradientPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#A855F7" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#A855F7" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <!-- Horizontal Grid Lines -->
              <line x1="0" y1="40" x2="800" y2="40" stroke="#334155" stroke-dasharray="4" stroke-opacity="0.4" />
              <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" stroke-dasharray="4" stroke-opacity="0.4" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="#334155" stroke-dasharray="4" stroke-opacity="0.4" />
              <line x1="0" y1="210" x2="800" y2="210" stroke="#334155" stroke-opacity="0.7" />

              <!-- Smooth Area Shape -->
              <path [attr.d]="svgAreaPath()" [attr.fill]="getGradientUrl()" />

              <!-- Smooth Line Stroke -->
              <path
                [attr.d]="svgLinePath()"
                fill="none"
                [attr.stroke]="getStrokeColor()"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <!-- Interactive Points -->
              @for (pt of chartCalculatedPoints(); track pt.label; let idx = $index) {
                <g
                  (mouseenter)="hoveredPoint.set(pt.original)"
                  (mouseleave)="hoveredPoint.set(null)"
                  class="cursor-pointer group"
                >
                  <circle
                    [attr.cx]="pt.x"
                    [attr.cy]="pt.y"
                    r="5"
                    [attr.fill]="getStrokeColor()"
                    stroke="#020617"
                    stroke-width="2"
                    class="transition-transform group-hover:scale-150"
                  />
                  <!-- X-Axis Labels -->
                  <text
                    [attr.x]="pt.x"
                    y="232"
                    text-anchor="middle"
                    fill="#94A3B8"
                    font-size="11"
                    font-family="monospace"
                  >
                    {{ pt.label }}
                  </text>
                </g>
              }
            </svg>
          </div>

        </div>

      </div>

      <!-- Secondary Metrics: Devices & Geo Hotspots -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <!-- Device Breakdown -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-xs text-cyan-400">devices</mat-icon>
              Distribusi Perangkat
            </span>
            <span class="text-[10px] text-slate-500">Bulan Ini</span>
          </div>

          <div class="mt-4 space-y-3.5">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium">Desktop (macOS & Windows)</span>
                <span class="font-bold text-white">64%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style="width: 64%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium">Smartphone (Android & iOS)</span>
                <span class="font-bold text-white">29%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400" style="width: 29%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-300 font-medium">Tablet & Lainnya</span>
                <span class="font-bold text-white">7%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full rounded-full bg-purple-500" style="width: 7%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Geographic Locations -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <mat-icon class="text-xs text-emerald-400">public</mat-icon>
              Wilayah Akses Teratas
            </span>
            <span class="text-[10px] text-slate-500">Live Traffic</span>
          </div>

          <div class="mt-3 divide-y divide-slate-800/80 text-xs">
            <div class="py-2 flex items-center justify-between">
              <span class="text-slate-300">🇮🇩 Jakarta, Indonesia</span>
              <span class="font-mono font-bold text-emerald-400">48.2%</span>
            </div>
            <div class="py-2 flex items-center justify-between">
              <span class="text-slate-300">🇮🇩 Surabaya, Indonesia</span>
              <span class="font-mono font-bold text-emerald-400">21.5%</span>
            </div>
            <div class="py-2 flex items-center justify-between">
              <span class="text-slate-300">🇮🇩 Bandung, Indonesia</span>
              <span class="font-mono font-bold text-emerald-400">14.1%</span>
            </div>
            <div class="py-2 flex items-center justify-between">
              <span class="text-slate-300">🇸🇬 Singapore Gateway</span>
              <span class="font-mono font-bold text-cyan-400">9.8%</span>
            </div>
            <div class="py-2 flex items-center justify-between">
              <span class="text-slate-300">🌐 Wilayah Lainnya</span>
              <span class="font-mono font-bold text-slate-400">6.4%</span>
            </div>
          </div>
        </div>

        <!-- 2FA & E2EE Health Status -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <span class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <mat-icon class="text-xs text-purple-400">shield_moon</mat-icon>
                Integritas Keamanan
              </span>
              <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% SECURE
              </span>
            </div>

            <div class="mt-4 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Adopsi 2FA Member:</span>
                <span class="font-bold text-white">96.4%</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Data Vault Terenkripsi:</span>
                <span class="font-bold text-emerald-400">AES-256-GCM</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Nexus SSO Handshake:</span>
                <span class="font-bold text-cyan-400">Verified</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              (click)="auth.isTwoFactorSetupOpen.set(true)"
              class="w-full rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
            >
              <mat-icon class="text-xs">settings_suggest</mat-icon>
              Kelola Pengaturan 2FA
            </button>
          </div>
        </div>

      </div>

      <!-- Real-Time Audit Log Table -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400 text-sm">history</mat-icon>
              Riwayat Akses & Log Audit Keamanan
            </h3>
            <p class="text-xs text-slate-400">Semua aktivitas dicatat dengan tanda tangan kriptografi.</p>
          </div>

          <!-- Search input -->
          <div class="relative w-full sm:w-64">
            <mat-icon class="absolute left-3 top-2.5 text-slate-500 text-sm">search</mat-icon>
            <input
              type="text"
              [formControl]="searchControl"
              (input)="analytics.searchQuery.set(searchControl.value || '')"
              placeholder="Cari user, IP, aksi..."
              class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="py-3 px-3">Event / Aksi</th>
                <th class="py-3 px-3">Pengguna</th>
                <th class="py-3 px-3">IP & Lokasi</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Waktu</th>
                <th class="py-3 px-3">Detail</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              @for (log of analytics.filteredLogs(); track log.id) {
                <tr class="hover:bg-slate-800/40 transition">
                  <td class="py-3 px-3 font-semibold text-slate-200">{{ log.action }}</td>
                  <td class="py-3 px-3 font-mono text-slate-400">{{ log.user }}</td>
                  <td class="py-3 px-3 text-slate-400">{{ log.ip }} ({{ log.location }})</td>
                  <td class="py-3 px-3">
                    <span [class]="getStatusClass(log.status)" class="px-2 py-0.5 rounded text-[10px] font-bold">
                      {{ log.status }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-slate-500 font-mono text-[11px]">{{ log.timestamp }}</td>
                  <td class="py-3 px-3 text-slate-400 text-[11px]">{{ log.details }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-8 text-slate-500">
                    Tidak ada log audit yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `,
})
export class AnalyticsView {
  readonly analytics = inject(AnalyticsState);
  readonly auth = inject(AuthState);

  readonly searchControl = new FormControl('');
  readonly hoveredPoint = signal<ChartPoint | null>(null);

  getMetricValue(pt: ChartPoint): number {
    const metric = this.analytics.selectedMetric();
    return pt[metric];
  }

  getMetricLabel(): string {
    const m = this.analytics.selectedMetric();
    if (m === 'activations') return 'Aktivasi';
    if (m === 'logins') return 'Login';
    return 'Pengecekan';
  }

  getStrokeColor(): string {
    const m = this.analytics.selectedMetric();
    if (m === 'activations') return '#10B981'; // emerald
    if (m === 'logins') return '#06B6D4'; // cyan
    return '#A855F7'; // purple
  }

  getGradientUrl(): string {
    const m = this.analytics.selectedMetric();
    if (m === 'activations') return 'url(#areaGradientEmerald)';
    if (m === 'logins') return 'url(#areaGradientCyan)';
    return 'url(#areaGradientPurple)';
  }

  // Calculate SVG coordinates
  readonly chartCalculatedPoints = computed(() => {
    const data = this.analytics.currentChartData();
    const metric = this.analytics.selectedMetric();
    const values = data.map((d) => d[metric]);
    const max = Math.max(...values, 10);
    const min = 0;

    const width = 800;
    const height = 180;
    const paddingY = 20;

    return data.map((item, idx) => {
      const x = (idx / (data.length - 1)) * (width - 40) + 20;
      const normalized = (item[metric] - min) / (max - min);
      const y = height - normalized * (height - paddingY * 2) - paddingY;
      return {
        x,
        y,
        label: item.label,
        original: item,
      };
    });
  });

  readonly svgLinePath = computed(() => {
    const pts = this.chartCalculatedPoints();
    if (pts.length === 0) return '';
    return pts.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth curve approximation
      const prev = pts[idx - 1];
      const cx = (prev.x + curr.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');
  });

  readonly svgAreaPath = computed(() => {
    const linePath = this.svgLinePath();
    if (!linePath) return '';
    const pts = this.chartCalculatedPoints();
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${linePath} L ${last.x} 210 L ${first.x} 210 Z`;
  });

  getStatusClass(status: string): string {
    if (status === 'SUKSES') return 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30';
    if (status === 'TERENKRIPSI') return 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30';
    if (status === '2FA_DIPERLUKAN') return 'bg-amber-950/80 text-amber-400 border border-amber-500/30';
    return 'bg-red-950/80 text-red-400 border border-red-500/30';
  }
}
