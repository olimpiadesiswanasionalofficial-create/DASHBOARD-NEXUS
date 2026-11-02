import { Injectable, signal } from '@angular/core';

export interface NexusBridgeConfig {
  baseUrl: string;
  connected: boolean;
  lastSyncTime: string;
  targetRole: 'member' | 'admin';
  ssoTicket: string;
}

@Injectable({
  providedIn: 'root',
})
export class NexusBridge {
  readonly baseUrl = 'https://nexus-lac-kappa.vercel.app/';

  readonly bridgeConfig = signal<NexusBridgeConfig>({
    baseUrl: this.baseUrl,
    connected: true,
    lastSyncTime: 'Sinkronisasi Otomatis',
    targetRole: 'member',
    ssoTicket: this.generateSsoToken('member', 'user@levelingdigital.com'),
  });

  readonly isPreviewModalOpen = signal<boolean>(false);

  generateSsoToken(role: 'member' | 'admin', userEmail: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'leveling-digital-auth',
        sub: userEmail,
        role: role,
        aud: 'https://nexus-lac-kappa.vercel.app/',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        auth_level: '2FA_VERIFIED_E2EE',
      })
    );
    const signature = btoa('sig_' + Math.random().toString(36).substring(2, 10));
    return `${header}.${payload}.${signature}`;
  }

  setTargetRole(role: 'member' | 'admin', email: string) {
    this.bridgeConfig.update((cfg) => ({
      ...cfg,
      targetRole: role,
      ssoTicket: this.generateSsoToken(role, email),
      lastSyncTime: new Date().toLocaleTimeString('id-ID'),
    }));
  }

  getSsoLaunchUrl(): string {
    const cfg = this.bridgeConfig();
    const cleanUrl = cfg.baseUrl.endsWith('/') ? cfg.baseUrl : cfg.baseUrl + '/';
    return `${cleanUrl}?sso_token=${encodeURIComponent(cfg.ssoTicket)}&role=${cfg.targetRole}&ref=leveling_digital`;
  }

  openNexusPortal() {
    if (typeof window !== 'undefined') {
      window.open(this.getSsoLaunchUrl(), '_blank', 'noopener,noreferrer');
    }
  }

  openPreview() {
    this.isPreviewModalOpen.set(true);
  }

  closePreview() {
    this.isPreviewModalOpen.set(false);
  }
}
