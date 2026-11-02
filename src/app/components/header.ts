import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthState } from '../services/auth-state';
import { NotificationState } from '../services/notification-service';
import { NexusBridge } from '../services/nexus-bridge';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        <!-- Logo & Brand -->
        <div class="flex items-center gap-3">
          <div class="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 shadow-md shadow-emerald-500/20">
            <mat-icon class="text-slate-950 font-bold">lock</mat-icon>
            <span class="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-extrabold tracking-tight text-white sm:text-lg">
                NEXUS <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">AI SOLUTION</span>
              </span>
              <span class="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                E2EE SAFE
              </span>
            </div>
            <p class="hidden text-xs text-slate-400 sm:block">
              Integrated with <a href="https://nexus-lac-kappa.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">Nexus Portal</a>
            </p>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2 sm:gap-3">

          <!-- Role Indicator / Switcher -->
          @if (auth.currentUser(); as user) {
            <div class="hidden md:flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                type="button"
                (click)="auth.switchRole('member')"
                [class]="user.role === 'member' ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1"
                aria-label="Alihkan ke Mode Member"
              >
                <mat-icon class="text-sm">person</mat-icon> Member
              </button>
              <button
                type="button"
                (click)="auth.switchRole('admin')"
                [class]="user.role === 'admin' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'"
                class="px-2.5 py-1 text-xs rounded-lg transition-all flex items-center gap-1"
                aria-label="Alihkan ke Mode Admin"
              >
                <mat-icon class="text-sm">admin_panel_settings</mat-icon> Admin
              </button>
            </div>
          }

          <!-- Nexus Portal Fast Connect CTA -->
          <button
            type="button"
            (click)="nexus.openPreview()"
            class="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all shadow-sm"
            aria-label="Buka Dialog Jembatan Nexus Portal"
          >
            <mat-icon class="text-cyan-400 text-sm">hub</mat-icon>
            <span class="hidden sm:inline">Nexus Portal</span>
          </button>

          <!-- Notification Bell -->
          <div class="relative">
            <button
              type="button"
              (click)="isNotificationsOpen.set(!isNotificationsOpen())"
              class="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-700 transition"
              aria-label="Lihat Notifikasi"
            >
              <mat-icon class="text-sm">notifications</mat-icon>
              @if (unreadCount() > 0) {
                <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
                  {{ unreadCount() }}
                </span>
              }
            </button>

            <!-- Notification Dropdown Panel -->
            @if (isNotificationsOpen()) {
              <div class="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl z-50">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-emerald-400 text-sm">notifications_active</mat-icon>
                    <span class="text-sm font-bold text-white">Notifikasi Status</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="notification.requestPermission()"
                      class="text-[11px] font-medium text-cyan-400 hover:underline"
                    >
                      Aktifkan Push
                    </button>
                    <button
                      type="button"
                      (click)="notification.markAllAsRead()"
                      class="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Tandai dibaca
                    </button>
                  </div>
                </div>

                <div class="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-1">
                  @for (n of notification.notifications(); track n.id) {
                    <div [class]="n.read ? 'bg-slate-950/40 opacity-70' : 'bg-slate-800/60 border border-slate-700/50'" class="rounded-xl p-3 text-xs transition">
                      <div class="flex items-start justify-between gap-2">
                        <span class="font-semibold text-slate-200">{{ n.title }}</span>
                        <span class="text-[10px] text-slate-500 shrink-0">{{ n.timestamp }}</span>
                      </div>
                      <p class="mt-1 text-slate-400 leading-relaxed">{{ n.body }}</p>
                    </div>
                  } @empty {
                    <p class="text-center py-6 text-xs text-slate-500">Belum ada notifikasi baru.</p>
                  }
                </div>

                <div class="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
                  <button
                    type="button"
                    (click)="triggerSimulatedPush()"
                    class="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">bolt</mat-icon> Tes Simulasi Push
                  </button>
                  <button
                    type="button"
                    (click)="isNotificationsOpen.set(false)"
                    class="text-[11px] text-slate-400 hover:text-white"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- User Menu / Auth Button -->
          @if (auth.currentUser(); as user) {
            <div class="flex items-center gap-2 pl-1 border-l border-slate-800">
              <img
                [src]="user.avatar"
                alt="Avatar"
                referrerpolicy="no-referrer"
                class="h-8 w-8 rounded-full border border-emerald-500/50 object-cover"
              />
              <div class="hidden lg:block text-left">
                <p class="text-xs font-semibold text-white leading-tight">{{ user.name }}</p>
                <p class="text-[10px] text-emerald-400">{{ user.role.toUpperCase() }} • {{ user.tier }}</p>
              </div>
              <button
                type="button"
                (click)="auth.logout()"
                class="rounded-xl p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 transition"
                title="Keluar / Logout"
                aria-label="Keluar dari akun"
              >
                <mat-icon class="text-sm">logout</mat-icon>
              </button>
            </div>
          } @else {
            <button
              type="button"
              (click)="auth.setAuthTab('login')"
              class="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:opacity-95 transition"
            >
              Masuk / Aktivasi
            </button>
          }

        </div>
      </div>
    </header>
  `,
})
export class Header {
  readonly auth = inject(AuthState);
  readonly notification = inject(NotificationState);
  readonly nexus = inject(NexusBridge);

  readonly isNotificationsOpen = signal<boolean>(false);

  unreadCount() {
    return this.notification.notifications().filter((n) => !n.read).length;
  }

  triggerSimulatedPush() {
    const samples = [
      {
        title: 'Percobaan Akses Baru',
        body: 'Terdeteksi login baru dari Jakarta (Chrome / Android). 2FA terverifikasi aman.',
        type: 'security' as const,
      },
      {
        title: 'Webhook Nexus Terkirim',
        body: 'Payload data telemetri berhasil dikirim ke https://nexus-lac-kappa.vercel.app/',
        type: 'nexus' as const,
      },
      {
        title: 'Brankas Data Terproteksi',
        body: 'Enkripsi AES-256-GCM berhasil memperbarui digest verifikasi keamanan.',
        type: 'security' as const,
      },
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    this.notification.sendPush(picked.title, picked.body, picked.type);
  }
}
