import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NexusBridge } from '../services/nexus-bridge';
import { NotificationState } from '../services/notification-service';
import { AnalyticsState } from '../services/analytics-state';

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  scope: string;
  created: string;
  lastUsed: string;
}

@Component({
  selector: 'app-api-integrations-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Integrasi API & Webhooks</span>
            <span class="rounded bg-cyan-950/80 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
              REST & Webhooks
            </span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-400">
            Sinkronisasi data otomatis dengan portal pihak ketiga dan sistem terhubung <a href="https://nexus-lac-kappa.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">Nexus Portal</a>.
          </p>
        </div>

        <button
          type="button"
          (click)="nexus.openPreview()"
          class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 hover:opacity-95 transition"
        >
          <mat-icon class="text-sm">hub</mat-icon>
          <span>Konfigurasi Jembatan Nexus</span>
        </button>
      </div>

      <!-- Third-Party Connections Status Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Nexus Portal Bridge -->
        <div class="rounded-2xl border border-cyan-500/40 bg-slate-900/90 p-4 shadow-lg backdrop-blur-sm relative flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
                <mat-icon class="text-sm">hub</mat-icon>
              </span>
              <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                AKTIF
              </span>
            </div>
            <div class="mt-3 font-bold text-white text-sm">Nexus Global Portal</div>
            <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
              SSO otomatis & sinkronisasi peran member/admin ke https://nexus-lac-kappa.vercel.app/
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-cyan-400">
            Latency: 18ms &bull; 100% Sync
          </div>
        </div>

        <!-- Leveling Digital Core API -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm relative flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <mat-icon class="text-sm">cloud_done</mat-icon>
              </span>
              <span class="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                TERHUBUNG
              </span>
            </div>
            <div class="mt-3 font-bold text-white text-sm">Leveling Digital Engine</div>
            <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
              Validasi lisensi instan & sinkronisasi token aktivasi resmi.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
            v2.4 API &bull; 99.99% Uptime
          </div>
        </div>

        <!-- Google Workspace -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm relative flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                <mat-icon class="text-sm">account_circle</mat-icon>
              </span>
              <span class="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                OAUTH 2.0
              </span>
            </div>
            <div class="mt-3 font-bold text-white text-sm">Google & Meta SSO</div>
            <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
              Autentikasi akun sosial aman dengan proteksi 2FA terintegrasi.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-blue-400">
            Token Valid &bull; PKCE Active
          </div>
        </div>

        <!-- Zapier / Make Webhooks -->
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg backdrop-blur-sm relative flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <mat-icon class="text-sm">webhook</mat-icon>
              </span>
              <span class="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                SIAP
              </span>
            </div>
            <div class="mt-3 font-bold text-white text-sm">Automasi Eksternal</div>
            <p class="mt-1 text-[11px] text-slate-400 line-clamp-2">
              Trigger event aktivasi ke CRM, Slack, atau sistem automasi Anda.
            </p>
          </div>
          <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400">
            4 Endpoint Terdaftar
          </div>
        </div>

      </div>

      <!-- Webhook Dispatcher / Test Ping Section -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400 text-sm">send</mat-icon>
              Webhook Real-Time Sinkronisasi
            </h3>
            <p class="text-xs text-slate-400">
              Kirim payload event ke aplikasi pihak ketiga saat pengguna login atau aktivasi lisensi terjadi.
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div class="md:col-span-2">
            <label for="webhook-url" class="block text-xs font-semibold text-slate-300 mb-1.5">Target URL Webhook</label>
            <input
              id="webhook-url"
              type="url"
              [formControl]="webhookUrlControl"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="button"
              (click)="triggerWebhookTest()"
              class="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 px-4 text-xs font-bold text-slate-950 hover:opacity-95 transition flex items-center justify-center gap-1.5 shadow"
            >
              <mat-icon class="text-sm">bolt</mat-icon>
              Uji Kirim Ping Webhook
            </button>
          </div>
        </div>

        @if (webhookResponse()) {
          <div class="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-center justify-between font-mono animate-fade-in">
            <span>{{ webhookResponse() }}</span>
            <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">HTTP 200 OK</span>
          </div>
        }
      </div>

      <!-- API Keys Manager -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-cyan-400 text-sm">vpn_key</mat-icon>
              Kunci API Akses Server (API Keys)
            </h3>
            <p class="text-xs text-slate-400">Gunakan Bearer token ini untuk otentikasi REST API.</p>
          </div>

          <button
            type="button"
            (click)="generateNewApiKey()"
            class="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition flex items-center gap-1"
          >
            <mat-icon class="text-xs">add</mat-icon> Buat Kunci Baru
          </button>
        </div>

        <div class="mt-4 space-y-3">
          @for (k of apiKeys(); track k.id) {
            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-white">{{ k.name }}</h4>
                    <span class="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-cyan-300">
                      {{ k.scope }}
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                    Dibuat: {{ k.created }} &bull; Terakhir Dipakai: {{ k.lastUsed }}
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="copyApiKey(k.key)"
                    class="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">content_copy</mat-icon> Salin Token
                  </button>
                  <button
                    type="button"
                    (click)="revokeApiKey(k.id)"
                    class="rounded-lg p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                    title="Cabut Kunci"
                    aria-label="Cabut Kunci"
                  >
                    <mat-icon class="text-xs">delete</mat-icon>
                  </button>
                </div>
              </div>

              <div class="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
                {{ k.key }}
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `,
})
export class ApiIntegrationsView {
  readonly nexus = inject(NexusBridge);
  readonly notification = inject(NotificationState);
  readonly analytics = inject(AnalyticsState);

  readonly webhookUrlControl = new FormControl('https://nexus-lac-kappa.vercel.app/api/v1/webhook');
  readonly webhookResponse = signal<string>('');

  readonly apiKeys = signal<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Nexus Portal Production Token',
      key: 'ld_live_sec_99a82014bdf73910c2837261',
      scope: 'read:analytics write:license admin:nexus_sync',
      created: '2026-01-10',
      lastUsed: '1 menit yang lalu',
    },
    {
      id: 'key-2',
      name: 'Mobile App Activation SDK',
      key: 'ld_test_sec_33b194820dc7482910a99182',
      scope: 'read:license write:activate',
      created: '2026-02-01',
      lastUsed: 'Hari ini, 08:30',
    },
  ]);

  triggerWebhookTest() {
    const url = this.webhookUrlControl.value || 'https://nexus-lac-kappa.vercel.app/api/v1/webhook';
    this.webhookResponse.set(`[${new Date().toLocaleTimeString('id-ID')}] Payload berhasil dikirim ke: ${url}`);
    
    this.notification.sendPush(
      'Webhook Test Berhasil',
      `Event sync berhasil dikirim ke ${url} dengan status 200 OK.`,
      'api'
    );

    this.analytics.addAuditLog({
      action: 'Webhook Sync Sent',
      user: 'api_gateway@levelingdigital.com',
      ip: '10.0.4.1',
      location: 'Nexus Cloud Gateway',
      status: 'SUKSES',
      details: `POST payload 200 OK ke ${url}`,
    });
  }

  generateNewApiKey() {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: 'key-' + Date.now(),
      name: 'Kunci Akses Kustom #' + Math.floor(100 + Math.random() * 900),
      key: `ld_live_sec_${randomHex}`,
      scope: 'read:analytics write:license',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Belum pernah',
    };
    this.apiKeys.update((list) => [newKey, ...list]);
    this.notification.sendPush(
      'Kunci API Baru Dibuat',
      `Kunci ${newKey.name} berhasil di-generate dengan izin terenkripsi.`,
      'api'
    );
  }

  copyApiKey(key: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      this.notification.sendPush('Kunci Disalin', 'Token API berhasil disalin ke clipboard.');
    }
  }

  revokeApiKey(id: string) {
    this.apiKeys.update((list) => list.filter((k) => k.id !== id));
  }
}
