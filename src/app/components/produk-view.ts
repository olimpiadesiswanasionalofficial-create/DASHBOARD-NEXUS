import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ConceptItem, AcademyLesson, ProductState } from '../services/product-state';
import { NotificationState } from '../services/notification-service';

@Component({
  selector: 'app-produk-view',
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 text-white pb-12">

      <!-- TOP BAR: Product Brand & Status Header -->
      <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-black tracking-tight text-white">Nexus</h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            kalkulator HPP & harga jual &bull; 6/6 AI selesai
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400">Status Produk:</span>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 border border-emerald-600/30 flex items-center gap-1">
            <mat-icon class="text-xs">check_circle</mat-icon>
            Siap Dijual
          </span>
        </div>
      </header>

      <!-- SUB-NAVIGATION BAR (Pills matching image_ace737e7.png) -->
      <nav aria-label="Sub-navigasi Produk" class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        @for (tab of productState.subTabs; track tab.id) {
          <button
            type="button"
            (click)="productState.setSubTab(tab.id)"
            [class]="productState.activeSubTab() === tab.id ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30 ring-2 ring-red-400/50 scale-[1.02]' : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5'"
            class="px-4 py-2 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
          >
            <span>{{ tab.label }}</span>
            @if (tab.id === 'research') {
              <span class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                AI
              </span>
            } @else if (tab.badge) {
              <span
                [class]="productState.activeSubTab() === tab.id ? 'bg-black/30 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'"
                class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
              >
                {{ tab.badge }}
              </span>
            }
          </button>
        }
      </nav>

      <!-- TAB CONTENT CONTAINER -->
      <main class="mt-2">
        
        <!-- ========================================== -->
        <!-- 1. RESEARCH & VALIDATION TAB (image_ace737e7.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'research') {
          <section aria-labelledby="research-heading" class="space-y-6 animate-fadeIn">
            <!-- Header section -->
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  01 &bull; RISET & VALIDASI PASAR
                </span>
                <h2 id="research-heading" class="text-3xl font-black tracking-tight mt-1">
                  Ketik ide. <span class="text-red-500">AI yang riset.</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  Maya (AI riset) nyari bukti orang lagi nyari & beli secara real-time di media sosial, bukan sekadar nebak.
                </p>
              </div>

              <div class="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  (click)="copyResearchReport()"
                  class="px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <mat-icon class="text-xs">share</mat-icon>
                  <span>Salin Riset</span>
                </button>

                <button
                  type="button"
                  (click)="productState.triggerScan()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  <mat-icon [class.animate-spin]="productState.isScanning()" class="text-sm">
                    {{ productState.isScanning() ? 'refresh' : 'bolt' }}
                  </mat-icon>
                  <span>5 konsep &bull; 40 detik</span>
                </button>
              </div>
            </div>

            <!-- Niche idea search bar & presets -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label for="niche-idea-input" class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  NICHE IDEA / KATA KUNCI PRODUK
                </label>
                <span class="text-[11px] text-slate-500 font-mono">Tekan Enter untuk memindai</span>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <div class="relative flex-1">
                  <input
                    id="niche-idea-input"
                    type="text"
                    [value]="productState.nicheIdeaInput()"
                    (input)="updateNicheInput($event)"
                    (keydown.enter)="productState.triggerScan()"
                    placeholder="Contoh: kalkulator harga jual buat seller online"
                    class="w-full bg-[#111624] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-sans"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center gap-1">
                    <mat-icon class="text-sm">search</mat-icon>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="productState.triggerScan()"
                  [disabled]="productState.isScanning()"
                  class="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shrink-0 shadow-lg shadow-red-600/20 disabled:opacity-50 cursor-pointer"
                >
                  <mat-icon [class.animate-spin]="productState.isScanning()" class="text-sm">
                    {{ productState.isScanning() ? 'refresh' : 'auto_awesome' }}
                  </mat-icon>
                  <span>{{ productState.isScanning() ? 'Memindai Pasaran...' : 'Scan Ide Baru' }}</span>
                </button>
              </div>

              <!-- Preset Quick Niche Tags -->
              <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span class="text-[10px] font-mono text-slate-400 uppercase mr-1">Riset Cepat:</span>
                @for (preset of productState.presetNiches; track preset.label) {
                  <button
                    type="button"
                    (click)="productState.usePresetNiche(preset.query)"
                    class="px-2.5 py-1 rounded-lg bg-[#111624] hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span class="text-red-400 font-bold">#</span>
                    <span>{{ preset.label }}</span>
                  </button>
                }
              </div>

              <!-- Source Chips (Threads, Reddit, TikTok, Ad Library) -->
              <div class="flex flex-wrap items-center gap-2 pt-1">
                <span class="text-[11px] font-mono text-slate-400 uppercase mr-1">Sumber Data:</span>
                @for (source of ['Threads', 'Reddit', 'TikTok', 'Ad Library']; track source) {
                  <button
                    type="button"
                    (click)="productState.toggleSource(source)"
                    [class]="productState.selectedSources().includes(source) ? 'bg-slate-800 text-white border-red-500/40 shadow-sm' : 'bg-transparent text-slate-500 border-white/5 hover:border-white/15'"
                    class="px-3 py-1.5 rounded-full text-xs border font-medium transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{{ source === 'Threads' ? '@ Threads' : source }}</span>
                    @if (productState.selectedSources().includes(source)) {
                      <mat-icon class="text-[12px] text-emerald-400">check</mat-icon>
                    }
                  </button>
                }
              </div>

              <!-- Scanning status progress bar & real-time counter -->
              <div class="p-3.5 rounded-2xl bg-[#0c101d] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-3">
                  <div class="h-2 w-28 bg-slate-800 rounded-full overflow-hidden shrink-0">
                    <div
                      class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      [style.width.%]="productState.scanProgress()"
                    ></div>
                  </div>
                  <span class="text-slate-300 font-medium">
                    {{ productState.scanStatusMessage() }}
                  </span>
                </div>
                <div class="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span class="flex items-center gap-1 text-emerald-400">
                    <span class="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Live Data
                  </span>
                  <span>{{ productState.selectedSources().length }} Platform Terhubung</span>
                  <span class="text-white font-bold">&bull; {{ productState.scannedPostCount().toLocaleString('id-ID') }} Diskusi Terindeks</span>
                </div>
              </div>
            </div>

            <!-- AI Integration Badge & Supercharge Toolbar -->
            <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-950/40 via-[#111827] to-amber-950/30 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/30 shrink-0">
                  <mat-icon class="text-2xl">auto_fix_high</mat-icon>
                </div>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                      Nexus Free AI Supercharge
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Gemini 3.8 Flash (Active)
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      Multi-Ide Synthesis
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 mt-1">
                    Gabungkan 5 ide produk menjadi <strong>1 Master Product Blueprint</strong> dengan USP terkuat dan potensi omzet maksimal.
                  </p>
                </div>
              </div>

              <!-- Button to Synthesize All Concepts Into One Master Powerhouse -->
              <button
                type="button"
                (click)="synthesizeAllConceptsIntoMaster()"
                [disabled]="productState.isSynthesizingMaster()"
                class="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-orange-600/30 shrink-0 cursor-pointer disabled:opacity-50"
              >
                <mat-icon [class.animate-spin]="productState.isSynthesizingMaster()" class="text-base">
                  {{ productState.isSynthesizingMaster() ? 'autorenew' : 'merge_type' }}
                </mat-icon>
                <span>{{ productState.isSynthesizingMaster() ? 'AI Sedang Meleburkan Ide...' : 'Gabungkan Semua Ide Jadi Satu (AI)' }}</span>
              </button>
            </div>

            <!-- MASTER SYNTHESIZED PRODUCT SHOWCASE -->
            @if (productState.masterBlueprint(); as mb) {
              <div class="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#121627] via-[#101422] to-amber-950/30 border-2 border-amber-500/60 shadow-2xl shadow-amber-500/15 space-y-5 animate-fadeIn">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div class="space-y-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                        <mat-icon class="text-xs text-amber-400">stars</mat-icon>
                        MASTER PRODUCT BLUEPRINT &bull; SINERGI 5 IDE AI
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/30">
                        SKOR TERTINGGI: 98/100
                      </span>
                    </div>
                    <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                      {{ mb.masterTitle }}
                    </h3>
                    <p class="text-xs sm:text-sm text-amber-200/90 font-medium">
                      {{ mb.tagline }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3 shrink-0 self-end sm:self-start">
                    <div class="text-right">
                      <span class="text-[10px] font-mono text-slate-400 block uppercase">Harga Bundel All-in-One</span>
                      <span class="text-xl font-black text-emerald-400 font-mono">{{ mb.bundlePrice }}</span>
                    </div>
                    <div class="h-16 w-16 rounded-2xl bg-black/60 border border-amber-500/50 flex flex-col items-center justify-center shadow-lg">
                      <span class="text-2xl font-black text-amber-400 font-mono leading-none">{{ mb.compositeScore }}</span>
                      <span class="text-[9px] uppercase font-bold text-slate-400 mt-0.5">SKOR AI</span>
                    </div>
                  </div>
                </div>

                <!-- 3 Core Pillars -->
                <div class="space-y-1.5">
                  <span class="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    3 Pilar Sinergi Utama:
                  </span>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    @for (pillar of mb.corePillars; track pillar) {
                      <div class="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                        <div class="flex items-center gap-1.5 text-amber-300 text-xs font-bold font-mono">
                          <mat-icon class="text-sm text-emerald-400">check_circle</mat-icon>
                          <span>Pilar Solusi</span>
                        </div>
                        <p class="text-xs text-slate-200 font-medium leading-snug">{{ pillar }}</p>
                      </div>
                    }
                  </div>
                </div>

                <!-- Synthesized USP and Market Reach -->
                <div class="p-4 sm:p-5 rounded-2xl bg-[#080c16] border border-amber-500/30 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span class="font-mono text-amber-400 font-bold uppercase text-[11px] flex items-center gap-1.5">
                      <mat-icon class="text-xs">bolt</mat-icon>
                      Offer Penawaran Terpadu (USP Yang Menyatukan Semua Solusi):
                    </span>
                    <span class="font-mono text-slate-300 text-xs">
                      Total Potensi Pasar: <strong class="text-emerald-400 font-bold">{{ mb.totalMarketReach }}</strong>
                    </span>
                  </div>

                  <blockquote class="text-sm sm:text-base text-white font-medium italic border-l-4 border-amber-400 pl-4 py-1 bg-amber-500/5 rounded-r-xl">
                    "{{ mb.synthesizedUsp }}"
                  </blockquote>

                  <p class="text-xs text-slate-300 pt-1 leading-relaxed">
                    <strong class="text-amber-300">Analisis Keunggulan Gabungan:</strong>
                    {{ mb.synergyExplanation }}
                  </p>
                </div>

                <!-- Suggested Features Grid -->
                <div class="space-y-1.5">
                  <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Fitur Gabungan Siap Rilis:
                  </span>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (feature of mb.suggestedFeatures; track feature) {
                      <div class="p-2.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center gap-2 text-xs text-slate-200">
                        <mat-icon class="text-emerald-400 text-xs">done_all</mat-icon>
                        <span>{{ feature }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Master Hook & Action CTA -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                  <div class="flex items-center gap-2 text-xs text-slate-400 flex-1">
                    <mat-icon class="text-emerald-400 text-sm shrink-0">auto_awesome</mat-icon>
                    <span>Hook Iklan Gabungan: <strong class="text-slate-100 font-mono">{{ mb.masterHook }}</strong></span>
                  </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      (click)="copyMasterBlueprint()"
                      class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <mat-icon class="text-xs">content_copy</mat-icon>
                      <span>Salin Blueprint</span>
                    </button>
                    <button
                      type="button"
                      (click)="applyMasterBlueprintToSuite()"
                      class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/30 cursor-pointer"
                    >
                      <mat-icon class="text-xs">rocket_launch</mat-icon>
                      <span>Terapkan Master Blueprint ke Suite &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- 5 Konsep · Skor Demand -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between">
                <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  5 HASIL VALIDASI KONSEP &bull; BERDASARKAN DEMAND SCORE
                </div>
                <span class="text-xs text-slate-400">Klik konsep untuk melihat detail metrik</span>
              </div>

              <div class="space-y-3">
                @for (concept of productState.demandConcepts(); track concept.id) {
                  <div
                    [class]="concept.highlight ? 'border-red-500/50 bg-gradient-to-r from-red-950/25 via-[#111624] to-[#111624] shadow-lg shadow-red-950/20' : 'border-white/5 bg-[#111624] hover:border-white/20'"
                    class="p-4 sm:p-5 rounded-2xl border transition-all space-y-4"
                  >
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <!-- Main Clickable Concept Info -->
                      <button
                        type="button"
                        (click)="selectDemandConcept(concept)"
                        class="flex items-start sm:items-center gap-4 flex-1 text-left cursor-pointer focus:outline-none"
                      >
                        <!-- Score Badge with Radial Visual -->
                        <div class="shrink-0 flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-black/40 border border-emerald-500/30">
                          <span class="text-2xl font-black text-emerald-400 font-mono leading-none">
                            {{ concept.demandScore }}
                          </span>
                          <span class="text-[9px] uppercase font-bold text-slate-400 mt-0.5">SKOR</span>
                        </div>

                        <div class="flex-1 space-y-1">
                          <div class="flex flex-wrap items-center gap-2">
                            <h3 class="text-base sm:text-lg font-bold text-white">{{ concept.name }}</h3>
                            @if (concept.highlight) {
                              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                TERPILIH UNTUK SUITE
                              </span>
                            }
                            @if (concept.demandScore >= 90) {
                              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                🔥 VIRAL DEMAND
                              </span>
                            }
                          </div>
                          
                          <p class="text-xs text-slate-400">{{ concept.tagline }}</p>

                          <!-- Progress Bar for Demand Score -->
                          <div class="w-full max-w-md h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                            <div
                              class="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 rounded-full"
                              [style.width.%]="concept.demandScore"
                            ></div>
                          </div>
                        </div>
                      </button>

                      <!-- Price and Action Buttons -->
                      <div class="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                        <div class="text-right mr-2 hidden sm:block">
                          <div class="text-xs text-slate-400 uppercase font-mono text-[10px]">Harga Jual Ideal</div>
                          <div class="text-sm font-bold text-emerald-400 font-mono">{{ concept.price }}</div>
                        </div>

                        <button
                          type="button"
                          (click)="toggleConceptDetails(concept.id)"
                          class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                        >
                          <mat-icon class="text-xs">{{ expandedConceptId() === concept.id ? 'expand_less' : 'analytics' }}</mat-icon>
                          <span>{{ expandedConceptId() === concept.id ? 'Tutup' : 'Metrik' }}</span>
                        </button>

                        <button
                          type="button"
                          (click)="proceedToBrand(concept)"
                          class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-600/30 cursor-pointer"
                        >
                          <span>Gunakan</span>
                          <mat-icon class="text-xs">arrow_forward</mat-icon>
                        </button>
                      </div>

                    </div>

                    <!-- Expandable Deep Dive Metrics Panel -->
                    @if (expandedConceptId() === concept.id || concept.highlight) {
                      <div class="pt-3 border-t border-white/5 space-y-3 animate-fadeIn">
                        
                        <!-- 4 Key Market Metrics -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div class="p-3 rounded-xl bg-[#0c101d] border border-white/5">
                            <span class="text-[10px] font-mono text-slate-400 uppercase block">Search Volume</span>
                            <span class="text-xs sm:text-sm font-bold text-white mt-0.5 block font-mono">
                              {{ concept.searchVolume ?? '38.400 pencarian/bln' }}
                            </span>
                          </div>

                          <div class="p-3 rounded-xl bg-[#0c101d] border border-white/5">
                            <span class="text-[10px] font-mono text-slate-400 uppercase block">Trend Momentum</span>
                            <span class="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block">
                              {{ concept.trendMomentum ?? '+34% MoM (Kuat)' }}
                            </span>
                          </div>

                          <div class="p-3 rounded-xl bg-[#0c101d] border border-white/5">
                            <span class="text-[10px] font-mono text-slate-400 uppercase block">Tingkat Kompetisi</span>
                            <span class="text-xs sm:text-sm font-bold text-amber-400 mt-0.5 block">
                              {{ concept.competitionLevel ?? 'Rendah' }}
                            </span>
                          </div>

                          <div class="p-3 rounded-xl bg-[#0c101d] border border-white/5">
                            <span class="text-[10px] font-mono text-slate-400 uppercase block">Potensi Margin Bersih</span>
                            <span class="text-xs sm:text-sm font-bold text-emerald-300 mt-0.5 block font-mono">
                              {{ concept.potentialMargin ?? '45% - 65%' }}
                            </span>
                          </div>
                        </div>

                        <!-- Maya Qualitative Strategic Insight -->
                        <div class="p-3.5 rounded-xl bg-[#090d18] border border-red-500/20 space-y-2">
                          <div class="flex items-center gap-2">
                            <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                            <h4 class="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                              Maya AI Validasi Bukti Nyata
                            </h4>
                          </div>

                          <p class="text-xs text-slate-300 leading-relaxed">
                            <strong class="text-white">Mengapa Trending:</strong>
                            {{ concept.whyTrending ?? 'Tingginya komplain penjual marketplace terkait potongan fee dan kebutuhan kalkulasi instan.' }}
                          </p>

                          @if (concept.suggestedHook) {
                            <div class="p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-emerald-300 font-mono">
                              <span class="text-slate-400 font-bold block text-[10px] uppercase">Rekomendasi Hook Iklan:</span>
                              {{ concept.suggestedHook }}
                            </div>
                          }

                          <div class="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <span class="text-slate-400">
                              Target Pembeli: <strong class="text-slate-200">{{ concept.targetAudience ?? 'Seller online, UMKM, dropshipper' }}</strong>
                            </span>

                            <button
                              type="button"
                              (click)="copySingleConcept(concept)"
                              class="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <mat-icon class="text-xs">content_copy</mat-icon>
                              <span>Salin Data Konsep Ini</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    }

                  </div>
                }
              </div>
            </div>

            <!-- Bottom Research Action Footer -->
            <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div class="flex items-center gap-2 text-slate-400">
                <mat-icon class="text-emerald-400 text-sm">verified</mat-icon>
                <span>Validasi selesai. Konsep terpilih siap diotomasi menjadi Brand, Naskah Iklan Meta, dan Web-App.</span>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="productState.setSubTab('brand')"
                  class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <span>Lanjut ke Brand & Logo</span>
                  <mat-icon class="text-xs">arrow_forward</mat-icon>
                </button>
              </div>
            </div>

          </section>
        }

        <!-- ========================================== -->
        <!-- 2. OVERVIEW 6/6 TAB -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'overview') {
          <section aria-labelledby="overview-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  02 &bull; OVERVIEW PRODUK
                </span>
                <h2 id="overview-heading" class="text-3xl font-black tracking-tight mt-1">
                  6/6 Langkah AI <span class="text-emerald-400">Selesai 100%.</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  Produk siap diluncurkan dan siap menerima pesanan dari pembeli.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="productState.setSubTab('landing')"
                  class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <mat-icon class="text-sm">rocket_launch</mat-icon>
                  <span>Buka Landing Page</span>
                </button>
              </div>
            </div>

            <!-- Milestone Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <!-- Card 1: Riset -->
              <button type="button" (click)="productState.setSubTab('research')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">01 Riset & Validasi</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">Skor Demand 94 Terverifikasi</h3>
                <p class="text-xs text-slate-400">Masalah HPP & margin seller online tervalidasi di Threads & TikTok.</p>
              </button>

              <!-- Card 2: Brand -->
              <button type="button" (click)="productState.setSubTab('brand')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">02 Brand & Logo</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">Logo & 6 Warna Palet Kunci</h3>
                <p class="text-xs text-slate-400">Nexus, warna emerald & navy profesional, serta USP 1 menit.</p>
              </button>

              <!-- Card 3: Scripts -->
              <button type="button" (click)="productState.setSubTab('scripts')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">03 Copywriting Iklan</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">5 Naskah Meta Ads Teruji</h3>
                <p class="text-xs text-slate-400">Angle pain angka, edukasi HPP, myth-bust, demo, dan POV seller.</p>
              </button>

              <!-- Card 4: Image Ads -->
              <button type="button" (click)="productState.setSubTab('image-ads')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">04 Iklan Gambar</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">6 Image Ads Siap Pasang</h3>
                <p class="text-xs text-slate-400">Format UGC, Demo HP, Before/After, Listicle, Testimoni, dan Promo.</p>
              </button>

              <!-- Card 5: Web App -->
              <button type="button" (click)="productState.setSubTab('produk-app')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">05 Produk Deliverable</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">Web-App Nexus Online</h3>
                <p class="text-xs text-slate-400">Kalkulator otomatis untuk pembeli tanpa instalasi ribet.</p>
              </button>

              <!-- Card 6: Landing Page -->
              <button type="button" (click)="productState.setSubTab('landing')" class="p-5 rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/40 transition cursor-pointer space-y-3 text-left w-full">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-mono text-red-400 uppercase font-bold">06 Funnel Landing</span>
                  <span class="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <mat-icon class="text-sm">check</mat-icon>
                  </span>
                </div>
                <h3 class="text-base font-bold text-white">14 Section Konversi Tinggi</h3>
                <p class="text-xs text-slate-400">Responsif HP & Desktop, checkout direct payment gateway.</p>
              </button>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 3. BRAND & LOGO TAB (image_2c922502.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'brand') {
          <section aria-labelledby="brand-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  03 &bull; BRAND & LOGO
                </span>
                <h2 id="brand-heading" class="text-3xl font-black tracking-tight mt-1">
                  Logo & warna <span class="text-red-500">jadi sendiri.</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  Pilih 1 dari 3 logo, atau upload punya lu.
                </p>
              </div>

              <div class="shrink-0">
                <button
                  type="button"
                  (click)="regenerateLogoOptions()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <mat-icon class="text-sm">palette</mat-icon>
                  Logo dibikin AI
                </button>
              </div>
            </div>

            <!-- 3 Logo Options matching image_2c922502.png -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              
              <!-- Logo Option 1: Green Tag on Mint (Selected) -->
              <button
                type="button"
                (click)="productState.selectLogo(1)"
                [class]="productState.selectedLogoId() === 1 ? 'border-2 border-red-500 shadow-xl shadow-red-500/20' : 'border border-white/10 hover:border-white/30'"
                class="relative h-48 sm:h-56 rounded-3xl bg-[#fcf8f0] flex items-center justify-center cursor-pointer transition-all p-6 group focus:outline-none w-full"
              >
                <!-- Selected check badge -->
                @if (productState.selectedLogoId() === 1) {
                  <div class="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <mat-icon class="text-base">check</mat-icon>
                  </div>
                }

                <!-- Graphic Icon -->
                <div class="h-28 w-28 rounded-3xl bg-[#10b981] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <div class="h-14 w-14 border-4 border-white rounded-xl rotate-45 flex items-center justify-center">
                    <div class="h-3 w-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </button>

              <!-- Logo Option 2: Clean Typography "Nexus" -->
              <button
                type="button"
                (click)="productState.selectLogo(2)"
                [class]="productState.selectedLogoId() === 2 ? 'border-2 border-red-500 shadow-xl shadow-red-500/20' : 'border border-white/10 hover:border-white/30'"
                class="relative h-48 sm:h-56 rounded-3xl bg-white flex items-center justify-center cursor-pointer transition-all p-6 group focus:outline-none w-full"
              >
                @if (productState.selectedLogoId() === 2) {
                  <div class="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <mat-icon class="text-base">check</mat-icon>
                  </div>
                }

                <div class="text-center group-hover:scale-105 transition-transform">
                  <span class="text-3xl font-extrabold tracking-tight text-[#0a1a36]">Nex</span>
                  <span class="text-3xl font-extrabold tracking-tight text-[#10b981]">us</span>
                </div>
              </button>

              <!-- Logo Option 3: Monogram NX in Dark Box -->
              <button
                type="button"
                (click)="productState.selectLogo(3)"
                [class]="productState.selectedLogoId() === 3 ? 'border-2 border-red-500 shadow-xl shadow-red-500/20' : 'border border-white/10 hover:border-white/30'"
                class="relative h-48 sm:h-56 rounded-3xl bg-[#fbf7ee] flex items-center justify-center cursor-pointer transition-all p-6 group focus:outline-none w-full"
              >
                @if (productState.selectedLogoId() === 3) {
                  <div class="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <mat-icon class="text-base">check</mat-icon>
                  </div>
                }

                <div class="h-28 w-28 rounded-3xl bg-[#0f1b2b] border-2 border-teal-500/40 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <span class="text-3xl font-black text-slate-100 tracking-wider font-sans">NX</span>
                </div>
              </button>

            </div>

            <!-- PALET · 6 WARNA -->
            <div class="space-y-3 pt-4">
              <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                PALET &bull; 6 WARNA
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                @for (col of productState.brandColors(); track col.name) {
                  <button
                    type="button"
                    (click)="copyColorHex(col.hex, col.name)"
                    [class]="col.bgClass"
                    class="h-16 rounded-2xl p-3 flex flex-col justify-end text-left transition hover:scale-102 cursor-pointer shadow-md border border-white/10 relative overflow-hidden group"
                  >
                    <span [class]="col.textClass" class="text-xs font-mono font-bold">{{ col.name }}</span>
                    <span class="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition font-mono">{{ col.hex }}</span>
                  </button>
                }
              </div>
              @if (copiedColor()) {
                <div class="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <mat-icon class="text-xs">check</mat-icon>
                  <span>Hex kode {{ copiedColor() }} berhasil disalin ke clipboard!</span>
                </div>
              }
            </div>

            <!-- BRIEF · ONE-LINER -->
            <div class="space-y-2 pt-2">
              <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                BRIEF &bull; ONE-LINER
              </div>

              <div class="p-5 rounded-2xl bg-[#111624] border border-white/10 flex items-center gap-4">
                <div class="h-8 w-1 bg-emerald-500 rounded-full shrink-0"></div>
                <blockquote class="text-sm sm:text-base text-slate-200 font-medium italic">
                  {{ productState.brandOneLiner() }}
                </blockquote>
              </div>
            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 4. SCRIPTS 5 TAB (image_895e30eb.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'scripts') {
          <section aria-labelledby="scripts-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  04 &bull; SCRIPTS
                </span>
                <h2 id="scripts-heading" class="text-3xl font-black tracking-tight mt-1">
                  5 naskah iklan, <span class="text-red-500">beda angle.</span>
                </h2>
              </div>

              <div class="shrink-0">
                <button
                  type="button"
                  (click)="copyAllScripts()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <mat-icon class="text-sm">campaign</mat-icon>
                  5 script + caption Meta
                </button>
              </div>
            </div>

            <!-- Angle Selector Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              @for (angle of productState.scriptAngles(); track angle.id) {
                <button
                  type="button"
                  (click)="productState.selectAngle(angle.id)"
                  [class]="productState.selectedAngleId() === angle.id ? 'bg-red-600 text-white font-bold border-red-500 shadow-md shadow-red-600/30' : 'bg-[#111624] hover:bg-slate-800 text-slate-300 border-white/5'"
                  class="px-4 py-2 rounded-full text-xs border transition cursor-pointer"
                >
                  {{ angle.name }}
                </button>
              }
            </div>

            <!-- Two-Column Layout: Left Scenes vs Right Meta Ad Preview -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              <!-- Left Column: Scenes breakdown -->
              <div class="lg:col-span-6 space-y-4">
                @for (scene of productState.activeScript().scenes; track scene.number) {
                  <div class="p-4 sm:p-5 rounded-2xl bg-[#111624] border border-white/5 space-y-2 relative overflow-hidden">
                    <div class="h-full w-1 bg-red-600 absolute left-0 top-0"></div>
                    <span class="font-mono text-[11px] font-bold text-red-500 uppercase">
                      {{ scene.number }}
                    </span>
                    <p class="text-sm sm:text-base text-slate-200 font-medium leading-relaxed pl-1">
                      {{ scene.content }}
                    </p>
                  </div>
                }

                <div class="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    (click)="copyCurrentScript()"
                    class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <mat-icon class="text-xs">content_copy</mat-icon>
                    <span>Salin Naskah Ini</span>
                  </button>
                </div>
              </div>

              <!-- Right Column: Realistic Meta Ad Preview Card -->
              <div class="lg:col-span-6">
                <div class="rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
                  
                  <!-- Ad Header -->
                  <div class="p-4 flex items-center gap-3 border-b border-slate-100">
                    <div class="h-10 w-10 rounded-full bg-[#0d9488] text-white flex items-center justify-center font-bold text-sm">
                      NX
                    </div>
                    <div>
                      <div class="font-bold text-sm text-slate-900 leading-tight">Nexus</div>
                      <div class="text-[11px] text-slate-500">Bersponsor</div>
                    </div>
                  </div>

                  <!-- Ad Caption -->
                  <div class="px-4 py-3 text-sm text-slate-800 leading-normal">
                    {{ productState.activeScript().caption }}
                  </div>

                  <!-- Ad Creative Image Mockup -->
                  <div class="relative bg-slate-900 aspect-square sm:aspect-[4/3] overflow-hidden flex items-center justify-center">
                    <img
                      src="/assets/aistudio/image_895e30eb.png"
                      alt="Preview Iklan Meta"
                      class="w-full h-full object-cover"
                      referrerpolicy="no-referrer"
                    />
                    <!-- Overlay Text Banner matching the image -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <span class="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                        Modal 20rb,<br/>dijual 25rb,<br/>kok rugi?
                      </span>
                    </div>
                  </div>

                  <!-- Ad Footer Bar with CTA -->
                  <div class="p-3 bg-slate-50 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <div class="text-[10px] uppercase font-bold text-slate-400">NEXUS.ID</div>
                      <div class="text-xs font-bold text-slate-800">Kalkulator HPP & Harga Jual</div>
                    </div>
                    <button
                      type="button"
                      class="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                    >
                      Buka Web-App
                    </button>
                  </div>

                </div>
              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 5. IMAGE ADS 6 TAB (image_7176e181.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'image-ads') {
          <section aria-labelledby="imageads-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  05 &bull; IMAGE ADS
                </span>
                <h2 id="imageads-heading" class="text-3xl font-black tracking-tight mt-1">
                  Iklan gambar <span class="text-red-500">siap pasang.</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  Beda gaya, beda angle &mdash; warna ngunci ke brand.
                </p>
              </div>

              <div class="shrink-0">
                <button
                  type="button"
                  (click)="downloadAllAds()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30 cursor-pointer"
                >
                  <mat-icon class="text-sm">photo_library</mat-icon>
                  6 iklan &bull; 1 klik
                </button>
              </div>
            </div>

            <!-- 6 Image Ads Grid (matching image_7176e181.png) -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
              
              <!-- 1. UGC -->
              <div class="relative rounded-2xl overflow-hidden bg-slate-800 aspect-[9/16] shadow-xl group border border-white/5 flex flex-col justify-between p-3">
                <img
                  src="/assets/aistudio/image_895e30eb.png"
                  alt="UGC Ad"
                  class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30"></div>
                
                <div class="relative z-10">
                  <span class="text-xs font-black text-white leading-tight block drop-shadow">
                    Modal 20rb, dijual 25rb, kok rugi?
                  </span>
                </div>

                <div class="relative z-10 flex items-center justify-between">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">UGC</span>
                  <span class="text-[8px] px-1.5 py-0.5 rounded bg-emerald-600/90 text-white font-medium">Hitung pakai Nexus</span>
                </div>
              </div>

              <!-- 2. Demo HP -->
              <div class="relative rounded-2xl overflow-hidden bg-amber-50 aspect-[9/16] shadow-xl group border border-white/5 flex flex-col justify-between p-3 text-slate-900">
                <div class="relative z-10 text-center pt-2">
                  <span class="text-xs font-black text-slate-900 block leading-tight">
                    HPP + harga jual aman dalam 1 menit
                  </span>
                  <span class="text-[9px] text-slate-600 block mt-1">Tanpa Excel. Tanpa ribet.</span>
                </div>

                <!-- Phone mockup illustration in center -->
                <div class="relative z-10 my-auto mx-auto w-24 h-40 bg-white rounded-2xl border-4 border-slate-900 shadow-lg p-2 flex flex-col justify-between">
                  <div class="h-1.5 w-8 bg-slate-300 rounded-full mx-auto"></div>
                  <div class="text-[8px] font-mono text-center">Rp 17.000 + 8%</div>
                  <div class="p-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold text-center">
                    Rp 26.000
                  </div>
                </div>

                <div class="relative z-10">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">Demo HP</span>
                </div>
              </div>

              <!-- 3. Before/After -->
              <div class="relative rounded-2xl overflow-hidden bg-[#fbf7ee] aspect-[9/16] shadow-xl group border border-white/5 flex flex-col justify-between p-2 text-slate-900">
                <div class="relative z-10 text-center">
                  <span class="text-[11px] font-black text-slate-900 block">Beda tipis, efeknya jauh.</span>
                </div>

                <!-- Comparison split -->
                <div class="grid grid-cols-2 gap-1 my-auto">
                  <div class="bg-red-50 border border-red-200 rounded-lg p-1.5 text-center">
                    <span class="text-[7px] font-bold text-red-600 uppercase block">HARGA DITEBAK</span>
                    <div class="text-xl my-1">😞</div>
                    <span class="text-[8px] font-bold text-red-700 leading-none block">Untung tipis, saldo minus</span>
                  </div>
                  <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 text-center">
                    <span class="text-[7px] font-bold text-emerald-600 uppercase block">HARGA DIHITUNG</span>
                    <div class="text-xl my-1">🤑</div>
                    <span class="text-[8px] font-bold text-emerald-700 leading-none block">Margin aman 35%</span>
                  </div>
                </div>

                <div class="relative z-10">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white">Before/after</span>
                </div>
              </div>

              <!-- 4. Listicle -->
              <div class="relative rounded-2xl overflow-hidden bg-[#fefbf6] aspect-[9/16] shadow-xl group border border-white/5 flex flex-col justify-between p-3 text-slate-900">
                <div class="relative z-10">
                  <span class="text-xs font-black text-slate-900 block leading-tight">
                    3 biaya yang sering lupa dihitung seller
                  </span>
                </div>

                <div class="relative z-10 space-y-1.5 my-auto">
                  <div class="flex items-center gap-1.5 text-[9px] font-semibold">
                    <span class="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] shrink-0">1</span>
                    <span>Ongkir subsidi</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[9px] font-semibold">
                    <span class="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] shrink-0">2</span>
                    <span>Fee marketplace</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[9px] font-semibold">
                    <span class="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] shrink-0">3</span>
                    <span>Kemasan & bubble</span>
                  </div>
                </div>

                <div class="relative z-10 flex items-center justify-between">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">Listicle</span>
                  <span class="text-[8px] text-slate-500">dihitung otomatis</span>
                </div>
              </div>

              <!-- 5. Testimoni -->
              <div class="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[9/16] shadow-xl group border border-white/5 flex flex-col justify-between p-3">
                <img
                  src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=600&q=80"
                  alt="Seller Testimonial"
                  class="absolute inset-0 w-full h-full object-cover"
                  referrerpolicy="no-referrer"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                <div class="relative z-10">
                  <span class="text-[10px] font-bold text-emerald-400">⭐⭐⭐⭐⭐</span>
                </div>

                <div class="relative z-10 bg-white/90 backdrop-blur rounded-xl p-2 text-slate-900 shadow">
                  <p class="text-[9px] font-bold italic leading-snug">
                    “Akhirnya tahu untung bersih per pcs. Harga naik dikit, tapi laku tetap jalan.”
                  </p>
                  <span class="text-[8px] text-slate-600 block mt-1 font-semibold">&mdash; Dimas, seller keripik</span>
                </div>

                <div class="relative z-10">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white">Testimoni</span>
                </div>
              </div>

              <!-- 6. Promo -->
              <div class="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0e172a] to-[#080d19] aspect-[9/16] shadow-xl group border border-emerald-500/30 flex flex-col justify-between p-3 text-white text-center">
                <div class="relative z-10 pt-1">
                  <span class="text-xs font-black block leading-tight">Stop nebak harga.</span>
                  <span class="text-[8px] text-slate-400">Akses kalkulator seumur hidup</span>
                </div>

                <div class="relative z-10 my-auto space-y-1">
                  <div class="h-12 w-20 mx-auto rounded-lg bg-emerald-950/80 border border-emerald-500/40 p-1 flex items-center justify-center">
                    <span class="text-[10px] font-mono font-bold text-emerald-300">Rp79.000</span>
                  </div>
                  <div class="h-12 w-12 mx-auto rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs text-slate-950 shadow-lg shadow-emerald-500/30">
                    Rp79rb
                  </div>
                </div>

                <div class="relative z-10 space-y-1">
                  <span class="block w-full py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold">
                    Ambil Nexus
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 inline-block">Promo</span>
                </div>
              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 6. PRODUK 4 TAB (Deliverable Interactive Web-App) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'produk-app') {
          <section aria-labelledby="producttool-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  06 &bull; PRODUK DELIVERABLE TOOL
                </span>
                <h2 id="producttool-heading" class="text-3xl font-black tracking-tight mt-1">
                  Nexus: <span class="text-emerald-400">Kalkulator HPP & Harga Jual</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  Web-app interaktif yang diterima langsung oleh pembeli untuk ngitung margin jualan mereka.
                </p>
              </div>

              <div class="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  (click)="copyCalculationSummary()"
                  class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <mat-icon class="text-xs">content_copy</mat-icon>
                  <span>Salin Hasil</span>
                </button>
              </div>
            </div>

            <!-- Interactive App Simulator Card -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <!-- Input Panel -->
              <div class="lg:col-span-7 bg-[#111624] border border-white/10 rounded-3xl p-6 space-y-5">
                <div class="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 class="text-base font-bold text-white flex items-center gap-2">
                    <mat-icon class="text-emerald-400">calculate</mat-icon>
                    Parameter Modal & Potongan
                  </h3>
                  <span class="text-xs text-slate-400">Mata Uang: IDR (Rp)</span>
                </div>

                <!-- Input 1: Modal Bahan / Barang -->
                <div class="space-y-1.5">
                  <label for="input-modal" class="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>1. Modal Barang / Kulakan</span>
                    <span class="text-emerald-400 font-mono">Rp {{ productState.modalBarang().toLocaleString('id-ID') }}</span>
                  </label>
                  <input
                    id="input-modal"
                    type="number"
                    [value]="productState.modalBarang()"
                    (input)="updateModal($event)"
                    class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <!-- Input 2: Biaya Kemasan & Bubble Wrap -->
                <div class="space-y-1.5">
                  <label for="input-kemasan" class="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>2. Kemasan, Kardus & Bubble Wrap</span>
                    <span class="text-emerald-400 font-mono">Rp {{ productState.biayaKemasan().toLocaleString('id-ID') }}</span>
                  </label>
                  <input
                    id="input-kemasan"
                    type="number"
                    [value]="productState.biayaKemasan()"
                    (input)="updateKemasan($event)"
                    class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <!-- Input 3: Ongkir Subsidi Seller -->
                <div class="space-y-1.5">
                  <label for="input-ongkir" class="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>3. Ongkir Subsidi / Voucher Toko</span>
                    <span class="text-emerald-400 font-mono">Rp {{ productState.ongkirSubsidi().toLocaleString('id-ID') }}</span>
                  </label>
                  <input
                    id="input-ongkir"
                    type="number"
                    [value]="productState.ongkirSubsidi()"
                    (input)="updateOngkir($event)"
                    class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <!-- Input 4: Fee Marketplace Selection -->
                <div class="space-y-1.5">
                  <div class="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>4. Fee Marketplace / Admin Platform</span>
                    <span class="text-amber-400 font-mono">{{ productState.feeMarketplacePersen() }}%</span>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    @for (feeOpt of [{label: 'Shopee 8.5%', val: 8.5}, {label: 'TikTok 9%', val: 9.0}, {label: 'Tokopedia 7.5%', val: 7.5}, {label: 'Direct 3%', val: 3.0}]; track feeOpt.label) {
                      <button
                        type="button"
                        (click)="productState.feeMarketplacePersen.set(feeOpt.val)"
                        [class]="productState.feeMarketplacePersen() === feeOpt.val ? 'bg-amber-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
                        class="py-2 rounded-xl text-xs font-medium transition cursor-pointer"
                      >
                        {{ feeOpt.label }}
                      </button>
                    }
                  </div>
                </div>

                <!-- Input 5: Target Margin -->
                <div class="space-y-1.5">
                  <label for="input-margin-range" class="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>5. Target Margin Keuntungan Bersih</span>
                    <span class="text-emerald-400 font-mono font-bold">{{ productState.targetMarginPersen() }}%</span>
                  </label>
                  <input
                    id="input-margin-range"
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    [value]="productState.targetMarginPersen()"
                    (input)="updateMargin($event)"
                    class="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>10% (Tipis)</span>
                    <span>35% (Ideal)</span>
                    <span>60% (Premium)</span>
                  </div>
                </div>

              </div>

              <!-- Output Result Panel -->
              <div class="lg:col-span-5 bg-gradient-to-br from-[#121c2e] to-[#0c1322] border border-emerald-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      REKOMENDASI AI HARGA JUAL
                    </span>
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                      Margin Aman
                    </span>
                  </div>

                  <div class="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 text-center">
                    <div class="text-xs text-slate-400 font-medium">Jual di harga minimal:</div>
                    <div class="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 font-mono">
                      Rp {{ productState.hargaJualRekomendasi().toLocaleString('id-ID') }}
                    </div>
                    <div class="text-[11px] text-slate-400 mt-1">
                      (Sudah meng-cover modal, kemasan, ongkir & potongan fee)
                    </div>
                  </div>

                  <!-- Detailed breakdown -->
                  <div class="space-y-2 text-xs font-mono pt-2">
                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-slate-400">Total HPP Riil:</span>
                      <span class="text-white font-bold">Rp {{ productState.totalHpp().toLocaleString('id-ID') }}</span>
                    </div>

                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-slate-400">Potongan Fee Marketplace ({{ productState.feeMarketplacePersen() }}%):</span>
                      <span class="text-amber-400 font-bold">- Rp {{ productState.feeMarketplaceRp().toLocaleString('id-ID') }}</span>
                    </div>

                    <div class="flex justify-between py-1 border-b border-white/5">
                      <span class="text-slate-400">Untung Bersih per Pcs ({{ productState.targetMarginPersen() }}%):</span>
                      <span class="text-emerald-400 font-bold">+ Rp {{ productState.profitBersihPerPcs().toLocaleString('id-ID') }}</span>
                    </div>

                    <div class="flex justify-between py-1">
                      <span class="text-slate-400">Laku 100 pcs untung:</span>
                      <span class="text-cyan-400 font-bold">Rp {{ (productState.profitBersihPerPcs() * 100).toLocaleString('id-ID') }}</span>
                    </div>
                  </div>
                </div>

                <div class="pt-6">
                  <div class="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <mat-icon class="text-sm shrink-0">verified</mat-icon>
                    <span>Formula ini telah diuji di lebih dari 4.000 transaksi toko online.</span>
                  </div>
                </div>

              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 7. LANDING PAGE TAB (image_6d80f3a2.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'landing') {
          <section aria-labelledby="landing-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  07 &bull; LANDING PAGE
                </span>
                <h2 id="landing-heading" class="text-3xl font-black tracking-tight mt-1">
                  Landing page <span class="text-red-500">siap jualan.</span>
                </h2>
              </div>

              <!-- Top right actions -->
              <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30">
                  <mat-icon class="text-xs">public</mat-icon>
                  14 section &bull; siap jualan
                </span>

                <button
                  type="button"
                  (click)="copyLandingHtml()"
                  class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <mat-icon class="text-xs">content_copy</mat-icon>
                  Copy HTML
                </button>
              </div>
            </div>

            <!-- Viewport Switcher Pills (375, 768, 1100) matching image_6d80f3a2.png -->
            <div class="flex items-center gap-2">
              @for (vp of ['375', '768', '1100']; track vp) {
                <button
                  type="button"
                  (click)="setLandingViewport(vp)"
                  [class]="productState.landingViewport() === vp ? 'bg-red-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'"
                  class="px-3.5 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer"
                >
                  {{ vp }}
                </button>
              }
              <span class="text-xs text-slate-500 ml-2">Ukuran pratinjau responsif (pixel)</span>
            </div>

            <!-- Responsive Landing Page Frame Container -->
            <div class="flex justify-center bg-[#070a12] p-4 sm:p-8 rounded-3xl border border-white/10 overflow-x-auto min-h-[600px]">
              
              <div
                [style.width.px]="getViewportWidth()"
                class="bg-[#fcf9f2] text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-300 transition-all duration-300 text-left flex flex-col justify-between"
              >
                <!-- Landing Page Content -->
                <div class="p-6 sm:p-8 space-y-6">
                  
                  <!-- Sparkle Yellow Banner Box -->
                  <div class="p-4 rounded-2xl bg-[#fff8e7] border-l-4 border-amber-500 shadow-sm">
                    <p class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      ✨ Hitung HPP + ongkir + kemasan + fee marketplace &rarr; rekomendasi harga jual otomatis.
                    </p>
                  </div>

                  <!-- Headline Narrative -->
                  <div class="space-y-3">
                    <h3 class="text-lg sm:text-xl font-extrabold text-slate-950 leading-tight">
                      Bukan karena kamu nggak pinter jualan. Selama ini harga ditebak dari kompetitor. Malam ini kamu udah bisa tahu margin aslinya.
                    </h3>
                  </div>

                  <!-- 4 Feature Pills -->
                  <div class="flex flex-wrap gap-2 pt-1">
                    <span class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                      🧮 HPP 1 menit
                    </span>
                    <span class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                      📦 Ongkir & kemasan
                    </span>
                    <span class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                      🛒 Fee marketplace
                    </span>
                    <span class="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                      📱 Jalan di HP
                    </span>
                  </div>

                  <!-- High-Converting CTA Button -->
                  <div class="pt-4 space-y-2 text-center">
                    <button
                      type="button"
                      class="w-full py-4 rounded-2xl bg-[#10b981] hover:bg-emerald-600 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-emerald-500/25 transition transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      Ambil Nexus Rp79rb &rarr;
                    </button>
                    <p class="text-[11px] text-slate-500 font-medium">
                      Sekali bayar &bull; akses langsung masuk email
                    </p>
                  </div>

                  <!-- Additional sections inside landing -->
                  <div class="border-t border-slate-200 pt-6 space-y-4">
                    <h4 class="text-sm font-extrabold text-slate-900">Kenapa Harus Punya Nexus Sekarang?</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                      <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span class="font-bold block text-slate-900">⚡ Tanpa Instalasi Rumit</span>
                        Bisa langsung dibuka dari browser Google Chrome di HP maupun laptop.
                      </div>
                      <div class="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <span class="font-bold block text-slate-900">🛡️ Proteksi Boncos Iklan</span>
                        Tahu batas maksimal potongan diskon & promo sebelum budget habis.
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Footer of preview with "geser" indicator -->
                <div class="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span>&copy; Nexus Digital Tool</span>
                  <span class="flex items-center gap-1 font-mono font-bold text-slate-800">
                    &updownarrow; geser
                  </span>
                </div>

              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 8. VIDEOS 9 TAB (image_3343e528.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'videos') {
          <section aria-labelledby="videos-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  08 &bull; VIDEO ADS
                </span>
                <h2 id="videos-heading" class="text-3xl font-black tracking-tight mt-1">
                  Video iklan, <span class="text-red-500">tanpa syuting.</span>
                </h2>
              </div>

              <div class="shrink-0">
                <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30">
                  <mat-icon class="text-sm">videocam</mat-icon>
                  Nol kamera &bull; nol model
                </span>
              </div>
            </div>

            <!-- Two-Column Video Showcase matching image_3343e528.png -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              <!-- Left: Big Vertical Video Frame (9:16) -->
              <div class="lg:col-span-5 flex justify-center">
                <div class="relative w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden bg-slate-900 border-2 border-red-500/40 shadow-2xl flex flex-col justify-between p-4 group">
                  
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
                    alt="AI Video Avatar"
                    class="absolute inset-0 w-full h-full object-cover"
                    referrerpolicy="no-referrer"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40"></div>

                  <!-- Live Avatar Tag on Top -->
                  <div class="relative z-10 flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase flex items-center gap-1">
                      <span class="h-2 w-2 rounded-full bg-white animate-ping"></span>
                      AI AVATAR
                    </span>
                    <span class="h-2 w-2 rounded-full bg-red-500"></span>
                  </div>

                  <!-- Player Overlay Controls -->
                  <div class="relative z-10 space-y-2 text-center">
                    <button
                      type="button"
                      (click)="toggleVideoPlay()"
                      class="h-14 w-14 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/40 transition transform hover:scale-110 cursor-pointer"
                    >
                      <mat-icon class="text-3xl">{{ isPlayingVideo() ? 'pause' : 'play_arrow' }}</mat-icon>
                    </button>
                    
                    <div class="text-xs text-white font-medium drop-shadow">
                      {{ isPlayingVideo() ? 'Sedang Memutar Simulasi Video...' : 'Klik untuk Memutar AI Avatar' }}
                    </div>

                    <!-- Progress bar -->
                    <div class="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div class="h-full bg-red-500 transition-all duration-300" [style.width.%]="videoProgress()"></div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Right: Scene Synchronization & Avatar Variations Grid -->
              <div class="lg:col-span-7 space-y-6">
                
                <!-- 3 Synchronized Scenes -->
                <div class="space-y-3">
                  <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <span class="font-mono text-[11px] font-bold text-red-500 uppercase">SCENE 1 &bull; HOOK</span>
                      <p class="text-xs sm:text-sm text-slate-200 font-medium">
                        Avatar ngomong ke kamera, hook kena di 3 detik pertama.
                      </p>
                    </div>
                    <span class="text-emerald-400"><mat-icon class="text-sm">check</mat-icon></span>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <span class="font-mono text-[11px] font-bold text-red-500 uppercase">SCENE 2 &bull; MEKANISME</span>
                      <p class="text-xs sm:text-sm text-slate-200 font-medium">
                        B-roll HP + kalkulator, avatar jelasin cara kerjanya.
                      </p>
                    </div>
                    <span class="text-emerald-400"><mat-icon class="text-sm">check</mat-icon></span>
                  </div>

                  <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <span class="font-mono text-[11px] font-bold text-red-500 uppercase">SCENE 3 &bull; CTA</span>
                      <p class="text-xs sm:text-sm text-slate-200 font-medium">
                        Avatar ajak klik link, caption CTA muncul.
                      </p>
                    </div>
                    <span class="text-emerald-400"><mat-icon class="text-sm">check</mat-icon></span>
                  </div>
                </div>

                <!-- VARIASI LAIN · AVATAR BEDA (6 Avatars) -->
                <div class="space-y-3">
                  <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                    VARIASI LAIN &bull; AVATAR BEDA
                  </div>

                  <div class="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    @for (avatar of productState.avatarList().slice(1); track avatar.id) {
                      <button
                        type="button"
                        (click)="productState.selectAvatar(avatar.id)"
                        [class]="productState.selectedAvatarId() === avatar.id ? 'border-2 border-red-500 scale-102' : 'border border-white/10 hover:border-white/30'"
                        class="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-800 cursor-pointer transition shadow-md group flex flex-col justify-end p-2 text-left focus:outline-none w-full"
                      >
                        <img
                          [src]="avatar.avatarImage"
                          [alt]="avatar.name"
                          class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          referrerpolicy="no-referrer"
                        />
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        
                        <div class="relative z-10 flex items-center justify-center my-auto">
                          <div class="h-7 w-7 rounded-full bg-white/30 backdrop-blur flex items-center justify-center text-white">
                            <mat-icon class="text-xs">play_arrow</mat-icon>
                          </div>
                        </div>

                        <span class="relative z-10 text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/60 text-center truncate w-full block">
                          {{ avatar.tag }}
                        </span>
                      </button>
                    }
                  </div>
                </div>

              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 9. SCALE TAB (image_67f82eff.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'scale') {
          <section aria-labelledby="scale-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  09 &bull; SCALE
                </span>
                <h2 id="scale-heading" class="text-3xl font-black tracking-tight mt-1">
                  Udah laku? <span class="text-red-500">Bikin lebih banyak.</span>
                </h2>
              </div>

              <div class="shrink-0">
                <button
                  type="button"
                  (click)="productState.generateScaleAssets()"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/30 cursor-pointer"
                >
                  <mat-icon class="text-sm">trending_up</mat-icon>
                  +12 aset baru
                </button>
              </div>
            </div>

            <!-- Toast notification if generated -->
            @if (productState.scaleNotification()) {
              <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-bounce-short">
                <mat-icon class="text-sm">check_circle</mat-icon>
                <span>{{ productState.scaleNotification() }}</span>
              </div>
            }

            <!-- Winning Ad Highlight Green Card matching image_67f82eff.png -->
            <div class="p-5 rounded-2xl bg-[#0e2a1d] border border-emerald-500/30 flex items-start sm:items-center gap-4 shadow-xl">
              <div class="h-12 w-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                <mat-icon class="text-2xl">emoji_events</mat-icon>
              </div>

              <div class="space-y-1">
                <h3 class="text-base font-bold text-white">
                  Iklan "Modal 20rb kok rugi?" paling banyak klik
                </h3>
                <p class="text-xs text-slate-300">
                  CTR <strong class="text-emerald-400 font-bold">3,8%</strong> &bull; gandain angle-nya, sisanya biar AI yang bikin.
                </p>
              </div>
            </div>

            <!-- 4 Action Cards with green badges matching image_67f82eff.png -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              <!-- 1. Image Ads -->
              <div class="p-5 rounded-2xl bg-[#111624] border border-white/5 space-y-4 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-red-500">
                    <mat-icon class="text-sm">photo_library</mat-icon>
                    <span class="text-xs font-bold text-white">Image ads</span>
                  </div>
                  <p class="text-xs text-slate-400">angle baru &bull; 3 ads</p>
                </div>

                <button
                  type="button"
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <mat-icon class="text-xs">check</mat-icon>
                  <span>3 baru</span>
                </button>
              </div>

              <!-- 2. Video -->
              <div class="p-5 rounded-2xl bg-[#111624] border border-white/5 space-y-4 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-red-500">
                    <mat-icon class="text-sm">smart_display</mat-icon>
                    <span class="text-xs font-bold text-white">Video</span>
                  </div>
                  <p class="text-xs text-slate-400">avatar & style baru</p>
                </div>

                <button
                  type="button"
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <mat-icon class="text-xs">check</mat-icon>
                  <span>6 scene</span>
                </button>
              </div>

              <!-- 3. Script -->
              <div class="p-5 rounded-2xl bg-[#111624] border border-white/5 space-y-4 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-red-500">
                    <mat-icon class="text-sm">edit_note</mat-icon>
                    <span class="text-xs font-bold text-white">Script</span>
                  </div>
                  <p class="text-xs text-slate-400">hook turunan</p>
                </div>

                <button
                  type="button"
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <mat-icon class="text-xs">check</mat-icon>
                  <span>3 script</span>
                </button>
              </div>

              <!-- 4. A/B Landing -->
              <div class="p-5 rounded-2xl bg-[#111624] border border-white/5 space-y-4 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 text-red-500">
                    <mat-icon class="text-sm">compare_arrows</mat-icon>
                    <span class="text-xs font-bold text-white">A/B Landing</span>
                  </div>
                  <p class="text-xs text-slate-400">variant B</p>
                </div>

                <button
                  type="button"
                  class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <mat-icon class="text-xs">check</mat-icon>
                  <span>LP B jadi</span>
                </button>
              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 10. TOOL BUILDER TAB (image_91b7737f.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'tool-builder') {
          <section aria-labelledby="toolbuilder-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  10 &bull; TOOL BUILDER
                </span>
                <h2 id="toolbuilder-heading" class="text-3xl font-black tracking-tight mt-1">
                  Jual web-app, <span class="text-red-500">tanpa ngoding.</span>
                </h2>
              </div>

              <div class="shrink-0">
                <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30">
                  <mat-icon class="text-sm">rocket_launch</mat-icon>
                  Live dalam 20 detik
                </span>
              </div>
            </div>

            <!-- 3-Column Layout matching image_91b7737f.png -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              
              <!-- Column 1: 1 · PILIH TOOL -->
              <div class="md:col-span-3 space-y-3">
                <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  1 &bull; PILIH TOOL
                </div>

                <div class="space-y-2">
                  <button
                    type="button"
                    (click)="productState.selectedToolType.set('hpp')"
                    [class]="productState.selectedToolType() === 'hpp' ? 'border-red-500 bg-red-950/20 text-white' : 'border-white/5 bg-[#111624] text-slate-300 hover:border-white/20'"
                    class="w-full p-4 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">🧮</span>
                      <span class="text-xs font-bold">Kalkulator HPP</span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono">tanpa AI</span>
                  </button>

                  <button
                    type="button"
                    (click)="productState.selectedToolType.set('invoice')"
                    [class]="productState.selectedToolType() === 'invoice' ? 'border-red-500 bg-red-950/20 text-white' : 'border-white/5 bg-[#111624] text-slate-300 hover:border-white/20'"
                    class="w-full p-4 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">📄</span>
                      <span class="text-xs font-bold">Invoice kilat</span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono">tanpa AI</span>
                  </button>

                  <button
                    type="button"
                    (click)="productState.selectedToolType.set('kpr')"
                    [class]="productState.selectedToolType() === 'kpr' ? 'border-red-500 bg-red-950/20 text-white' : 'border-white/5 bg-[#111624] text-slate-300 hover:border-white/20'"
                    class="w-full p-4 rounded-2xl border flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="text-base">🏠</span>
                      <span class="text-xs font-bold">Kalkulator KPR</span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono">tanpa AI</span>
                  </button>
                </div>
              </div>

              <!-- Column 2: 2 · REBRAND -->
              <div class="md:col-span-4 space-y-4">
                <div class="text-[11px] font-mono tracking-wider text-slate-400 uppercase">
                  2 &bull; REBRAND
                </div>

                <div class="relative">
                  <input
                    type="text"
                    [value]="productState.toolName()"
                    (input)="updateToolName($event)"
                    class="w-full bg-[#111624] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:border-red-500"
                  />
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
                    <mat-icon class="text-base">check</mat-icon>
                  </div>
                </div>

                <!-- 4 Theme colors (emerald, blue, red, amber) -->
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="productState.selectedThemeColor.set('emerald')"
                    [class]="productState.selectedThemeColor() === 'emerald' ? 'ring-2 ring-white scale-110' : ''"
                    class="h-9 w-9 rounded-xl bg-emerald-500 transition cursor-pointer"
                    aria-label="Pilih tema emerald"
                  >
                    <span class="sr-only">Tema Emerald</span>
                  </button>
                  <button
                    type="button"
                    (click)="productState.selectedThemeColor.set('blue')"
                    [class]="productState.selectedThemeColor() === 'blue' ? 'ring-2 ring-white scale-110' : ''"
                    class="h-9 w-9 rounded-xl bg-blue-500 transition cursor-pointer"
                    aria-label="Pilih tema blue"
                  >
                    <span class="sr-only">Tema Blue</span>
                  </button>
                  <button
                    type="button"
                    (click)="productState.selectedThemeColor.set('red')"
                    [class]="productState.selectedThemeColor() === 'red' ? 'ring-2 ring-white scale-110' : ''"
                    class="h-9 w-9 rounded-xl bg-red-500 transition cursor-pointer"
                    aria-label="Pilih tema red"
                  >
                    <span class="sr-only">Tema Red</span>
                  </button>
                  <button
                    type="button"
                    (click)="productState.selectedThemeColor.set('amber')"
                    [class]="productState.selectedThemeColor() === 'amber' ? 'ring-2 ring-white scale-110' : ''"
                    class="h-9 w-9 rounded-xl bg-amber-500 transition cursor-pointer"
                    aria-label="Pilih tema amber"
                  >
                    <span class="sr-only">Tema Amber</span>
                  </button>
                </div>

                <button
                  type="button"
                  (click)="productState.deployToVercel()"
                  [disabled]="productState.isVercelDeploying()"
                  class="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  <mat-icon [class.animate-spin]="productState.isVercelDeploying()" class="text-base">
                    {{ productState.isVercelDeploying() ? 'refresh' : 'rocket_launch' }}
                  </mat-icon>
                  <span>{{ productState.isVercelDeploying() ? 'Deploying...' : 'Online-in ke Vercel' }}</span>
                </button>
              </div>

              <!-- Column 3: Live Preview & Status -->
              <div class="md:col-span-5 space-y-3">
                <div class="rounded-3xl bg-white text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
                  <div class="px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-mono text-slate-500 flex items-center gap-1.5">
                    <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>nexus.vercel.app</span>
                  </div>

                  <div class="p-6 space-y-4">
                    <div class="flex items-center gap-2">
                      <span class="text-xl">🧮</span>
                      <h4 class="text-base font-black text-red-600">{{ productState.toolName() }}</h4>
                    </div>

                    <div class="space-y-2 text-xs">
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-600">Modal / pcs</span>
                        <span class="font-bold font-mono">Rp17.000</span>
                      </div>
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-600">Target margin</span>
                        <span class="font-bold font-mono">35%</span>
                      </div>
                      <div class="flex justify-between py-1 border-b border-slate-100">
                        <span class="text-slate-600">Fee marketplace</span>
                        <span class="font-bold font-mono">8%</span>
                      </div>
                    </div>

                    <div class="p-4 rounded-2xl bg-red-50 text-center">
                      <div class="text-[11px] text-slate-500">Harga jual aman</div>
                      <div class="text-2xl font-black text-red-600 font-mono">Rp26.154</div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Status Badges matching image_91b7737f.png -->
                <div class="space-y-2">
                  <div class="p-3 rounded-2xl bg-[#111624] border border-white/5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 text-slate-300">
                      <mat-icon class="text-cyan-400 text-base">public</mat-icon>
                      <span>Online di Vercel kamu</span>
                    </div>
                    <span class="font-bold text-emerald-400 font-mono">LIVE</span>
                  </div>

                  <div class="p-3 rounded-2xl bg-[#111624] border border-white/5 flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 text-slate-300">
                      <mat-icon class="text-amber-400 text-base">lock</mat-icon>
                      <span>Kode akses pembeli</span>
                    </div>
                    <span class="font-bold text-emerald-400 font-mono">AKTIF</span>
                  </div>
                </div>

              </div>

            </div>
          </section>
        }

        <!-- ========================================== -->
        <!-- 11. LD ACADEMY TAB (image_4c959415.png) -->
        <!-- ========================================== -->
        @if (productState.activeSubTab() === 'ld-academy') {
          <section aria-labelledby="academy-heading" class="space-y-6 animate-fadeIn">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span class="font-mono text-xs font-bold text-red-500 uppercase tracking-widest">
                  11 &bull; LD ACADEMY
                </span>
                <h2 id="academy-heading" class="text-3xl font-black tracking-tight mt-1">
                  Diajarin dari nol, <span class="text-red-500">nggak dilepas.</span>
                </h2>
                <p class="text-sm text-slate-400 mt-1">
                  3 modul &bull; 25 materi &bull; 24 video. Tiap materi ada catatan + checklist.
                </p>
              </div>

              <div class="shrink-0">
                <span class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-extrabold shadow-lg shadow-red-600/30">
                  <mat-icon class="text-sm">school</mat-icon>
                  24 video &bull; 6,8 jam
                </span>
              </div>
            </div>

            <!-- Video Cards Grid matching image_4c959415.png -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              @for (lesson of productState.academyLessons(); track lesson.id) {
                <button
                  type="button"
                  (click)="playLesson(lesson)"
                  class="rounded-2xl bg-[#111624] border border-white/5 hover:border-red-500/50 transition cursor-pointer p-3 space-y-2 flex flex-col justify-between group relative overflow-hidden text-left w-full focus:outline-none"
                >
                  <div class="h-20 bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5">
                    <div class="h-8 w-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <mat-icon class="text-sm">play_arrow</mat-icon>
                    </div>
                  </div>

                  <div>
                    <h4 class="text-xs font-bold text-white line-clamp-2 leading-snug">{{ lesson.title }}</h4>
                    <p class="text-[10px] text-slate-400 line-clamp-2 mt-1">{{ lesson.tagline }}</p>
                  </div>

                  <div class="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-white/5">
                    <span>{{ lesson.duration }}</span>
                    @if (lesson.isCompleted) {
                      <span class="text-emerald-400 font-bold">Selesai</span>
                    }
                  </div>
                </button>
              }
            </div>

            <!-- Bottom: Module Progress Bars + Chat Support -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              <!-- Bottom Left: Module Progress Bars -->
              <div class="lg:col-span-5 space-y-3">
                
                <!-- Module 1: Fondasi -->
                <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="h-8 w-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                        <mat-icon class="text-sm">flag</mat-icon>
                      </div>
                      <div>
                        <h4 class="text-xs font-bold text-white">Fondasi</h4>
                        <span class="text-[10px] text-slate-400">4 video &bull; selesai</span>
                      </div>
                    </div>
                    <span class="text-xs font-mono font-bold text-emerald-400">100%</span>
                  </div>

                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full w-full"></div>
                  </div>
                </div>

                <!-- Module 2: Produk -->
                <div class="p-4 rounded-2xl bg-[#111624] border border-white/5 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <div class="h-8 w-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                        <mat-icon class="text-sm">inventory</mat-icon>
                      </div>
                      <div>
                        <h4 class="text-xs font-bold text-white">Produk</h4>
                        <span class="text-[10px] text-slate-400">8 video &bull; lagi ditonton</span>
                      </div>
                    </div>
                    <span class="text-xs font-mono font-bold text-amber-400">50%</span>
                  </div>

                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full w-1/2"></div>
                  </div>
                </div>

              </div>

              <!-- Bottom Right: Interactive AI Mentor & Admin Chat Box matching image_4c959415.png -->
              <div class="lg:col-span-7 bg-[#111624] border border-white/10 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                
                <div class="space-y-3 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                  
                  @for (msg of productState.academyChatHistory(); track msg.message) {
                    @if (msg.sender === 'user') {
                      <div class="flex justify-end">
                        <div class="px-4 py-2 rounded-2xl bg-red-600 text-white text-xs font-medium max-w-sm shadow">
                          {{ msg.message }}
                        </div>
                      </div>
                    } @else if (msg.sender === 'mentor') {
                      <div class="flex justify-start">
                        <div class="px-4 py-2.5 rounded-2xl bg-slate-900 border border-white/10 text-xs text-slate-200 max-w-md shadow leading-relaxed">
                          <strong class="text-amber-400 font-bold block mb-0.5">AI Mentor:</strong>
                          {{ msg.message.replace('AI Mentor: ', '') }}
                        </div>
                      </div>
                    } @else if (msg.sender === 'admin') {
                      <div class="flex justify-start">
                        <div class="px-4 py-2.5 rounded-2xl bg-slate-900 border border-emerald-500/20 text-xs text-slate-200 max-w-md shadow leading-relaxed">
                          <strong class="text-emerald-400 font-bold block mb-0.5">Admin:</strong>
                          {{ msg.message.replace('Admin: ', '') }}
                        </div>
                      </div>
                    }
                  }

                </div>

                <!-- Chat Input Form -->
                <div class="pt-3 border-t border-white/5 flex gap-2">
                  <input
                    #academyInput
                    type="text"
                    placeholder="Tanya AI Mentor atau Admin (contoh: cara pasang pixel Meta)..."
                    (keyup.enter)="askMentor(academyInput)"
                    class="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    (click)="askMentor(academyInput)"
                    class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <mat-icon class="text-xs">send</mat-icon>
                    <span>Kirim</span>
                  </button>
                </div>

              </div>

            </div>
          </section>
        }

      </main>

    </div>
  `,
  styles: [`
    .scrollbar-none::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-none {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .animate-fadeIn {
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ProdukView {
  readonly productState = inject(ProductState);
  readonly notification = inject(NotificationState);

  readonly copiedColor = signal<string | null>(null);
  readonly isPlayingVideo = signal<boolean>(false);
  readonly videoProgress = signal<number>(25);
  readonly expandedConceptId = signal<string>('nexus');

  updateNicheInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.productState.nicheIdeaInput.set(val);
  }

  toggleConceptDetails(id: string) {
    this.expandedConceptId.update((current) => (current === id ? '' : id));
  }

  selectDemandConcept(concept: ConceptItem) {
    this.productState.selectConcept(concept);
    this.productState.nicheIdeaInput.set(concept.name);
    this.expandedConceptId.set(concept.id);
    this.notification.sendPush('Konsep Dipilih', `"${concept.name}" dipilih sebagai fokus produk utama.`);
  }

  proceedToBrand(concept: ConceptItem) {
    this.productState.selectConcept(concept);
    this.productState.nicheIdeaInput.set(concept.name);
    this.productState.setSubTab('brand');
    this.notification.sendPush('Beralih ke Brand', `Membuat identitas visual & palet untuk "${concept.name}".`);
  }

  copyResearchReport() {
    const query = this.productState.nicheIdeaInput();
    const count = this.productState.scannedPostCount();
    const concepts = this.productState
      .demandConcepts()
      .map(
        (c, i) =>
          `[0${i + 1}] ${c.name}\n- Skor Demand: ${c.demandScore}/100\n- Estimasi Harga: ${c.price}\n- Volume Pencarian: ${c.searchVolume ?? '38.400 pencarian/bln'}\n- Momentum: ${c.trendMomentum ?? '+34% MoM'}\n- Kompetisi: ${c.competitionLevel ?? 'Rendah'}\n- Margin Potensial: ${c.potentialMargin ?? '45% - 65%'}\n- Hook: ${c.suggestedHook ?? 'N/A'}`
      )
      .join('\n\n');
    const text = `LAPORAN RISET & VALIDASI PASAR - NEXUS AI\nKata Kunci: "${query}"\nPostingan Dianalisis: ${count.toLocaleString('id-ID')} data points\nSumber: ${this.productState.selectedSources().join(', ')}\n\n--- 5 KONSEP DEMAND TERTINGGI ---\n${concepts}`;
    navigator.clipboard?.writeText(text);
    this.notification.sendPush('Laporan Riset Disalin', 'Laporan 5 konsep & metrik validasi pasar berhasil disalin ke clipboard.');
  }

  copySingleConcept(concept: ConceptItem) {
    const text = `KONSEP: ${concept.name}\nSkor Demand: ${concept.demandScore}/100\nTarget Harga: ${concept.price}\nPencarian/Bulan: ${concept.searchVolume ?? '48.200'}\nMomentum: ${concept.trendMomentum ?? '+42%'}\nKompetisi: ${concept.competitionLevel ?? 'Rendah'}\nMargin: ${concept.potentialMargin ?? '45-65%'}\nTarget Pasar: ${concept.targetAudience ?? 'Seller online'}\nAlasan Trending: ${concept.whyTrending ?? ''}\nHook Iklan: ${concept.suggestedHook ?? ''}`;
    navigator.clipboard?.writeText(text);
    this.notification.sendPush('Data Konsep Disalin', `Data validasi metrik "${concept.name}" disalin.`);
  }

  regenerateLogoOptions() {
    this.productState.selectLogo(1);
  }

  copyColorHex(hex: string, name: string) {
    navigator.clipboard?.writeText(hex);
    this.copiedColor.set(`${name} (${hex})`);
    this.notification.sendPush('Warna Disalin', `Kode hex ${hex} (${name}) berhasil disalin.`);
    setTimeout(() => this.copiedColor.set(null), 2500);
  }

  copyAllScripts() {
    const scripts = this.productState
      .scriptAngles()
      .map(
        (a) =>
          `[${a.name}]\nCaption: ${a.caption}\n` +
          a.scenes.map((s) => `${s.number}: ${s.content}`).join('\n')
      )
      .join('\n\n');
    navigator.clipboard?.writeText(scripts);
    this.notification.sendPush('Naskah Disalin', 'Semua 5 naskah iklan & caption Meta berhasil disalin ke clipboard.');
  }

  copyCurrentScript() {
    const s = this.productState.activeScript();
    const text = `Angle: ${s.name}\nCaption: ${s.caption}\n${s.scenes.map((sc) => `${sc.number}: ${sc.content}`).join('\n')}`;
    navigator.clipboard?.writeText(text);
    this.notification.sendPush('Naskah Disalin', `Naskah untuk angle "${s.name}" berhasil disalin.`);
  }

  downloadAllAds() {
    this.notification.sendPush('Unduh Aset Iklan', 'Paket 6 Gambar Iklan siap pasang sedang diekspor (format PNG 1080x1080 & 1080x1920).');
  }

  copyCalculationSummary() {
    const summary = `Hasil Perhitungan Nexus:\n- Modal Bahan: Rp ${this.productState.modalBarang().toLocaleString('id-ID')}\n- Kemasan: Rp ${this.productState.biayaKemasan().toLocaleString('id-ID')}\n- Ongkir: Rp ${this.productState.ongkirSubsidi().toLocaleString('id-ID')}\n- Fee Marketplace: ${this.productState.feeMarketplacePersen()}%\n- Target Margin: ${this.productState.targetMarginPersen()}%\n=> Rekomendasi Harga Jual: Rp ${this.productState.hargaJualRekomendasi().toLocaleString('id-ID')}\n=> Untung Bersih: Rp ${this.productState.profitBersihPerPcs().toLocaleString('id-ID')} / pcs`;
    navigator.clipboard?.writeText(summary);
    this.notification.sendPush('Hasil Disalin', 'Ringkasan rekomendasi harga jual Nexus disalin.');
  }

  copyLandingHtml() {
    navigator.clipboard?.writeText('<!-- Landing Page Nexus HTML Standalone -->\n<div class="landing-page">...</div>');
    this.notification.sendPush('HTML Disalin', 'Kode HTML 14 Section Landing Page berhasil disalin.');
  }

  setLandingViewport(vp: string) {
    if (vp === '375' || vp === '768' || vp === '1100') {
      this.productState.setViewport(vp);
    }
  }

  getViewportWidth(): number {
    const vp = this.productState.landingViewport();
    if (vp === '375') return 375;
    if (vp === '768') return 720;
    return 1000;
  }

  toggleVideoPlay() {
    this.isPlayingVideo.update((v) => !v);
    if (this.isPlayingVideo()) {
      const interval = setInterval(() => {
        if (!this.isPlayingVideo()) {
          clearInterval(interval);
          return;
        }
        this.videoProgress.update((p) => {
          if (p >= 100) {
            this.isPlayingVideo.set(false);
            clearInterval(interval);
            return 0;
          }
          return p + 5;
        });
      }, 300);
    }
  }

  playLesson(lesson: AcademyLesson) {
    this.productState.activeLesson.set(lesson);
  }

  askMentor(input: HTMLInputElement) {
    if (!input.value.trim()) return;
    this.productState.sendAcademyQuestion(input.value);
    input.value = '';
  }

  updateModal(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) || 0;
    this.productState.modalBarang.set(val);
  }

  updateKemasan(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) || 0;
    this.productState.biayaKemasan.set(val);
  }

  updateOngkir(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) || 0;
    this.productState.ongkirSubsidi.set(val);
  }

  updateMargin(e: Event) {
    const val = Number((e.target as HTMLInputElement).value) || 35;
    this.productState.targetMarginPersen.set(val);
  }

  updateToolName(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    this.productState.toolName.set(val);
  }

  synthesizeAllConceptsIntoMaster() {
    this.productState.synthesizeAllConceptsIntoMaster();
  }

  applyMasterBlueprintToSuite() {
    this.productState.applyMasterBlueprintToSuite();
  }

  copyMasterBlueprint() {
    const mb = this.productState.masterBlueprint();
    if (!mb) return;
    const text = `=== MASTER PRODUCT BLUEPRINT (NEXUS AI CONVERGENCE) ===
Nama Solusi: ${mb.masterTitle}
Tagline: ${mb.tagline}
Skor Komposit AI: ${mb.compositeScore}/100
Harga Bundel: ${mb.bundlePrice}
Potensi Pasar: ${mb.totalMarketReach}

[OFFER / USP PENAWARAN TERPADU]
"${mb.synthesizedUsp}"

[3 PILAR SINERGI UTAMA]
${mb.corePillars.map((p: string, idx: number) => `${idx + 1}. ${p}`).join('\n')}

[FITUR TERPADU SIAP RILIS]
${mb.suggestedFeatures.map((f: string) => `- ${f}`).join('\n')}

[HOOK IKLAN MASTER]
${mb.masterHook}

[ANALISIS KEUNGGULAN GABUNGAN]
${mb.synergyExplanation}`;

    navigator.clipboard?.writeText(text);
    this.notification.sendPush('Master Blueprint Disalin', `Blueprint "${mb.masterTitle}" berhasil disalin ke clipboard.`);
  }
}
