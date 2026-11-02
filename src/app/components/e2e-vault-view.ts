import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { VaultState, VaultRecord } from '../services/vault-state';
import { encryptText, EncryptedPayload } from '../core/crypto-e2e';

@Component({
  selector: 'app-e2e-vault-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Brankas Data Enkripsi End-to-End (E2EE)
            </h2>
            <span class="rounded bg-purple-950/80 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
              AES-256-GCM
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-400">
            Perlindungan privasi maksimal: data didekripsi secara lokal di perangkat Anda tanpa pernah meninggalkan browser dalam bentuk teks biasa.
          </p>
        </div>

        <button
          type="button"
          (click)="isAddRecordOpen.set(!isAddRecordOpen())"
          class="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-purple-500/20 hover:opacity-95 transition"
        >
          <mat-icon class="text-sm">add_moderator</mat-icon>
          <span>{{ isAddRecordOpen() ? 'Tutup Form' : 'Enkripsi Data Baru' }}</span>
        </button>
      </div>

      <!-- Security Guarantee Banner -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-1">
          <div class="font-bold text-white flex items-center gap-1.5">
            <mat-icon class="text-emerald-400 text-sm">verified</mat-icon>
            Algoritma Otentikasi
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            AES-256-GCM authenticated cipher dengan tag verifikasi 128-bit mencegah manipulasi bit (tampering).
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-1">
          <div class="font-bold text-white flex items-center gap-1.5">
            <mat-icon class="text-cyan-400 text-sm">key</mat-icon>
            Derivasi Kunci Keras
          </div>
          <p class="text-slate-400 text-[11px] leading-relaxed">
            PBKDF2 dengan 100.000 iterasi hash SHA-256 & garam acak 16-byte (salt) kebal terhadap serangan brute-force.
          </p>
        </div>

        <div class="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-1">
          <div class="font-bold text-white flex items-center gap-1.5">
            <mat-icon class="text-purple-400 text-sm">fingerprint</mat-icon>
            Sidik Jari Kriptografi
          </div>
          <p class="text-emerald-400 font-mono text-[11px] font-semibold">
            {{ vault.masterFingerprint() }}
          </p>
        </div>
      </div>

      <!-- Add New Record Form (Collapsible) -->
      @if (isAddRecordOpen()) {
        <div class="rounded-3xl border border-purple-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-fade-in">
          <h3 class="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <mat-icon class="text-purple-400 text-sm">enhanced_encryption</mat-icon>
            Simpan & Enkripsi Data Sensitif ke Brankas
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label for="vault-title" class="block text-xs font-semibold text-slate-300 mb-1">Judul / Label Data</label>
              <input
                id="vault-title"
                type="text"
                [formControl]="newTitleControl"
                placeholder="Contoh: Secret Key Production Nexus"
                class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label for="vault-category" class="block text-xs font-semibold text-slate-300 mb-1">Kategori</label>
              <select
                id="vault-category"
                [formControl]="newCategoryControl"
                class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="API_KEY">API Key / Token</option>
                <option value="SECRET_TOKEN">Koneksi Database / Kredensial</option>
                <option value="LICENSE">Kunci Lisensi / Aktivasi</option>
                <option value="NOTE">Catatan Terenkripsi Rahasia</option>
              </select>
            </div>
          </div>

          <div>
            <label for="vault-secret" class="block text-xs font-semibold text-slate-300 mb-1">Teks / Rahasia Mentah (Plaintext)</label>
            <textarea
              id="vault-secret"
              rows="3"
              [formControl]="newSecretControl"
              placeholder="Masukkan token rahasia, password internal, atau catatan penting..."
              class="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 px-3 text-xs font-mono text-white focus:border-purple-500 focus:outline-none"
            ></textarea>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button
              type="button"
              (click)="isAddRecordOpen.set(false)"
              class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="button"
              (click)="handleSaveRecord()"
              class="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-95"
            >
              Enkripsi & Simpan
            </button>
          </div>
        </div>
      }

      <!-- Interactive E2EE Encryption Simulator / Playground -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-cyan-400 text-sm">code</mat-icon>
              Uji Coba Enkripsi Interaktif (Live Cryptographic Inspector)
            </h3>
            <p class="text-xs text-slate-400">
              Ketik teks apa saja untuk melihat ciphertext AES-256-GCM secara langsung.
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Input Plaintext -->
          <div>
            <label for="test-plain" class="block text-xs font-semibold text-slate-300 mb-1.5">Teks Mentah (Plaintext)</label>
            <textarea
              id="test-plain"
              rows="4"
              [formControl]="testPlaintextControl"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
            ></textarea>
            <button
              type="button"
              (click)="runLiveEncryption()"
              class="mt-2 rounded-xl bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition flex items-center gap-1.5"
            >
              <mat-icon class="text-xs">lock</mat-icon> Enkripsi Sekarang
            </button>
          </div>

          <!-- Output Ciphertext -->
          <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span class="font-semibold text-purple-300">Hasil AES-256-GCM Ciphertext (Base64):</span>
                <span class="text-[10px] text-emerald-400 font-mono">100k PBKDF2</span>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 break-all select-all max-h-24 overflow-y-auto">
                {{ liveCiphertext() || 'Menunggu input...' }}
              </div>
            </div>

            @if (livePayload()) {
              <div class="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div>IV: <span class="text-slate-200">{{ livePayload()?.iv }}</span></div>
                <div>Garam (Salt): <span class="text-slate-200">{{ livePayload()?.salt?.slice(0, 10) }}...</span></div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Vault Records List -->
      <div class="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div class="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <mat-icon class="text-emerald-400 text-sm">lock_person</mat-icon>
              Daftar Rahasia Tersimpan di Brankas ({{ vault.records().length }})
            </h3>
            <p class="text-xs text-slate-400">Kunci tersimpan dengan enkripsi client-side end-to-end.</p>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          @for (rec of vault.records(); track rec.id) {
            <div class="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                    <mat-icon class="text-xs">vpn_key</mat-icon>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-white">{{ rec.title }}</h4>
                    <span class="text-[10px] text-slate-500 font-mono">{{ rec.category }} &bull; {{ rec.createdAt }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    (click)="vault.toggleReveal(rec.id)"
                    class="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition flex items-center gap-1"
                  >
                    <mat-icon class="text-xs">{{ rec.isRevealed ? 'visibility_off' : 'visibility' }}</mat-icon>
                    {{ rec.isRevealed ? 'Sembunyikan' : 'Buka Rahasia' }}
                  </button>

                  <button
                    type="button"
                    (click)="vault.deleteRecord(rec.id)"
                    class="rounded-lg p-1 text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                    title="Hapus Record"
                    aria-label="Hapus Rahasia"
                  >
                    <mat-icon class="text-xs">delete</mat-icon>
                  </button>
                </div>
              </div>

              <!-- Content display (Ciphertext vs Decrypted) -->
              <div class="mt-3">
                @if (rec.isRevealed) {
                  <div class="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 font-mono text-xs text-emerald-300 break-all select-all flex items-center justify-between">
                    <span>{{ rec.decryptedValue }}</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0 ml-2">
                      DECRYPTED
                    </span>
                  </div>
                } @else {
                  <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3 font-mono text-[11px] text-slate-500 break-all select-all flex items-center justify-between">
                    <span>{{ rec.payload.ciphertext }}</span>
                    <span class="text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0 ml-2">
                      ENCRYPTED (AES-GCM)
                    </span>
                  </div>
                }
              </div>
            </div>
          } @empty {
            <div class="text-center py-8 text-xs text-slate-500">
              Belum ada data rahasia. Klik "Enkripsi Data Baru" di atas untuk menambahkan.
            </div>
          }
        </div>
      </div>

    </div>
  `,
})
export class E2eVaultView {
  readonly vault = inject(VaultState);

  readonly isAddRecordOpen = signal<boolean>(false);
  readonly newTitleControl = new FormControl('', [Validators.required]);
  readonly newCategoryControl = new FormControl<VaultRecord['category']>('API_KEY', [Validators.required]);
  readonly newSecretControl = new FormControl('', [Validators.required]);

  readonly testPlaintextControl = new FormControl(
    'nexus_oauth_secret_leveling_digital_live_891024'
  );
  readonly liveCiphertext = signal<string>('');
  readonly livePayload = signal<EncryptedPayload | null>(null);

  constructor() {
    this.runLiveEncryption();
  }

  async runLiveEncryption() {
    const text = this.testPlaintextControl.value || 'Hello Leveling Digital';
    const payload = await encryptText(text, this.vault.masterPassphrase());
    this.livePayload.set(payload);
    this.liveCiphertext.set(payload.ciphertext);
  }

  async handleSaveRecord() {
    const title = this.newTitleControl.value?.trim();
    const secret = this.newSecretControl.value?.trim();
    const category = this.newCategoryControl.value || 'API_KEY';

    if (!title || !secret) return;

    await this.vault.addRecord(title, secret, category);
    this.newTitleControl.reset('');
    this.newSecretControl.reset('');
    this.isAddRecordOpen.set(false);
  }
}
