import { Injectable, signal } from '@angular/core';
import { encryptText, decryptText, EncryptedPayload, calculateFingerprint } from '../core/crypto-e2e';

export interface VaultRecord {
  id: string;
  title: string;
  category: 'API_KEY' | 'SECRET_TOKEN' | 'NOTE' | 'LICENSE';
  payload: EncryptedPayload;
  decryptedValue?: string;
  isRevealed: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class VaultState {
  readonly masterPassphrase = signal<string>('NexusAISolution#Master2026!');
  readonly isVaultUnlocked = signal<boolean>(true);
  readonly masterFingerprint = signal<string>('B8:4C:91:2E:7A:3F:01:99');

  readonly records = signal<VaultRecord[]>([]);

  constructor() {
    this.seedInitialVault();
  }

  private async seedInitialVault() {
    const defaultKey = this.masterPassphrase();
    const fp = await calculateFingerprint(defaultKey);
    this.masterFingerprint.set(fp);

    const seed1 = await encryptText(
      'nexus_live_sk_89f029147a2e8c049d82',
      defaultKey
    );
    const seed2 = await encryptText(
      'DATABASE_URL=postgres://nexus_admin:P@ssword2026!@cloudsql.internal/db_main',
      defaultKey
    );
    const seed3 = await encryptText(
      'NEXUS-ENTERPRISE-MASTER-KEY-VALID-UNTIL-2028',
      defaultKey
    );

    this.records.set([
      {
        id: 'rec-1',
        title: 'Nexus API Secret Key (Production)',
        category: 'API_KEY',
        payload: seed1,
        decryptedValue: 'nexus_live_sk_89f029147a2e8c049d82',
        isRevealed: false,
        createdAt: 'Hari ini, 09:30',
      },
      {
        id: 'rec-2',
        title: 'Cloud Database Connection String',
        category: 'SECRET_TOKEN',
        payload: seed2,
        decryptedValue: 'DATABASE_URL=postgres://nexus_admin:P@ssword2026!@cloudsql.internal/db_main',
        isRevealed: false,
        createdAt: 'Kemarin, 14:15',
      },
      {
        id: 'rec-3',
        title: 'Master Enterprise Activation Secret',
        category: 'LICENSE',
        payload: seed3,
        decryptedValue: 'LD-ENTERPRISE-MASTER-KEY-VALID-UNTIL-2028',
        isRevealed: false,
        createdAt: '3 hari yang lalu',
      },
    ]);
  }

  async addRecord(title: string, rawSecret: string, category: VaultRecord['category']): Promise<void> {
    const key = this.masterPassphrase();
    const payload = await encryptText(rawSecret, key);

    const newRecord: VaultRecord = {
      id: 'rec-' + Date.now(),
      title,
      category,
      payload,
      decryptedValue: rawSecret,
      isRevealed: true,
      createdAt: 'Baru saja',
    };

    this.records.update((list) => [newRecord, ...list]);
  }

  async toggleReveal(id: string) {
    const list = this.records();
    const rec = list.find((r) => r.id === id);
    if (!rec) return;

    if (!rec.decryptedValue) {
      try {
        const cleartext = await decryptText(rec.payload, this.masterPassphrase());
        rec.decryptedValue = cleartext;
      } catch (err: unknown) {
        throw new Error((err as Error).message);
      }
    }

    this.records.update((items) =>
      items.map((r) => (r.id === id ? { ...r, isRevealed: !r.isRevealed } : r))
    );
  }

  deleteRecord(id: string) {
    this.records.update((list) => list.filter((r) => r.id !== id));
  }

  async setMasterPassphrase(newPassphrase: string) {
    this.masterPassphrase.set(newPassphrase);
    const fp = await calculateFingerprint(newPassphrase);
    this.masterFingerprint.set(fp);
  }
}
