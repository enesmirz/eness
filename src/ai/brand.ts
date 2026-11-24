import type { BrandPack } from '../types'

const hash = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const PREFIX = ['Nova', 'Orbit', 'Kuzey', 'Vera', 'Atlas', 'Lumen', 'Terra', 'Zenit', 'Kroma', 'Helix', 'Mira', 'Peak']
const SUFFIX = ['ta', 'via', 'nora', 'lyx', 'oso', 'vanti', 'deko', 'tera', 'forma', 'glo']
const DESCRIPTORS = ['co', 'lab', 'works', 'group', 'house', 'studio']

const SLG_PATTERNS = [
  '{s} ile fark yaratın.',
  'İyi işlerin adresi: {s}.',
  '{s}. Hikâyesi güçlü markaların.',
  'Daha fazlası için {s}.',
  '{s}, sadece başlangıç.',
  'Öne çıkanlar {s} der.',
]

const PALETTES: { name: string; colors: string[] }[] = [
  { name: 'Derin Gece', colors: ['#0f1320', '#1c2438', '#3d5a80', '#8ecae6', '#f2e8cf'] },
  { name: 'Lime Metal', colors: ['#101210', '#2a2d25', '#5c6147', '#d8f34e', '#f4f3ea'] },
  { name: 'Toprak Sıcak', colors: ['#2b1d16', '#54321e', '#a45d3a', '#d9a566', '#f3e3cd'] },
  { name: 'Soğuk Botanik', colors: ['#12211c', '#1e3a31', '#3c6e57', '#77c9a0', '#eef5ef'] },
  { name: 'Monokrom Kırmızı', colors: ['#141414', '#2e2e2e', '#5c5c5c', '#b3b3b3', '#e63946'] },
  { name: 'Lavanta Katman', colors: ['#191426', '#2e2545', '#564787', '#9f86c0', '#eadcee'] },
]

const TYPE_PAIRS = [
  { primary: 'Space Grotesk', secondary: 'Inter', usage: 'Başlıklar için geometrik grotesk; gövde metni ve UI için Inter. Modern teknoloji hissi.' },
  { primary: 'Playfair Display', secondary: 'Source Sans 3', usage: 'Editoryal serif başlıklar + nötr sans gövde. Lüks ve premium konumlandırma.' },
  { primary: 'Manrope', secondary: 'IBM Plex Sans', usage: 'Tek yumuşak grotesk aile; kurumsal ve teknolojik ton.' },
  { primary: 'Fraunces', secondary: 'Outfit', usage: 'Karakterli serif başlık, temiz sans gövde. Yaratıcı ve sıcak markalar için.' },
  { primary: 'Archivo', secondary: 'Inter', usage: 'Güçlü ve sıkı kontrast başlıklar; sade UI metni. Cesur konumlandırma.' },
]

const VISUAL_IDEAS = [
  'Monogram merkezli kimlik: markanın baş harflerinden geometrik bir işaret; negatif alanla oynayan, tek renkli uygulama sistemi. Ambalajda doğrudan baskı, dijitale uyarlanabilir.',
  'Editoryal grid sistemi: dergi düzenini çağrıştıran asimetrik ızgara, geniş boşluk alanları ve kırpılmış tipografi. Görsellerde tek filtre ve doğal ışık bütünlüğü.',
  'Nesne temelli ikonografi: markanın ürün/hizmet dünyasından türeyen 6-8 adet çizgi ikon; ambalaj ve dijitalde tutarlı bir kütüphane olarak kullanılır.',
  'Gradyan katman kimliği: derin tonlardan ince geçişli yüzeyler; harekete bağlı simgesel animasyonlarla dijitalde canlanan bir sistem.',
  'Damga-etiket estetiği: sert köşeli etiketler, koli bandı ve tipografik damga dokusu; sürdürülebilir kraft yüzeylerle birleşen sıcak ve el yapımı his.',
]

export function generateBrandPackLocal(sector: string, tone: string): BrandPack {
  const seed = hash(`${sector}|${tone}|${Date.now() % 100000}`)
  const at = (n: number) => seed % n
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1)

  const names: string[] = []
  const roots = [PREFIX[at(PREFIX.length)], PREFIX[(seed >> 3) % PREFIX.length]]
  const suffixes = [SUFFIX[(seed >> 5) % SUFFIX.length], SUFFIX[(seed >> 7) % SUFFIX.length]]
  const base0 = cap(roots[0]) + suffixes[0]
  const base1 = cap(roots[1]) + suffixes[1]
  const base2 = cap(DESCRIPTORS[(seed >> 9) % DESCRIPTORS.length]) + ' ' + cap(roots[0])
  names.push(base0, base1, base2)

  const sectorAdj = sector.trim() || 'sektörünüz'
  const slogans = [
    SLG_PATTERNS[seed % SLG_PATTERNS.length].replace('{s}', names[0]),
    SLG_PATTERNS[(seed >> 2) % SLG_PATTERNS.length].replace('{s}', `${sectorAdj}`),
    SLG_PATTERNS[(seed >> 4) % SLG_PATTERNS.length].replace('{s}', names[0]),
  ]

  const positioning = [
    `${cap(sectorAdj)} kategorisinde ${tone === 'lüks' ? 'premium ve seçkin' : tone === 'sıcak' ? 'samimi ve ulaşılabilir' : 'modern ve güvenilir'} bir konum: ${names[0]}, ${sectorAdj} alanında yüksek kaliteyi erişilebilir bir dille anlatan, karar anında referans gösterilen bir marka olarak tanımlanır.`,
  ].join(' ')

  const palette = PALETTES[(seed >> 6) % PALETTES.length]
  const typography = TYPE_PAIRS[(seed >> 8) % TYPE_PAIRS.length]
  const visualIdentity = VISUAL_IDEAS[(seed >> 10) % VISUAL_IDEAS.length]

  return { names, slogans, positioning, palette, typography, visualIdentity }
}
