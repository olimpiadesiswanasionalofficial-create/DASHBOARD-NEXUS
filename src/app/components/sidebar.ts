import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProductState } from '../services/product-state';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="w-64 bg-[#0a0d14] text-slate-300 flex flex-col border-r border-white/5 shrink-0 select-none min-h-screen">
      
      <!-- Brand Logo Header -->
      <div class="p-5 flex items-center gap-3 border-b border-white/5">
        <div class="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-600/30">
          LD
        </div>
        <div class="leading-tight">
          <div class="font-extrabold text-white text-base tracking-tight">Leveling Digital</div>
          <div class="text-[11px] text-slate-400">AI Venture Suite</div>
        </div>
      </div>

      <!-- Navigation Menu List -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        
        <!-- 1. Beranda -->
        <button
          type="button"
          (click)="selectNav('beranda')"
          [class]="productState.activeSidebar() === 'beranda' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">home</mat-icon>
          <span>Beranda</span>
        </button>

        <!-- 2. Produk (Highlighted) -->
        <button
          type="button"
          (click)="selectNav('produk')"
          [class]="productState.activeSidebar() === 'produk' ? 'bg-gradient-to-r from-red-950/60 to-red-900/30 text-red-400 border-l-4 border-red-500 font-semibold shadow-inner' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition text-left"
        >
          <div class="flex items-center gap-3.5">
            <mat-icon class="text-xl text-red-500">inventory_2</mat-icon>
            <span class="text-white font-bold">Produk</span>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            6/6
          </span>
        </button>

        <!-- 3. Tool Builder -->
        <button
          type="button"
          (click)="selectNav('tool-builder')"
          [class]="productState.activeSidebar() === 'tool-builder' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">build</mat-icon>
          <span>Tool Builder</span>
        </button>

        <!-- 4. Galeri -->
        <button
          type="button"
          (click)="selectNav('galeri')"
          [class]="productState.activeSidebar() === 'galeri' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">collections</mat-icon>
          <span>Galeri</span>
        </button>

        <!-- 5. Avatar -->
        <button
          type="button"
          (click)="selectNav('avatar')"
          [class]="productState.activeSidebar() === 'avatar' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">group</mat-icon>
          <span>Avatar</span>
        </button>

        <!-- 6. Create Avatar -->
        <button
          type="button"
          (click)="selectNav('create-avatar')"
          [class]="productState.activeSidebar() === 'create-avatar' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">auto_fix_high</mat-icon>
          <span>Create Avatar</span>
        </button>

        <!-- 7. AI Mentor -->
        <button
          type="button"
          (click)="selectNav('ai-mentor')"
          [class]="productState.activeSidebar() === 'ai-mentor' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">school</mat-icon>
          <span>AI Mentor</span>
        </button>

        <!-- 8. Biaya -->
        <button
          type="button"
          (click)="selectNav('biaya')"
          [class]="productState.activeSidebar() === 'biaya' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">payments</mat-icon>
          <span>Biaya</span>
        </button>

        <!-- 9. Panduan -->
        <button
          type="button"
          (click)="selectNav('panduan')"
          [class]="productState.activeSidebar() === 'panduan' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">menu_book</mat-icon>
          <span>Panduan</span>
        </button>

        <!-- 10. LD Academy -->
        <button
          type="button"
          (click)="selectNav('ld-academy')"
          [class]="productState.activeSidebar() === 'ld-academy' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <div class="flex items-center gap-3.5">
            <mat-icon class="text-xl">smart_display</mat-icon>
            <span>LD Academy</span>
          </div>
          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">NEW</span>
        </button>

        <!-- 11. Bantuan -->
        <button
          type="button"
          (click)="selectNav('bantuan')"
          [class]="productState.activeSidebar() === 'bantuan' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">help</mat-icon>
          <span>Bantuan</span>
        </button>

        <!-- 12. Pengaturan -->
        <button
          type="button"
          (click)="selectNav('pengaturan')"
          [class]="productState.activeSidebar() === 'pengaturan' ? 'bg-red-950/40 text-red-400 border border-red-500/30' : 'hover:bg-white/5 text-slate-300 hover:text-white'"
          class="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-medium transition text-left"
        >
          <mat-icon class="text-xl">settings</mat-icon>
          <span>Pengaturan</span>
        </button>

      </nav>

      <!-- Bottom Dark Mode Toggle -->
      <div class="p-4 border-t border-white/5 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm font-medium text-slate-300">
          <mat-icon class="text-red-400 text-lg">contrast</mat-icon>
          <span>Mode Gelap</span>
        </div>

        <button
          type="button"
          (click)="productState.toggleDarkMode()"
          class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
          [class]="productState.isDarkMode() ? 'bg-red-400' : 'bg-slate-700'"
          role="switch"
          [attr.aria-checked]="productState.isDarkMode()"
          aria-label="Toggle Dark Mode"
        >
          <span
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
            [class]="productState.isDarkMode() ? 'translate-x-5' : 'translate-x-0'"
          ></span>
        </button>
      </div>

    </aside>
  `,
})
export class Sidebar {
  readonly productState = inject(ProductState);

  selectNav(item: string) {
    this.productState.setSidebar(item);
  }
}
