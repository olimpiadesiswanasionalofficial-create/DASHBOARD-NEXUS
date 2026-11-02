import { Injectable, signal, computed } from '@angular/core';

export interface MasterConceptBlueprint {
  masterTitle: string;
  tagline: string;
  compositeScore: number;
  bundlePrice: string;
  totalMarketReach: string;
  corePillars: string[];
  synthesizedUsp: string;
  synergyExplanation: string;
  masterHook: string;
  suggestedFeatures: string[];
}

export interface ConceptItem {
  id: string;
  name: string;
  tagline: string;
  type: string;
  price: string;
  demandScore: number;
  highlight?: boolean;
  searchVolume?: string;
  trendMomentum?: string;
  competitionLevel?: 'Rendah' | 'Sedang' | 'Tinggi';
  potentialMargin?: string;
  targetAudience?: string;
  whyTrending?: string;
  suggestedHook?: string;
}

export interface ScriptScene {
  number: string;
  label: string;
  content: string;
}

export interface ScriptAngle {
  id: string;
  name: string;
  caption: string;
  adImage: string;
  scenes: ScriptScene[];
}

export interface ImageAdItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeBg: string;
  imageUrl?: string;
  highlightText?: string;
  features?: string[];
}

export interface VideoAvatarItem {
  id: string;
  name: string;
  tag: string;
  avatarImage: string;
  duration: string;
  hook: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  tagline: string;
  videoUrl?: string;
  isCompleted?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductState {
  // Navigation
  readonly activeSidebar = signal<string>('produk');
  readonly activeSubTab = signal<string>('research');
  readonly isDarkMode = signal<boolean>(true);

  // Sub-tabs list
  readonly subTabs = [
    { id: 'research', label: 'Research', badge: '' },
    { id: 'overview', label: 'Overview', badge: '6/6' },
    { id: 'brand', label: 'Brand', badge: '' },
    { id: 'scripts', label: 'Scripts', badge: '5' },
    { id: 'image-ads', label: 'Image Ads', badge: '6' },
    { id: 'produk-app', label: 'Produk', badge: '4' },
    { id: 'landing', label: 'Landing', badge: '' },
    { id: 'videos', label: 'Videos', badge: '9' },
    { id: 'scale', label: 'Scale', badge: '' },
    { id: 'tool-builder', label: 'Tool Builder', badge: 'NEW' },
    { id: 'ld-academy', label: 'LD Academy', badge: 'NEW' },
  ];

  // 1. Research tab state
  readonly nicheIdeaInput = signal<string>('kalkulator harga jual buat seller online');
  readonly selectedSources = signal<string[]>(['Threads', 'Reddit', 'TikTok', 'Ad Library']);
  readonly scannedPostCount = signal<number>(2847);
  readonly isScanning = signal<boolean>(false);
  readonly isSynthesizingMaster = signal<boolean>(false);
  readonly scanProgress = signal<number>(65);
  readonly scanStatusMessage = signal<string>('Maya lagi nyisir 2847 postingan...');
  readonly selectedConceptDetails = signal<ConceptItem | null>(null);
  readonly masterBlueprint = signal<MasterConceptBlueprint | null>(null);
  readonly activeAiEngine = signal<'gemini-3.8-flash' | 'nexus-heuristic'>('gemini-3.8-flash');
  readonly isAiOnline = signal<boolean>(true);

  // Preset search templates for quick exploration
  readonly presetNiches = [
    { label: 'Kalkulator Seller Online', query: 'kalkulator harga jual buat seller online' },
    { label: 'SOP & Template F&B', query: 'template SOP operasional bisnis kuliner & resto' },
    { label: 'Notion Tracker Keuangan', query: 'notion tracker cashflow toko & freelancer' },
    { label: 'Script Ads TikTok Affiliate', query: 'generator naskah iklan video tiktok affiliate' },
    { label: 'Auto Rekap Pesanan WA', query: 'bot rekap order whatsapp otomatis tanpa aplikasi' },
  ];

  readonly demandConcepts = signal<ConceptItem[]>([
    {
      id: 'nexus',
      name: 'Nexus · kalkulator HPP & harga jual',
      tagline: 'web-app tool • dipakai tiap mau jualan • Rp79rb',
      type: 'web-app tool',
      price: 'Rp79rb',
      demandScore: 94,
      highlight: true,
      searchVolume: '48.200 pencarian/bln',
      trendMomentum: '+42% MoM (Sangat Kuat)',
      competitionLevel: 'Rendah',
      potentialMargin: '45% - 65%',
      targetAudience: 'Seller Shopee, TikTok Shop, Tokopedia & Reseller',
      whyTrending: 'Banyak seller komplain boncos akibat kenaikan fee admin marketplace dari 6% ke 8.5% tanpa sadar.',
      suggestedHook: '"Modal 20 ribu, dijual 25 ribu. Laku 100 pcs, kok saldo malah minus?"',
    },
    {
      id: 'marginmarket',
      name: 'MarginMarket · cek fee marketplace',
      tagline: 'tool • Shopee/TikTok Shop',
      type: 'tool',
      price: 'Rp69rb',
      demandScore: 86,
      searchVolume: '27.400 pencarian/bln',
      trendMomentum: '+28% MoM',
      competitionLevel: 'Sedang',
      potentialMargin: '40% - 55%',
      targetAudience: 'Merchant marketplace multi-channel',
      whyTrending: 'Penjual bingung simulasi perbandingan potongan fee antar platform.',
      suggestedHook: '"Cek fee Shopee vs TikTok Shop sebelum pasang harga flash sale!"',
    },
    {
      id: 'invoicekilat',
      name: 'InvoiceKilat · bikin invoice 30 detik',
      tagline: 'tool • tanpa daftar akun',
      type: 'tool',
      price: 'Rp49rb',
      demandScore: 79,
      searchVolume: '19.800 pencarian/bln',
      trendMomentum: '+15% MoM',
      competitionLevel: 'Sedang',
      potentialMargin: '50% - 70%',
      targetAudience: 'Freelancer, Vendor wedding & UMKM jasa',
      whyTrending: 'Aplikasi invoice lain terlalu rumit harus sign up dan berlangganan bulanan mahal.',
      suggestedHook: '"Bikin invoice PDF profesional langsung kirim ke WA klien dalam 30 detik."',
    },
    {
      id: 'kalkulatorkpr',
      name: 'Kalkulator KPR & Simulasi DP',
      tagline: 'tool • closing rate agen properti',
      type: 'tool',
      price: 'Rp99rb',
      demandScore: 74,
      searchVolume: '14.500 pencarian/bln',
      trendMomentum: '+19% MoM',
      competitionLevel: 'Rendah',
      potentialMargin: '60% - 80%',
      targetAudience: 'Agen properti independen & calon pembeli rumah pertama',
      whyTrending: 'Suku bunga floating BI berfluktuasi, calon pembeli butuh simulasi cicilan akurat.',
      suggestedHook: '"Closing pembeli rumah 2x lebih cepat dengan simulasi cicilan instan di depan klien."',
    },
    {
      id: 'rekaporder',
      name: 'Rekap Order WA Otomatis',
      tagline: 'tool • template pesanan cepat',
      type: 'tool',
      price: 'Rp59rb',
      demandScore: 71,
      searchVolume: '12.300 pencarian/bln',
      trendMomentum: '+11% MoM',
      competitionLevel: 'Sedang',
      potentialMargin: '35% - 50%',
      targetAudience: 'Admin olshop chat WhatsApp',
      whyTrending: 'Stres copas format alamat dan hitung ongkir manual pas promo tanggal kembar.',
      suggestedHook: '"Ubah chat pesanan berantakan jadi format resi siap cetak sekali tap."',
    },
  ]);

  // 2. Brand tab state
  readonly selectedLogoId = signal<number>(1);
  readonly brandColors = signal<{ name: string; hex: string; bgClass: string; textClass: string }[]>([
    { name: 'navy', hex: '#0a0f1d', bgClass: 'bg-[#0a0f1d]', textClass: 'text-slate-300' },
    { name: 'emerald', hex: '#10b981', bgClass: 'bg-[#10b981]', textClass: 'text-white' },
    { name: 'cream', hex: '#fbf7ee', bgClass: 'bg-[#fbf7ee]', textClass: 'text-slate-900' },
    { name: 'amber', hex: '#f59e0b', bgClass: 'bg-[#f59e0b]', textClass: 'text-slate-950' },
    { name: 'slate', hex: '#64748b', bgClass: 'bg-[#64748b]', textClass: 'text-white' },
    { name: 'mint', hex: '#e6fcf5', bgClass: 'bg-[#e6fcf5]', textClass: 'text-emerald-950' },
  ]);
  readonly brandOneLiner = signal<string>(
    '"Masukin modal, keluar harga jual yang tetap untung — dalam 1 menit."'
  );

  // 3. Scripts tab state
  readonly selectedAngleId = signal<string>('01');
  readonly scriptAngles = signal<ScriptAngle[]>([
    {
      id: '01',
      name: '01 Pain angka',
      caption: 'Laku banyak tapi saldo tipis? Bisa jadi harga kamu belum ngitung ongkir & fee marketplace 👇',
      adImage: '/assets/aistudio/image_895e30eb.png',
      scenes: [
        {
          number: 'SCENE 1 · HOOK',
          label: 'HOOK',
          content: '"Modal 20 ribu, dijual 25 ribu. Laku 100 pcs. Kok saldo malah minus?"',
        },
        {
          number: 'SCENE 2 · MEKANISME',
          label: 'MEKANISME',
          content: '"Ongkir subsidi, kemasan, fee marketplace nggak kehitung. Di Nexus, semuanya masuk."',
        },
        {
          number: 'SCENE 3 · CTA',
          label: 'CTA',
          content: '"Stop nebak harga. Klik link, coba Nexus."',
        },
      ],
    },
    {
      id: '02',
      name: '02 Edukasi HPP',
      caption: 'Jangan cuma hitung harga kulakan! Ini 4 komponen wajib HPP jualan online biar gak boncos.',
      adImage: '/assets/aistudio/image_7176e181.png',
      scenes: [
        {
          number: 'SCENE 1 · HOOK',
          label: 'HOOK',
          content: '"Banyak seller bangkrut bukan karena sepi pembeli, tapi karena salah rumus HPP."',
        },
        {
          number: 'SCENE 2 · MEKANISME',
          label: 'MEKANISME',
          content: '"Masukin modal barang, bubble wrap, fee Shopee 8%, langsung keluar batas harga diskon aman."',
        },
        {
          number: 'SCENE 3 · CTA',
          label: 'CTA',
          content: '"Akses kalkulator Nexus sekarang, sekali bayar seumur hidup."',
        },
      ],
    },
    {
      id: '03',
      name: '03 Myth-bust',
      caption: 'Mitos: Jual murah pasti untung karena volume banyak. Fakta: Margin tipis bikin rugi ongkir retur!',
      adImage: '/assets/aistudio/image_895e30eb.png',
      scenes: [
        {
          number: 'SCENE 1 · HOOK',
          label: 'HOOK',
          content: '"Siapa bilang perang harga itu strategi menang? Itu perang jebakan."',
        },
        {
          number: 'SCENE 2 · MEKANISME',
          label: 'MEKANISME',
          content: '"Cek margin riil produkmu sebelum banting harga. Nexus kasih simulasi dalam 30 detik."',
        },
        {
          number: 'SCENE 3 · CTA',
          label: 'CTA',
          content: '"Klik tombol di bawah dan amankan cuan toko kamu hari ini."',
        },
      ],
    },
    {
      id: '04',
      name: '04 Demo 1 menit',
      caption: 'Gak usah pusing bikin rumus Excel ribet. Cukup buka di HP, ketik modal, langsung beres!',
      adImage: '/assets/aistudio/image_7176e181.png',
      scenes: [
        {
          number: 'SCENE 1 · HOOK',
          label: 'HOOK',
          content: '"Ini cara hitung harga jual seller cerdas tanpa buka laptop sama sekali."',
        },
        {
          number: 'SCENE 2 · MEKANISME',
          label: 'MEKANISME',
          content: '"Tinggal geser target margin 35%, sistem langsung kunci harga jual ideal."',
        },
        {
          number: 'SCENE 3 · CTA',
          label: 'CTA',
          content: '"Coba live demo sekarang di link bio / tombol sponsor."',
        },
      ],
    },
    {
      id: '05',
      name: '05 POV seller',
      caption: 'POV: Tiap packing ratusan paket tapi pas narik saldo di rekening cuma sisa recehan 😭',
      adImage: '/assets/aistudio/image_895e30eb.png',
      scenes: [
        {
          number: 'SCENE 1 · HOOK',
          label: 'HOOK',
          content: '"Keringat bercucuran packing sampai jam 2 pagi, tapi rekening gak pernah nambah."',
        },
        {
          number: 'SCENE 2 · MEKANISME',
          label: 'MEKANISME',
          content: '"Ternyata fee marketplace naik diam-diam. Dengan Nexus, margin kamu selalu terlindungi."',
        },
        {
          number: 'SCENE 3 · CTA',
          label: 'CTA',
          content: '"Selamatkan bisnismu sekarang dengan Nexus."',
        },
      ],
    },
  ]);

  readonly activeScript = computed(() => {
    return this.scriptAngles().find((s) => s.id === this.selectedAngleId()) ?? this.scriptAngles()[0];
  });

  // 4. Image Ads tab state
  readonly imageAds = signal<ImageAdItem[]>([
    {
      id: 'ugc',
      title: 'Modal 20rb, dijual 25rb, kok rugi?',
      subtitle: 'Hitung pakai Nexus',
      tag: 'UGC',
      badgeBg: 'bg-black/60',
      highlightText: 'UGC Gaya Organik',
    },
    {
      id: 'demo-hp',
      title: 'HPP + harga jual aman dalam 1 menit',
      subtitle: 'Tanpa Excel. Tanpa ribet.',
      tag: 'Demo HP',
      badgeBg: 'bg-black/60',
      highlightText: 'Rp 26.000 Target',
    },
    {
      id: 'before-after',
      title: 'Beda tipis, efeknya jauh.',
      subtitle: 'Untung tipis saldo minus VS Margin aman 35%',
      tag: 'Before/after',
      badgeBg: 'bg-black/60',
      highlightText: 'Perbandingan Visual',
    },
    {
      id: 'listicle',
      title: '3 biaya yang sering lupa dihitung seller',
      subtitle: '1. Ongkir subsidi • 2. Fee marketplace • 3. Kemasan',
      tag: 'Listicle',
      badgeBg: 'bg-amber-600/80',
      features: ['1 Ongkir subsidi', '2 Fee marketplace', '3 Kemasan & bubble wrap'],
    },
    {
      id: 'testimoni',
      title: '“Akhirnya tahu untung bersih per pcs. Harga naik dikit, tapi laku tetap jalan.”',
      subtitle: '— Dimas, seller keripik ⭐⭐⭐⭐⭐',
      tag: 'Testimoni',
      badgeBg: 'bg-black/70',
    },
    {
      id: 'promo',
      title: 'Stop nebak harga.',
      subtitle: 'Ambil Nexus Rp79rb sekali bayar',
      tag: 'Promo',
      badgeBg: 'bg-emerald-600/80',
      highlightText: 'Rp79rb Sekali Bayar',
    },
  ]);

  // 5. Landing page tab state
  readonly landingViewport = signal<'375' | '768' | '1100'>('375');

  // 6. Videos tab state
  readonly selectedAvatarId = signal<string>('mic-man');
  readonly avatarList = signal<VideoAvatarItem[]>([
    {
      id: 'mic-man',
      name: 'Studio Founder',
      tag: 'Founder',
      avatarImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      duration: '0:42',
      hook: 'Avatar ngomong ke kamera, hook kena di 3 detik pertama.',
    },
    {
      id: 'story',
      name: 'Story Avatar',
      tag: 'Story',
      avatarImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
      duration: '0:35',
      hook: 'Gaya curhat santai di mobil, relatable buat reseller pemula.',
    },
    {
      id: 'edukasi',
      name: 'Edukasi Avatar',
      tag: 'Edukasi',
      avatarImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
      duration: '0:48',
      hook: 'Tampilan studio profesional dengan mic, cocok untuk konten tutorial.',
    },
    {
      id: 'painpoint',
      name: 'Pain point Avatar',
      tag: 'Pain point',
      avatarImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
      duration: '0:29',
      hook: 'Casual di kamar tidur scrolling HP, emosional masalah saldo minus.',
    },
    {
      id: 'cta',
      name: 'CTA Avatar',
      tag: 'CTA',
      avatarImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
      duration: '0:24',
      hook: 'Enerjik to-the-point, ajak klik penawaran spesial Rp79rb.',
    },
    {
      id: 'review',
      name: 'Review Avatar',
      tag: 'Review',
      avatarImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      duration: '0:50',
      hook: 'Gaya unboxing & review jujur penggunaan kalkulator sebulan penuh.',
    },
    {
      id: 'wfh',
      name: 'WFH Seller',
      tag: 'WFH',
      avatarImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      duration: '0:38',
      hook: 'Suasana kerja rumahan, realistis untuk dropshipper & pebisnis rumahan.',
    },
  ]);

  readonly activeAvatar = computed(() => {
    return this.avatarList().find((a) => a.id === this.selectedAvatarId()) ?? this.avatarList()[0];
  });

  // 7. Scale tab state
  readonly scaleAssetsCount = signal<number>(12);
  readonly scaleNotification = signal<string | null>(null);

  // 8. Tool Builder state
  readonly selectedToolType = signal<'hpp' | 'invoice' | 'kpr'>('hpp');
  readonly toolName = signal<string>('Nexus');
  readonly selectedThemeColor = signal<'emerald' | 'blue' | 'red' | 'amber'>('emerald');
  readonly isVercelLive = signal<boolean>(true);
  readonly isVercelDeploying = signal<boolean>(false);

  // 9. Interactive Product Deliverable App Calculator State (Nexus)
  readonly modalBarang = signal<number>(17000);
  readonly biayaKemasan = signal<number>(1500);
  readonly ongkirSubsidi = signal<number>(1000);
  readonly feeMarketplacePersen = signal<number>(8.0);
  readonly targetMarginPersen = signal<number>(35.0);

  // Calculated values for Nexus tool
  readonly totalHpp = computed(() => {
    return this.modalBarang() + this.biayaKemasan() + this.ongkirSubsidi();
  });

  readonly hargaJualRekomendasi = computed(() => {
    // Rumus: Harga Jual = Total HPP / (1 - (Target Margin % + Fee Marketplace %) / 100)
    const totalHpp = this.totalHpp();
    const totalDeductionsPercent = (this.targetMarginPersen() + this.feeMarketplacePersen()) / 100;
    if (totalDeductionsPercent >= 0.95) return totalHpp * 2;
    return Math.round(totalHpp / (1 - totalDeductionsPercent));
  });

  readonly profitBersihPerPcs = computed(() => {
    const hargaJual = this.hargaJualRekomendasi();
    const feeRp = (hargaJual * this.feeMarketplacePersen()) / 100;
    return Math.round(hargaJual - this.totalHpp() - feeRp);
  });

  readonly feeMarketplaceRp = computed(() => {
    return Math.round((this.hargaJualRekomendasi() * this.feeMarketplacePersen()) / 100);
  });

  // 10. LD Academy tab state
  readonly academyLessons = signal<AcademyLesson[]>([
    {
      id: 'm1',
      title: 'Peta Jalan dari Nol ke Jualan Pertama',
      category: 'Fondasi',
      duration: '14 menit',
      tagline: 'Mindset & 4 fase validasi produk sebelum bikin apapun.',
      isCompleted: true,
    },
    {
      id: 'm2',
      title: 'Harga yang Bikin Orang Beli',
      category: 'Fondasi',
      duration: '18 menit',
      tagline: 'Sweet spot harga Rp49rb - Rp99rb & psikologi checkout.',
      isCompleted: true,
    },
    {
      id: 'm3',
      title: 'Produk Bagus vs Produk Jelek',
      category: 'Fondasi',
      duration: '16 menit',
      tagline: '4 ciri tool digital yang punya recurring retention tinggi.',
      isCompleted: true,
    },
    {
      id: 'm4',
      title: 'Bedah Dashboard Scalev',
      category: 'Produk',
      duration: '22 menit',
      tagline: 'Setup checkout page, payment gateway otomatis, & pixel Meta.',
      isCompleted: false,
    },
    {
      id: 'm5',
      title: 'Gambar LP yang Bikin Percaya',
      category: 'Produk',
      duration: '19 menit',
      tagline: 'Struktur visual landing page konversi 6.8%.',
      isCompleted: false,
    },
    {
      id: 'm6',
      title: 'Tools & Skill Wajib Sebelum Mulai',
      category: 'Produk',
      duration: '12 menit',
      tagline: 'AI stack tanpa ribet: naskah, visual, dan tool generator.',
      isCompleted: false,
    },
  ]);

  readonly activeLesson = signal<AcademyLesson>(this.academyLessons()[1]);

  // Interactive Academy Chat Messages
  readonly academyChatHistory = signal<{ sender: 'user' | 'mentor' | 'admin'; message: string; time: string }[]>([
    {
      sender: 'user',
      message: 'Nyangkut di setting domain 😵',
      time: '10:42',
    },
    {
      sender: 'mentor',
      message: 'AI Mentor: Cek video Setting Domain menit 04, ikutin langkah 2 (tambah CNAME record di Cloudflare ke cname.vercel-dns.com).',
      time: '10:42',
    },
    {
      sender: 'admin',
      message: 'Admin: Kalau masih error, kirim screenshot ya, gue bantu 👍',
      time: '10:43',
    },
  ]);

  // Actions
  setSubTab(tabId: string) {
    this.activeSubTab.set(tabId);
  }

  setSidebar(item: string) {
    this.activeSidebar.set(item);
    if (item === 'produk') {
      // keep current subtab
    } else if (item === 'tool-builder') {
      this.activeSubTab.set('tool-builder');
    } else if (item === 'galeri') {
      this.activeSubTab.set('image-ads');
    } else if (item === 'avatar' || item === 'create-avatar') {
      this.activeSubTab.set('videos');
    } else if (item === 'ai-mentor') {
      this.activeSubTab.set('ld-academy');
    } else if (item === 'biaya') {
      this.activeSubTab.set('produk-app');
    } else if (item === 'ld-academy') {
      this.activeSubTab.set('ld-academy');
    }
  }

  toggleDarkMode() {
    this.isDarkMode.update((v) => !v);
  }

  setNicheInput(text: string) {
    this.nicheIdeaInput.set(text);
  }

  usePresetNiche(query: string) {
    this.nicheIdeaInput.set(query);
    this.triggerScan(query);
  }

  async triggerScan(customQuery?: string) {
    const query = (customQuery ?? this.nicheIdeaInput()).trim().toLowerCase();
    this.isScanning.set(true);
    this.scanProgress.set(20);
    this.scanStatusMessage.set('Menghubungkan AI Gratis (Gemini 3.8 Flash) & live sources...');

    const timer1 = setTimeout(() => {
      this.scanProgress.set(50);
      this.scanStatusMessage.set('Menyisir diskusi aktif, komplain seller, dan tren pencarian...');
    }, 400);

    const timer2 = setTimeout(() => {
      this.scanProgress.set(80);
      this.scanStatusMessage.set('Menghitung demand score, margin profit, & hook konversi...');
    }, 800);

    try {
      const res = await fetch('/api/ai/research-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sources: this.selectedSources() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.concepts && Array.isArray(data.concepts) && data.concepts.length > 0) {
          this.demandConcepts.set(data.concepts);
          this.activeAiEngine.set(data.source === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'nexus-heuristic');
        } else {
          this.generateConceptsForQuery(query);
        }
      } else {
        this.generateConceptsForQuery(query);
      }
    } catch {
      this.generateConceptsForQuery(query);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      this.scanProgress.set(100);
      const postBump = Math.floor(Math.random() * 450) + 200;
      this.scannedPostCount.update((c) => c + postBump);
      this.isScanning.set(false);
      this.scanStatusMessage.set(`AI Gemini & Maya selesai menganalisis ${this.scannedPostCount()} data points.`);
    }
  }

  private generateConceptsForQuery(query: string) {
    // Generate tailored high-converting concepts based on query
    if (query.includes('kuliner') || query.includes('f&b') || query.includes('resto') || query.includes('makanan')) {
      this.demandConcepts.set([
        {
          id: 'foodcost-pro',
          name: 'Nexus FoodCost · kalkulator HPP resep & menu resto',
          tagline: 'web-app tool • cegah boncos porsi & bahan • Rp89rb',
          type: 'web-app tool',
          price: 'Rp89rb',
          demandScore: 96,
          highlight: true,
          searchVolume: '36.800 pencarian/bln',
          trendMomentum: '+54% MoM (Sangat Kuat)',
          competitionLevel: 'Rendah',
          potentialMargin: '60% - 75%',
          targetAudience: 'Owner cafe, bakery, cloud kitchen & warung makan',
          whyTrending: 'Harga bahan baku melonjak (minyak, telur, cabai), pemilik resto sulit hitung margin tiap porsi.',
          suggestedHook: '"Porsi laku 200 mangkok sehari, pas tutup buku akhir bulan uangnya gak ada? Hitung Food Cost beneran."',
        },
        {
          id: 'sop-resto',
          name: 'SOP Resto & Dapur Siap Pakai',
          tagline: 'tool template • standarisasi rasa & kebersihan',
          type: 'tool',
          price: 'Rp99rb',
          demandScore: 88,
          searchVolume: '24.100 pencarian/bln',
          trendMomentum: '+32% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '50% - 70%',
          targetAudience: 'Manajer resto & bisnis waralaba',
          whyTrending: 'Turnover karyawan dapur tinggi, butuh panduan cepat tanpa training panjang.',
          suggestedHook: '"Karyawan baru bisa masak sesuai standar rasa bintang lima dalam 1 hari training."',
        },
        {
          id: 'waste-tracker',
          name: 'WasteTracker · catat sisa bahan makanan',
          tagline: 'tool • pangkas kerugian bahan busuk',
          type: 'tool',
          price: 'Rp69rb',
          demandScore: 81,
          searchVolume: '15.600 pencarian/bln',
          trendMomentum: '+21% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '45% - 60%',
          targetAudience: 'Coffee shop & bakery',
          whyTrending: 'Kebocoran terbesar cafe ada di sisa susu dan roti expired.',
          suggestedHook: '"Selamatkan Rp3 juta uang dingin yang terbuang ke tong sampah tiap bulan."',
        },
        {
          id: 'nexus-kuliner',
          name: 'Nexus · margin promo GoFood & GrabFood',
          tagline: 'web-app • rumus harga promo online',
          type: 'web-app tool',
          price: 'Rp79rb',
          demandScore: 78,
          searchVolume: '18.900 pencarian/bln',
          trendMomentum: '+17% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '40% - 55%',
          targetAudience: 'Resto merchant online delivery',
          whyTrending: 'Komisi ojol 20%+ sering memakan seluruh margin penjual.',
          suggestedHook: '"Pasang diskon 40% di aplikasi ojol tapi margin bersih kamu tetap untung 25%."',
        },
        {
          id: 'shift-jadwal',
          name: 'JadwalShift · roster karyawan barista',
          tagline: 'tool • generator jadwal shift otomatis',
          type: 'tool',
          price: 'Rp49rb',
          demandScore: 73,
          searchVolume: '11.400 pencarian/bln',
          trendMomentum: '+10% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '30% - 45%',
          targetAudience: 'Supervisor cafe & bistro',
          whyTrending: 'Jadwal shift sering bentrok dan bikin pusing tiap akhir pekan.',
          suggestedHook: '"Susun jadwal shift 15 staf dalam 3 menit tanpa ada yang komplain bentrok."',
        },
      ]);
    } else if (query.includes('notion') || query.includes('keuangan') || query.includes('cashflow')) {
      this.demandConcepts.set([
        {
          id: 'nexus-cashflow',
          name: 'Nexus CashFlow · radar arus kas toko & UMKM',
          tagline: 'web-app tool • pantau profit harian real-time • Rp79rb',
          type: 'web-app tool',
          price: 'Rp79rb',
          demandScore: 97,
          highlight: true,
          searchVolume: '52.100 pencarian/bln',
          trendMomentum: '+48% MoM (Viral)',
          competitionLevel: 'Sedang',
          potentialMargin: '55% - 70%',
          targetAudience: 'Freelancer, pemilik toko, dropshipper & pebisnis pemula',
          whyTrending: 'Buku kas manual sering hilang, software akuntansi korporat terlalu rumit dan mahal bulanan.',
          suggestedHook: '"Omzet 50 juta sebulan tapi pas mau belanja stok baru uangnya ga ada? Ini radar cashflow kamu."',
        },
        {
          id: 'notion-biz-os',
          name: 'Nexus OS · template workspace bisnis all-in-one',
          tagline: 'template tool • manajemen proyek & klien',
          type: 'tool',
          price: 'Rp99rb',
          demandScore: 89,
          searchVolume: '31.200 pencarian/bln',
          trendMomentum: '+35% MoM',
          competitionLevel: 'Tinggi',
          potentialMargin: '60% - 80%',
          targetAudience: 'Agensi, creative freelancer & konsultan',
          whyTrending: 'Trend Notion produktivitas sedang melonjak tinggi di Gen-Z & profesional muda.',
          suggestedHook: '"Kelola 20 klien sekaligus tanpa ada revisi deadline yang terlewat."',
        },
        {
          id: 'tax-estimator',
          name: 'Estimator Pajak UMKM 0.5%',
          tagline: 'tool • hitung PPh final & SPT masa',
          type: 'tool',
          price: 'Rp69rb',
          demandScore: 83,
          searchVolume: '18.400 pencarian/bln',
          trendMomentum: '+25% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '45% - 60%',
          targetAudience: 'Wajib pajak UMKM & pengusaha toko',
          whyTrending: 'Musim lapor SPT bikin panik banyak pengusaha kecil.',
          suggestedHook: '"Hitung pajak usaha 0.5% dalam 1 menit tanpa pusing denda kantor pajak."',
        },
        {
          id: 'piutang-reminder',
          name: 'Nexus Piutang · debt tracker & auto WhatsApp',
          tagline: 'tool • tagih piutang santun',
          type: 'tool',
          price: 'Rp59rb',
          demandScore: 77,
          searchVolume: '16.700 pencarian/bln',
          trendMomentum: '+14% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '40% - 50%',
          targetAudience: 'Distributor, agen grosir & online shop tempo',
          whyTrending: 'Banyak pengusaha sungkan menagih piutang ke teman atau langganan.',
          suggestedHook: '"Kirim reminder tagihan otomatis dan profesional tanpa rasa gak enakan."',
        },
        {
          id: 'target-profit-calc',
          name: 'Break-Even & Target Omzet Calculator',
          tagline: 'tool • tahu titik impas harian',
          type: 'tool',
          price: 'Rp49rb',
          demandScore: 72,
          searchVolume: '13.100 pencarian/bln',
          trendMomentum: '+12% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '35% - 50%',
          targetAudience: 'Calon wirausahawan baru',
          whyTrending: 'Sebelum buka usaha, orang butuh tahu minimal berapa penjualan sehari biar gak nombok.',
          suggestedHook: '"Ketahui persis berapa item yang harus laku hari ini sebelum tokomu buka."',
        },
      ]);
    } else if (query.includes('affiliate') || query.includes('video') || query.includes('script') || query.includes('iklan')) {
      this.demandConcepts.set([
        {
          id: 'nexus-script-ai',
          name: 'Nexus ScriptAI · generator naskah video affiliate',
          tagline: 'web-app tool • 5 sudut hook viral dalam 20 detik • Rp89rb',
          type: 'web-app tool',
          price: 'Rp89rb',
          demandScore: 98,
          highlight: true,
          searchVolume: '64.000 pencarian/bln',
          trendMomentum: '+68% MoM (Eksplosif)',
          competitionLevel: 'Sedang',
          potentialMargin: '65% - 85%',
          targetAudience: 'Kreator affiliate TikTok Shop & Shopee Video',
          whyTrending: 'Affiliator kehabisan ide bikin konten video tiap hari, butuh hook psikologis yang stop scrolling.',
          suggestedHook: '"Bikin 10 skrip video affiliate yang tembus 100k views tanpa mikir seharian."',
        },
        {
          id: 'hook-vault',
          name: '100 Hook Viral Siap Pakai',
          tagline: 'tool template • swipe file 3 detik pertama',
          type: 'tool',
          price: 'Rp49rb',
          demandScore: 91,
          searchVolume: '41.300 pencarian/bln',
          trendMomentum: '+45% MoM',
          competitionLevel: 'Tinggi',
          potentialMargin: '60% - 75%',
          targetAudience: 'Video creator pemula',
          whyTrending: '90% penonton kabur jika hook detik pertama membosankan.',
          suggestedHook: '"Stop pakai pembukaan \'Halo guys!\'—coba 3 rumus hook psikologis ini."',
        },
        {
          id: 'roas-calc',
          name: 'Kalkulator ROAS & Target Iklan Meta',
          tagline: 'tool • cek batas biaya iklan aman',
          type: 'tool',
          price: 'Rp69rb',
          demandScore: 84,
          searchVolume: '22.900 pencarian/bln',
          trendMomentum: '+29% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '50% - 65%',
          targetAudience: 'Media buyer & pengiklan Facebook/TikTok',
          whyTrending: 'Biaya CPM iklan naik, pengiklan butuh tahu persis CPR maksimal sebelum scale budget.',
          suggestedHook: '"Jangan scale iklan kalau ROAS kamu di bawah batas aman ini."',
        },
        {
          id: 'caption-boost',
          name: 'Nexus CaptionBoost · SEO & hashtag generator',
          tagline: 'tool • optimasi search TikTok & Instagram',
          type: 'tool',
          price: 'Rp59rb',
          demandScore: 78,
          searchVolume: '19.500 pencarian/bln',
          trendMomentum: '+18% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '40% - 55%',
          targetAudience: 'Social media specialist & online shop',
          whyTrending: 'Algoritma platform bergeser ke intent search SEO bukan sekadar hashtag.',
          suggestedHook: '"Video kamu bisa masuk halaman pencarian teratas hanya dengan setting caption ini."',
        },
        {
          id: 'ugc-brief',
          name: 'UGC Brief Builder untuk Influencer',
          tagline: 'tool • template pengarahan video creator',
          type: 'tool',
          price: 'Rp49rb',
          demandScore: 74,
          searchVolume: '12.800 pencarian/bln',
          trendMomentum: '+13% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '35% - 45%',
          targetAudience: 'Brand owner yang endorse talent',
          whyTrending: 'Hasil video endorsement sering gak sesuai ekspektasi karena brief kurang jelas.',
          suggestedHook: '"Endorsement gak pernah meleset lagi kalau pakai format brief 1 halaman ini."',
        },
      ]);
    } else {
      // Default / Ecommerce Seller Suite (Nexus)
      this.demandConcepts.set([
        {
          id: 'nexus',
          name: 'Nexus · kalkulator HPP & harga jual',
          tagline: 'web-app tool • dipakai tiap mau jualan • Rp79rb',
          type: 'web-app tool',
          price: 'Rp79rb',
          demandScore: 94,
          highlight: true,
          searchVolume: '48.200 pencarian/bln',
          trendMomentum: '+42% MoM (Sangat Kuat)',
          competitionLevel: 'Rendah',
          potentialMargin: '45% - 65%',
          targetAudience: 'Seller Shopee, TikTok Shop, Tokopedia & Reseller',
          whyTrending: 'Banyak seller komplain boncos akibat kenaikan fee admin marketplace dari 6% ke 8.5% tanpa sadar.',
          suggestedHook: '"Modal 20 ribu, dijual 25 ribu. Laku 100 pcs, kok saldo malah minus?"',
        },
        {
          id: 'marginmarket',
          name: 'MarginMarket · cek fee marketplace',
          tagline: 'tool • Shopee/TikTok Shop',
          type: 'tool',
          price: 'Rp69rb',
          demandScore: 86,
          searchVolume: '27.400 pencarian/bln',
          trendMomentum: '+28% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '40% - 55%',
          targetAudience: 'Merchant marketplace multi-channel',
          whyTrending: 'Penjual bingung simulasi perbandingan potongan fee antar platform.',
          suggestedHook: '"Cek fee Shopee vs TikTok Shop sebelum pasang harga flash sale!"',
        },
        {
          id: 'invoicekilat',
          name: 'InvoiceKilat · bikin invoice 30 detik',
          tagline: 'tool • tanpa daftar akun',
          type: 'tool',
          price: 'Rp49rb',
          demandScore: 79,
          searchVolume: '19.800 pencarian/bln',
          trendMomentum: '+15% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '50% - 70%',
          targetAudience: 'Freelancer, Vendor wedding & UMKM jasa',
          whyTrending: 'Aplikasi invoice lain terlalu rumit harus sign up dan berlangganan bulanan mahal.',
          suggestedHook: '"Bikin invoice PDF profesional langsung kirim ke WA klien dalam 30 detik."',
        },
        {
          id: 'kalkulatorkpr',
          name: 'Kalkulator KPR & Simulasi DP',
          tagline: 'tool • closing rate agen properti',
          type: 'tool',
          price: 'Rp99rb',
          demandScore: 74,
          searchVolume: '14.500 pencarian/bln',
          trendMomentum: '+19% MoM',
          competitionLevel: 'Rendah',
          potentialMargin: '60% - 80%',
          targetAudience: 'Agen properti independen & calon pembeli rumah pertama',
          whyTrending: 'Suku bunga floating BI berfluktuasi, calon pembeli butuh simulasi cicilan akurat.',
          suggestedHook: '"Closing pembeli rumah 2x lebih cepat dengan simulasi cicilan instan di depan klien."',
        },
        {
          id: 'rekaporder',
          name: 'Rekap Order WA Otomatis',
          tagline: 'tool • template pesanan cepat',
          type: 'tool',
          price: 'Rp59rb',
          demandScore: 71,
          searchVolume: '12.300 pencarian/bln',
          trendMomentum: '+11% MoM',
          competitionLevel: 'Sedang',
          potentialMargin: '35% - 50%',
          targetAudience: 'Admin olshop chat WhatsApp',
          whyTrending: 'Stres copas format alamat dan hitung ongkir manual pas promo tanggal kembar.',
          suggestedHook: '"Ubah chat pesanan berantakan jadi format resi siap cetak sekali tap."',
        },
      ]);
    }
  }

  selectConcept(concept: ConceptItem) {
    this.demandConcepts.update((list) =>
      list.map((c) => ({
        ...c,
        highlight: c.id === concept.id,
      }))
    );
    this.selectedConceptDetails.set(concept);
    const mainTitle = concept.name.split('·')[0].trim();
    this.toolName.set(mainTitle);
  }

  toggleSource(source: string) {
    this.selectedSources.update((sources) =>
      sources.includes(source) ? sources.filter((s) => s !== source) : [...sources, source]
    );
    // Dynamic post adjustment based on active sources
    const activeCount = this.selectedSources().length;
    this.scannedPostCount.set(Math.max(300, activeCount * 710 + Math.floor(Math.random() * 40)));
  }

  selectLogo(id: number) {
    this.selectedLogoId.set(id);
  }

  selectAngle(angleId: string) {
    this.selectedAngleId.set(angleId);
  }

  setViewport(vp: '375' | '768' | '1100') {
    this.landingViewport.set(vp);
  }

  selectAvatar(id: string) {
    this.selectedAvatarId.set(id);
  }

  generateScaleAssets() {
    this.scaleAssetsCount.update((c) => c + 12);
    this.scaleNotification.set('Berhasil digenerate! +3 Image Ads, +6 Video Scene, +3 Scripts, +1 Landing Page B siap diuji.');
    setTimeout(() => this.scaleNotification.set(null), 4000);
  }

  deployToVercel() {
    this.isVercelDeploying.set(true);
    setTimeout(() => {
      this.isVercelDeploying.set(false);
      this.isVercelLive.set(true);
    }, 1500);
  }

  async synthesizeAllConceptsIntoMaster() {
    this.isSynthesizingMaster.set(true);
    try {
      const res = await fetch('/api/ai/synthesize-master-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepts: this.demandConcepts(),
          niche: this.nicheIdeaInput(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.masterBlueprint) {
          this.masterBlueprint.set(data.masterBlueprint);
          this.isSynthesizingMaster.set(false);
          return;
        }
      }
      this.generateLocalMasterBlueprint();
    } catch {
      this.generateLocalMasterBlueprint();
    } finally {
      this.isSynthesizingMaster.set(false);
    }
  }

  generateLocalMasterBlueprint() {
    const concepts = this.demandConcepts();
    const firstTitle = concepts[0]?.name?.split('·')[0]?.trim() || 'Nexus';
    this.masterBlueprint.set({
      masterTitle: `${firstTitle} All-in-One Master Suite`,
      tagline: 'Mega Web-App Terpadu • Hitung HPP + Audit Fee + Rekap Transaksi WA • Rp99rb Sekali Bayar',
      compositeScore: 98,
      bundlePrice: 'Rp99rb',
      totalMarketReach: '138.800+ pencarian gabungan/bln',
      corePillars: [
        'Pillar 1: Kalkulasi HPP Real-time & Batas Diskon Aman',
        'Pillar 2: Audit Perbandingan Potongan Fee Marketplace',
        'Pillar 3: Generator Invoice & Rekap Pesanan Instan ke WhatsApp',
      ],
      synthesizedUsp: 'Masukin modal barang sekali tap: langsung keluar harga jual untung, simulasi potongan Shopee/TikTok Shop, dan buat invoice PDF tanpa Excel.',
      synergyExplanation: 'Menggabungkan 5 kebutuhan harian seller ke dalam satu layar membuat pembeli merasa mendapatkan nilai Rp500rb hanya dengan harga Rp99rb sekali bayar.',
      masterHook: '"Laku 100 paket tapi rekening gak nambah? Solusi all-in-one: kunci margin untung, cegah fee bocor, dan kirim nota otomatis dalam 1 menit."',
      suggestedFeatures: [
        'Kalkulator HPP Multi-Komponen (Bahan + Kemasan + Subsidi Ongkir)',
        'Kalkulator Auto-Fee Shopee, TikTok Shop, Tokopedia & Lazada',
        'Generator Invoice Instan PDF & WA tanpa Registrasi Akun',
        'Simulator ROAS & Batas Aman Budget Iklan Meta Ads',
      ],
    });
  }

  applyMasterBlueprintToSuite() {
    const mb = this.masterBlueprint();
    if (!mb) return;
    this.toolName.set(mb.masterTitle);
    this.brandOneLiner.set(`"${mb.synthesizedUsp}"`);
    this.setSubTab('brand');
  }

  sendAcademyQuestion(text: string) {
    if (!text.trim()) return;
    this.academyChatHistory.update((list) => [
      ...list,
      { sender: 'user', message: text, time: 'Baru saja' },
      {
        sender: 'mentor',
        message: `AI Mentor: Bagus pertanyaannya! Berdasarkan modul, solusinya adalah cek pengaturan parameter pada panel terkait, lalu simpan perubahan.`,
        time: 'Baru saja',
      },
    ]);
  }
}
