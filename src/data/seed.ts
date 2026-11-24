import type { AppState, Project, Client, Storyboard, Proposal } from '../types'

const days = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

const ts = (minsAgo: number) => new Date(Date.now() - minsAgo * 60000).toISOString()

const clients: Client[] = [
  {
    id: 'cl1',
    name: 'Elif Yıldırım',
    company: 'Kavun Kahve',
    email: 'elif@kavunkahve.com',
    phone: '+90 532 214 88 90',
    notes: 'Üçüncü nesil kahve zinciri. Premium paketleme yenilemesi hedefleniyor.',
    createdAt: ts(60 * 24 * 42),
  },
  {
    id: 'cl2',
    name: 'Kaan Demir',
    company: 'Volt Mobilya',
    email: 'kaan.demir@voltmobilya.com.tr',
    phone: '+90 533 771 03 42',
    notes: 'Yeni e-ticaret serisi için lansman kampanyası talebi var.',
    createdAt: ts(60 * 24 * 35),
  },
  {
    id: 'cl3',
    name: 'Zeynep Aksoy',
    company: 'Nova Kozmetik',
    email: 'zeynep@novakozmetik.com',
    phone: '+90 555 402 77 15',
    notes: 'Vegan bakım serisi. Duygusal tonda hikâye anlatımını seviyor.',
    createdAt: ts(60 * 24 * 28),
  },
  {
    id: 'cl4',
    name: 'Mert Öztürk',
    company: 'Fırt Enerji',
    email: 'mert@firtenerji.com',
    phone: '+90 542 118 29 63',
    notes: 'B2B kurumsal kimlik çalışması. Ağırlık LinkedIn ve fuar materyalleri.',
    createdAt: ts(60 * 24 * 15),
  },
  {
    id: 'cl5',
    name: 'Deniz Karaca',
    company: 'Kuzey Medya',
    email: 'deniz@kuzeymedya.com',
    phone: '+90 531 660 51 08',
    notes: 'Ajansta sürekli iş ortağı; alt yüklenici prodüksiyon ekibi.',
    createdAt: ts(60 * 24 * 8),
  },
]

const projects: Project[] = [
  {
    id: 'pr1',
    title: 'Kavun Kahve — Yeni Seri Tanıtım Filmi',
    client: 'Kavun Kahve',
    type: 'reklam',
    status: 'devam',
    deadline: days(6),
    budget: 285000,
    description:
      "Kahve makinesi yeni serisinin 30 saniyelik ana tanıtım filmi ve 15'lik kesmelere uyumlu dijital versiyonlar.",
    progress: 62,
    tasks: [
      { id: 't1', title: 'Çekim senaryosu revizyon 2', done: true },
      { id: 't2', title: 'Kasting: ana oyuncu seçimleri', done: true },
      { id: 't3', title: 'Stüdyo çekimi (2 gün)', done: false, due: days(2) },
      { id: 't4', title: 'Kurgu — ilk derleme', done: false, due: days(5) },
      { id: 't5', title: 'Ses tasarımı ve mix', done: false, due: days(6) },
    ],
    createdAt: ts(60 * 24 * 20),
  },
  {
    id: 'pr2',
    title: 'Volt Mobilya — Lansman Kampanyası',
    client: 'Volt Mobilya',
    type: 'reklam',
    status: 'revizyon',
    deadline: days(11),
    budget: 410000,
    description:
      'E-ticaret serisinin lansmanı: ana film, OOH key visual ve dijital medya envanteri.',
    progress: 48,
    tasks: [
      { id: 't1', title: 'Key visual ilk varyantlar', done: true },
      { id: 't2', title: 'Müşteri geri bildirim turu', done: false, due: days(1) },
      { id: 't3', title: 'OOH baskı prova kontrolleri', done: false, due: days(8) },
      { id: 't4', title: 'Medya planı onayı', done: false, due: days(9) },
    ],
    createdAt: ts(60 * 24 * 26),
  },
  {
    id: 'pr3',
    title: 'Nova Kozmetik — Marka Kimliği Yenileme',
    client: 'Nova Kozmetik',
    type: 'marka',
    status: 'devam',
    deadline: days(19),
    budget: 520000,
    description:
      'Vegan bakım serisi için logo, renk paleti, tipografi ve ambalaj: resmi kimlik sistemi.',
    progress: 35,
    tasks: [
      { id: 't1', title: 'Rakip analizi raporu', done: true },
      { id: 't2', title: 'Tasarım konsepti: 3 yönlü sunum', done: true },
      { id: 't3', title: 'Ambalaj mockupları', done: false, due: days(12) },
      { id: 't4', title: 'Kimlik kılavuzu v1', done: false, due: days(17) },
    ],
    createdAt: ts(60 * 24 * 32),
  },
  {
    id: 'pr4',
    title: 'Fırt Enerji — Kurumsal Web Grafikleri',
    client: 'Fırt Enerji',
    type: 'grafik',
    status: 'planlama',
    deadline: days(25),
    budget: 180000,
    description:
      'Kurumsal web sitesi için infografik, ikon seti ve dört fabrika için röportaj fotoğrafı düzenleme.',
    progress: 10,
    tasks: [
      { id: 't1', title: 'İçerik envanteri toplanması', done: false, due: days(14) },
      { id: 't2', title: 'Fuar standı materyalleri bütçesi', done: false, due: days(22) },
    ],
    createdAt: ts(60 * 24 * 5),
  },
  {
    id: 'pr5',
    title: 'Kuzey Medya — Sosyal Medya Büyüme Paketi',
    client: 'Kuzey Medya',
    type: 'sosyal',
    status: 'devam',
    deadline: days(3),
    budget: 120000,
    description: 'Ayda 24 içerik planı + 8 reels videosu + günlük etkileşim yönetimi.',
    progress: 78,
    tasks: [
      { id: 't1', title: 'Ekim içerik takvimi teslim', done: true },
      { id: 't2', title: '8 reels senaryosu', done: true },
      { id: 't3', title: 'Reels çekim günlükleri', done: false, due: days(1) },
      { id: 't4', title: 'Aylık rapor ve analiz', done: false, due: days(3) },
    ],
    createdAt: ts(60 * 24 * 12),
  },
  {
    id: 'pr6',
    title: 'Kavun Kahve — Ambalaj Serisi',
    client: 'Kavun Kahve',
    type: 'grafik',
    status: 'tamamlandi',
    deadline: days(-7),
    budget: 95000,
    description: 'Sınırlı üretim kahve kutusu ambalaj dizisi (4 boyut).',
    progress: 100,
    tasks: [
      { id: 't1', title: 'Ambalaj tasarımı', done: true },
      { id: 't2', title: 'Baskı kontrol dosyaları', done: true },
    ],
    createdAt: ts(60 * 24 * 48),
  },
]

const storyboards: Storyboard[] = [
  {
    id: 'sb1',
    title: 'Kavun Kahve — Sabah Ritüeli',
    brief: '30 saniyelik ana film; güne kahveyle başlamanın sakin, duygusal anlatımı.',
    client: 'Kavun Kahve',
    createdAt: ts(60 * 24 * 9),
    scenes: [
      {
        id: 'sc1',
        duration: 8,
        camera: 'Geniş açı / statik',
        visual:
          'Şehir manzarası, gün doğmadan önce gri-mavi bir ışık. Perdeye çarpan ilk ışık huzmesi.',
        lighting: 'Doğal, soğuk, düşük ışık (blue hour)',
        sound: 'Şehir ambiyansı, yavaş büyüyen piyano notaları.',
        transition: 'Crossfade',
      },
      {
        id: 'sc2',
        duration: 7,
        camera: 'Detay / macro',
        visual:
          'Kahve makinesinden akan krema fincanda yumuşak bir girdap oluşturuyor. Buhar yükseliyor.',
        lighting: 'Sıcak yan anahtar ışık, derin gölgeli bir zemin.',
        sound: 'Kahve akışının yumuşak sesi, tıkırrtılar.',
        transition: 'Cut',
      },
      {
        id: 'sc3',
        duration: 9,
        camera: 'Orta plan / dolly in',
        visual: 'Karakter pencere önünde ilk yudumu alıyor; yüz hafif bir gülümseme.',
        lighting: 'Pencereden gelen sıcak altın saat ışığı.',
        sound: 'Yumuşak nefes sesi, ambiyans doğal hâle geliyor.',
        transition: 'Whip pan',
      },
      {
        id: 'sc4',
        duration: 6,
        camera: 'Detay / statik',
        visual: 'Ürün ve logo kapanışı; paket üstünde ışık vurgusu.',
        lighting: 'Kontrastlı, merkezi ürün ışıklaması.',
        sound: 'Jingle 2 notalık leitmotiv ile kapanış.',
        transition: 'Fade out',
      },
    ],
  },
  {
    id: 'sb2',
    title: 'Volt Mobilya — Yeni Ev Kurgusu',
    brief: '15 saniyelik dijital kesmeler: boş odadan yaşam alanına metamorfoz.',
    client: 'Volt Mobilya',
    createdAt: ts(60 * 24 * 3),
    scenes: [
      {
        id: 'sc1',
        duration: 4,
        camera: 'Geniş / crane',
        visual: 'Boş oda; kısa bir çırpıda koltuk ve raf yerini alıyor.',
        lighting: 'Sıcakkinmsız nötr gün ışığı.',
        sound: 'Kapı tik sesi, ardından ritmik perküsyon.',
        transition: 'Whip pan',
      },
      {
        id: 'sc2',
        duration: 6,
        camera: 'Orta / orbit',
        visual: 'Kamera takımın etrafında dolanıyor; LED şeritli raf odanın merkezine oturuyor.',
        lighting: 'Tepe aydınlatma + aynalı reflektör.',
        sound: 'Perde ve gitar öncüsü, enerjik ritim.',
        transition: 'Cut',
      },
      {
        id: 'sc3',
        duration: 5,
        camera: 'Detay / statik',
        visual: 'Logo ve claim kapanışı; indirim bandı alt kısımda beliriyor.',
        lighting: 'Ürün düzeninde yumuşak kubbe ışık.',
        sound: 'Jingle ile net kapanış.',
        transition: 'Fade out',
      },
    ],
  },
]

const proposals: Proposal[] = [
  {
    id: 'po1',
    title: 'Nova Kozmetik — Kimlik Yenileme Teklifi',
    client: 'Nova Kozmetik',
    date: days(-12),
    validUntil: days(18),
    createdAt: ts(60 * 24 * 12),
    note: 'Fiyatlar teklif tarihi itibarıyla 30 gün geçerlidir; KDV dahil değildir.',
    services: [
      {
        id: 'sv1',
        name: 'Marka Araştırması ve Konumlandırma',
        description: 'Rakip analizi, hedef kitle haritası ve konumlandırma matrisi sunumu.',
        quantity: 1,
        price: 85000,
      },
      {
        id: 'sv2',
        name: 'Kimlik Tasarımı',
        description: 'Logo sistemi, renk paleti, tipografi, ambalaj uygulaması ve kılavuz.',
        quantity: 1,
        price: 210000,
      },
      {
        id: 'sv3',
        name: 'Ambalaj Mockup ve Baskı Kontrolü',
        description: '4 ürün için baskı dosyası hazırlığı ve kontrolü.',
        quantity: 4,
        price: 12500,
      },
      {
        id: 'sv4',
        name: 'Sosyal Medya Lansman Seti',
        description: 'Lansman duyuruları: 12 statik gönderi ve 4 reels şablonu.',
        quantity: 1,
        price: 62000,
      },
    ],
  },
  {
    id: 'po2',
    title: 'Fırt Enerji — Kurumsal Grafik Paketi',
    client: 'Fırt Enerji',
    date: days(-4),
    validUntil: days(26),
    createdAt: ts(60 * 24 * 4),
    note: 'Ödeme planı: %40 peşin, %60 aylık iki dilim hâlinde.',
    services: [
      {
        id: 'sv1',
        name: 'İnfografik Seti',
        description: 'Veriye dayalı 6 adet infografik tasarımları.',
        quantity: 6,
        price: 9500,
      },
      {
        id: 'sv2',
        name: 'İkon Seti Tasarımı',
        description: '48 adet sembolik ikon, SVG + PNG sunum.',
        quantity: 1,
        price: 48000,
      },
      {
        id: 'sv3',
        name: 'Fuar Materyalleri Konsepti',
        description: 'Roll-up, broşür ve stand grafik uygulamaları.',
        quantity: 1,
        price: 67000,
      },
    ],
  },
]

export const seedState = (): AppState => ({
  clients,
  projects,
  storyboards,
  proposals,
  workspaces: {},
  brandPacks: {},
  activity: [
    { id: 'a1', time: ts(28), text: '“Kavun Kahve — Yeni Seri Tanıtım Filmi” projesi %62 ilerlemeye ulaştı', module: 'proje' },
    { id: 'a2', time: ts(190), text: '“Kuzey Medya — Sosyal Medya Büyüme Paketi” projesine 2 görev eklendi', module: 'proje' },
    { id: 'a3', time: ts(320), text: '“Fırt Enerji — Kurumsal Web Grafikleri” projesi oluşturuldu', module: 'proje' },
    { id: 'a4', time: ts(60 * 24), text: 'Deniz Karaca / Kuzey Medya müşteri kaydı oluşturuldu', module: 'musteri' },
    { id: 'a5', time: ts(60 * 24 * 2), text: '“Fırt Enerji — Kurumsal Grafik Paketi” teklifi son güncellendi', module: 'teklif' },
    { id: 'a6', time: ts(60 * 24 * 3), text: '“Volt Mobilya — Yeni Ev Kurgusu” storyboarduna 3 sahne eklendi', module: 'storyboard' },
  ],
})
