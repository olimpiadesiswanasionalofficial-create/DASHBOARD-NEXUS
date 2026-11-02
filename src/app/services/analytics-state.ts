import { Injectable, signal, computed } from '@angular/core';
import { convertToCsv } from '../core/auth-validator';

export interface AuditLogItem {
  id: string;
  action: string;
  user: string;
  ip: string;
  location: string;
  status: 'SUKSES' | '2FA_DIPERLUKAN' | 'DITOLAK' | 'TERENKRIPSI';
  timestamp: string;
  details: string;
}

export interface ChartPoint {
  label: string;
  activations: number;
  logins: number;
  securityChecks: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsState {
  readonly timeframe = signal<'24h' | '7d' | '30d'>('24h');
  readonly selectedMetric = signal<'activations' | 'logins' | 'securityChecks'>('activations');

  // Stats
  readonly totalActivations = signal<number>(1428);
  readonly activeMembers = signal<number>(932);
  readonly securityScore = signal<number>(99.8);
  readonly apiRequests = signal<number>(54120);

  // Timeframe chart datasets
  private readonly data24h: ChartPoint[] = [
    { label: '00:00', activations: 24, logins: 65, securityChecks: 120 },
    { label: '03:00', activations: 12, logins: 30, securityChecks: 55 },
    { label: '06:00', activations: 38, logins: 110, securityChecks: 195 },
    { label: '09:00', activations: 85, logins: 280, securityChecks: 450 },
    { label: '12:00', activations: 112, logins: 340, securityChecks: 560 },
    { label: '15:00', activations: 98, logins: 310, securityChecks: 510 },
    { label: '18:00', activations: 74, logins: 245, securityChecks: 420 },
    { label: '21:00', activations: 55, logins: 180, securityChecks: 310 },
  ];

  private readonly data7d: ChartPoint[] = [
    { label: 'Senin', activations: 210, logins: 820, securityChecks: 1400 },
    { label: 'Selasa', activations: 245, logins: 910, securityChecks: 1560 },
    { label: 'Rabu', activations: 290, logins: 1050, securityChecks: 1820 },
    { label: 'Kamis', activations: 275, logins: 980, securityChecks: 1690 },
    { label: 'Jumat', activations: 320, logins: 1180, securityChecks: 2010 },
    { label: 'Sabtu', activations: 180, logins: 670, securityChecks: 1100 },
    { label: 'Minggu', activations: 155, logins: 590, securityChecks: 950 },
  ];

  private readonly data30d: ChartPoint[] = [
    { label: 'Mgg 1', activations: 1120, logins: 4500, securityChecks: 7800 },
    { label: 'Mgg 2', activations: 1340, logins: 5120, securityChecks: 8900 },
    { label: 'Mgg 3', activations: 1480, logins: 5800, securityChecks: 9940 },
    { label: 'Mgg 4', activations: 1620, logins: 6400, securityChecks: 11200 },
  ];

  readonly currentChartData = computed(() => {
    const tf = this.timeframe();
    if (tf === '7d') return this.data7d;
    if (tf === '30d') return this.data30d;
    return this.data24h;
  });

  // Audit Logs
  readonly auditLogs = signal<AuditLogItem[]>([
    {
      id: 'log-1',
      action: 'Aktivasi Lisensi Pro',
      user: 'budi.santoso@gmail.com',
      ip: '182.253.14.92',
      location: 'Jakarta, ID',
      status: 'SUKSES',
      timestamp: '1 menit yang lalu',
      details: 'Kode lisensi LD-PREMIUM-2026 teraktivasi.',
    },
    {
      id: 'log-2',
      action: 'Verifikasi Autentikasi 2FA',
      user: 'admin@nexus-digital.com',
      ip: '114.124.201.5',
      location: 'Surabaya, ID',
      status: 'SUKSES',
      timestamp: '5 menit yang lalu',
      details: 'TOTP 6-digit sukses diverifikasi melalui Authenticator.',
    },
    {
      id: 'log-3',
      action: 'Enkripsi Data Vault E2EE',
      user: 'citra.permata@tech.id',
      ip: '103.78.112.44',
      location: 'Bandung, ID',
      status: 'TERENKRIPSI',
      timestamp: '12 menit yang lalu',
      details: 'AES-256-GCM Payload berhasil dienkripsi lokal.',
    },
    {
      id: 'log-4',
      action: 'SSO Handshake ke Nexus Portal',
      user: 'member.nexus@gmail.com',
      ip: '202.67.41.18',
      location: 'Medan, ID',
      status: 'SUKSES',
      timestamp: '25 menit yang lalu',
      details: 'Tiket JWT diteruskan ke https://nexus-lac-kappa.vercel.app/',
    },
    {
      id: 'log-5',
      action: 'Percobaan Login Tanpa Sandi Benar',
      user: 'unknown@external.net',
      ip: '45.133.1.20',
      location: 'Frankfurt, DE',
      status: 'DITOLAK',
      timestamp: '42 menit yang lalu',
      details: 'Rate-limiting dipicu; akses IP diblokir otomatis.',
    },
    {
      id: 'log-6',
      action: 'Pemulihan Kata Sandi Email',
      user: 'dewi.safitri@yahoo.com',
      ip: '36.88.90.12',
      location: 'Yogyakarta, ID',
      status: 'SUKSES',
      timestamp: '1 jam yang lalu',
      details: 'Kode OTP pemulihan sandi dikirim & diperbarui.',
    },
  ]);

  readonly searchQuery = signal<string>('');

  readonly filteredLogs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.auditLogs();
    return this.auditLogs().filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.location.toLowerCase().includes(q) ||
        log.status.toLowerCase().includes(q)
    );
  });

  setTimeframe(tf: '24h' | '7d' | '30d') {
    this.timeframe.set(tf);
  }

  setMetric(metric: 'activations' | 'logins' | 'securityChecks') {
    this.selectedMetric.set(metric);
  }

  addAuditLog(entry: Omit<AuditLogItem, 'id' | 'timestamp'>) {
    const newItem: AuditLogItem = {
      ...entry,
      id: 'log-' + Date.now(),
      timestamp: 'Baru saja',
    };
    this.auditLogs.update((list) => [newItem, ...list]);
    this.totalActivations.update((n) => n + 1);
  }

  exportCsv() {
    const headers = ['ID Log', 'Aksi / Event', 'Pengguna', 'Alamat IP', 'Lokasi', 'Status', 'Waktu', 'Keterangan'];
    const rows = this.auditLogs().map((item) => [
      item.id,
      item.action,
      item.user,
      item.ip,
      item.location,
      item.status,
      item.timestamp,
      item.details,
    ]);

    const csvContent = convertToCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Leveling-Digital-Analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
