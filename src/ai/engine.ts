import type { AdStyle, AIConcept, ScriptLength, ScriptShot } from '../types'

export interface AIInput {
  brand: string
  product: string
  audience: string
  objective: string
  style: AdStyle
  length: ScriptLength
}

export const STYLE_META: Record<AdStyle, { label: string; desc: string }> = {
  duygusal: { label: 'Duygusal', desc: 'İnsan hikâyeleri, samimi anlar, kalbe dokunan anlatım' },
  sinematik: { label: 'Sinematik', desc: 'Geniş planlar, gergin kurgu, epik tonlama' },
  mizah: { label: 'Mizahi', desc: 'Esprili diyaloglar, sürpriz komik anlar, hafif ton' },
  kurumsal: { label: 'Kurumsal', desc: 'Güven veren, net, veri odaklı ve ciddi anlatım' },
  surpriz: { label: 'Sürpriz', desc: 'Beklenmedik dönüşler, ters köşe gag, dikkat kesici açılış' },
}

export const STYLE_OPTIONS = Object.entries(STYLE_META) as [AdStyle, { label: string; desc: string }][]

const hash = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const pick = (arr: string[], seed: number, salt: number): string =>
  arr[(seed + salt * 7) % arr.length]

const HEADLINES: Record<AdStyle, string[]> = {
  duygusal: [
    'Bazı anlar kalbin sıcaklığıyla ölçülür.',
    'Hikâyenin en güzel bölümü şimdi başlıyor.',
    'Geriye kalan, birlikte kurduklarımızdır.',
    'İçinizdeki şey budur.',
  ],
  sinematik: [
    'Sahne: gerçek hayat. Başrol: siz.',
    'Büyük hikâyeler büyük anlarla açılır.',
    'Işıklar, kamera, {product}.',
    'Tek kare, bütün bir dünya.',
  ],
  mizah: [
    'Uyarı: {product} alışkanlık yapar.',
    'Komşunuz sormadan biz söyleyelim.',
    'Çok iyi. Şüpheli derecede iyi.',
    'Ciddi olmayı bırakıp işe koyulduk.',
  ],
  kurumsal: [
    'Performans, ölçülebilir sonuçla kanıtlanır.',
    'Operasyonel mükemmellik, standart olarak.',
    'Veriyle düşünenlerin tercihi.',
    'Şeffaflıkla büyüyen değer.',
  ],
  surpriz: [
    'Bekle. Bunu beklemiyordunuz.',
    'Her şey plana göre... ta ki şimdiye kadar.',
    'Sonuna kadar izleyin. Söz, pişman olmazsınız.',
    'Tam da burada işler değişiyor.',
  ],
}

const CONCEPT_NAMES: Record<AdStyle, string[]> = {
  duygusal: ['Bir Eşik Anı', 'Sessiz Kahraman', 'Küçük Jestler', 'Eve Götüren Ses'],
  sinematik: ['Tek Kare', 'Işık ve Gölge', 'Yükseliş Sahnesi', 'Dramatik Giriş'],
  mizah: ['Alışkanlık Yapar', 'Tersti Yüzey', 'Titreşim Testi', 'Şüpheli İyi'],
  kurumsal: ['Ölçülebilir Değer', 'Net Taahhüt', 'Standart Olarak', 'Güven Eşiği'],
  surpriz: ['Ters Köşe', 'Beklemedikleri An', 'Kırılma Noktası', 'Plana Aykırı'],
}

const CONCEPT_TEXTS: Record<AdStyle, string[]> = {
  duygusal: [
    '{audience} için {product}, yeni bir başlangıcın yanında duran sessiz kahraman. Film tek bir gün üzerinden ilerler: küçük jestler, kısa anlar ve ürünün sağladığı sıcaklık. Anlatım kişisel bir mektup tonunda ilerler; ürün gösterilmez, hissedilir.',
    'Markayı ana karakter değil, hikâyenin yol arkadaşı yapıyoruz. {audience} sekmesinden tanıdık gelecek ritüeller; {product} bu ritüelin doğal parçası olarak karede yer alır.',
  ],
  sinematik: [
    'Sınırlı diyalog, güçlü görsel yönetmenlik. {product} etrafında dramatik bir kurgu: ürünü kullanmadan önceki düzensizlik, sonrasında dengeli dünya. Ses tasarımı hikâyeyi taşır.',
    'Ana görsel metafor: {product} bir filmin giriş sahnesi gibi kurulur. {audience} için gerilim yavaşça yükselir; ürün göründüğü an dünya oturur.',
  ],
  mizah: [
    '{audience} izleyicisinin tanıdığı bir klişeyi ters yüz eder, {product} bu kafa karışıklığını çözüm olarak sahneler. Reklam, reklam olduğunu belli eden hafif bir meta komedi kullanır.',
  ],
  kurumsal: [
    'Kanıt merkezli bir yapı: {product} avantajları ölçülebilir çıktılara bağlanır. {audience} için güven veren, net ve doğrudan bir ton seçilir.',
    'Kurumsal sorumluluk ve kararlılık hikâyesi. {audience} nezdinde net, omurgalı bir anlatım; {product} güçlü bir çözüm olarak konumlanır.',
  ],
  surpriz: [
    'İlk 3 saniyede izleyiciyi şaşırtan bir açılış; {audience} için beklenen senaryoyu kıran bir kurgu. {product}, ters köşe gagonun merkezinde yer alır.',
    'Normal bir {audience} sahnesiyle başlar; {product} göründüğü anda sahne evreni değişir. Kampanya, sosyal medyada tekrar izleme isteği yaratacak şekilde kurgulanır.',
  ],
}

const STRATS: Record<AdStyle, string[]> = {
  duygusal: [
    'Tempo yavaş başlar; yakın detay planlarıyla sıcaklık hissi inşa edilir. Müzik ve ses tasarımı anlatının omurgasıdır; marka adı son saniyeye kadar telaffuz edilmez.',
  ],
  sinematik: [
    'Yavaş girişler ve hızlı kesmeler kontrast oluşturur; tek bir merkezi görsel fikir (Big Idea) tüm planlara kaynaklık eder. Diyalog minimum düzeyde tutulur.',
  ],
  mizah: [
    'İlk 2 saniyede gülme isteği uyandırılır; tekrar edilebilir bir gag yapısı kurularak hatırlanabilirlik artırılır. Her esprinin ürünün faydasına bağlandığından emin olunur.',
  ],
  kurumsal: [
    'Her 5 saniyede bir mesaj noktası; tipografik genel planlar veri vurgusu için destekleyici kullanılır. Güven inşa etme sırası: problem, çözüm, sonuç.',
  ],
  surpriz: [
    'Beklenmedik açılış ilk 2 saniyede tamamlanır; izleyicinin sorusunun cevabı kapanış sahnesinde net biçimde verilir. Dönüş, diğer mecralarda farklı açıdan tekrar anlatılır.',
  ],
}

const SLOGANS: Record<AdStyle, string[]> = {
  duygusal: ['Kalbin en iyi anları.', 'Hissedilen her şeyin parçası.', 'Hikâyenizin yanında.', 'Yanınızda, her seferinde.'],
  sinematik: ['Aksiyonu başlat.', 'Ölçek büyük, karar senin.', 'Anları kare kare.', 'Sahne senin.'],
  mizah: ['O kadar iyi ki...', 'Ciddi olmayın.', 'Tam gereken bu.', 'Denemeye değer, cidden.'],
  kurumsal: ['Ölçülebilir, güvenilir.', 'Verinin şekline güvenin.', 'Standart sınır tanımaz.', 'Ortak değer, ortak gelişim.'],
  surpriz: ['Beklenmeyenin peşine.', 'Sürpriz daha kalıcı.', 'Skor senin.', 'Şimdi değişir.'],
}

const SHOTS: Record<AdStyle, string[]> = {
  duygusal: [
    'Sabah ışığı pencereden süzülür; kahraman uyanır ve gülümser.',
    'Kahraman {product} ürününe dokunur; ürünün detay planı belirir.',
    'Yüzü kameraya döner; hafif bir rahatlama ifadesi.',
    'Anlamlı kapanış; ürün adı ekranda belirir.',
  ],
  sinematik: [
    'Karanlık sahne; tek bir ışık huzmesi {product} ürününe düşer.',
    'Hızlı kesmeler: ürün farklı açılardan dramatik planlarda.',
    'Kamera geniş plana açılır; ortam büyük görünürlükte.',
    'Sert kontrastla logo vurgusu; tepe altyazı belirir.',
  ],
  mizah: [
    'Karakter sırıtır; beklenmedik bir şey olur.',
    'Karakter {product} ürününe dikkatle bakar; komik bir ilk reaksiyon.',
    'Karşı karakter güler; fiziksel komedi nokta atışı.',
    'Ürün kapanışı: eğlenceli bir cta yazısı.',
  ],
  kurumsal: [
    'Modern ofis ortamında {product} ürünü net bir vurguda.',
    'Başlıklar ve verilerle desteklenen görseller.',
    'Kullanıcı yorumları kısa ve net iletir.',
    'Net bir logo kapanışı; iletişim bilgileri eklenir.',
  ],
  surpriz: [
    'Beklenmedik bir açılış; izleyicide sert bir ilk tepki yaratılır.',
    'Beklenti kırıldığı an; {product} göründüğünde sahne değişir.',
    'Tempo hızlanır; merak hissi tepe noktaya çıkar.',
    'Marka kapanışında net slogan; son detay gizli.',
  ],
}

const AUDIO: Record<AdStyle, string[]> = {
  duygusal: ['Yumuşak piyano ve doğal ambiyans', 'Sıcak strings, hafif nal sesi', 'Kalp atışı ritmi, yükselen motif', 'Jingle leitmotiv'],
  sinematik: ['Derin bass, gerginlik yükselir', 'Pad, sürekli gerilim', 'Epik yolculuk temasi', 'Kapanışta davul vurgusu'],
  mizah: ['Quirky perküsyon', 'Yüksek sesler, kayıt efekti', 'Kitsch orkestra dokunuşu', 'Presto jingle'],
  kurumsal: ['Minimal kurumsal motif', 'Staccato çizelge', 'Net elektro tema', 'Güven veren jingle'],
  surpriz: ['Ritim ani değişir', 'Ani sessizlik vurgusu', 'Elektronik synth motif', 'Reset jingle'],
}

const LIGHTS: Record<AdStyle, string[]> = {
  duygusal: ['Yumuşak doğal ışık, sıcak tonlar', 'Altın saat, pencere ışığı', 'Sıcak anahtar ışık', 'Düşük sıcak iç ışık'],
  sinematik: ['Yüksek kontrast, tek kaynak', 'Soğuk sert ışık', 'Dramatik rim ışık', 'Gölge ağırlıklı plan'],
  mizah: ['Parlak eşit ışık', 'Canlı ve doygun ton', 'Flat ışık, renkli zemin', 'Yüksek anahtar ışık'],
  kurumsal: ['Eşit ofis aydınlatması', 'Sıcak ve net tonlar', 'Beyaz teknik ışık', 'Detay vurgulu ürün ışığı'],
  surpriz: ['Işık ani değişir', 'Renk paleti sıçraması', 'Kontrastlamış iki ton', 'Flicker vurgusu'],
}

const TRANSITIONS: Record<AdStyle, string[]> = {
  duygusal: ['Yavaş kesme', 'Crossfade', 'Yumuşak geçiş', 'Fade'],
  sinematik: ['Sert cut', 'Whip pan', 'Match cut', 'Speed ramp'],
  mizah: ['Hızlı cut', 'Jump cut', 'Zoom punch', 'Snap cut'],
  kurumsal: ['Straight cut', 'Wipe', 'Typo geçiş', 'Fade'],
  surpriz: ['Ani kesme', 'Smash cut', 'Glitch cut', 'Cut'],
}

const CTAS: Record<AdStyle, string[]> = {
  duygusal: ['Hikâyenize başlayın.', 'Yakın kalın.', 'Şimdi hissedin.'],
  sinematik: ['Aksiyonu başlat.', 'Zirveye yürüyün.', 'Oyunu büyütün.'],
  mizah: ['Deneyin, pişman olmazsınız.', 'Bir de siz görün.', 'Hemen alın, gülün.'],
  kurumsal: ['Bugün iletişime geçin.', 'Farkı ölçün.', 'Teklif isteyin.'],
  surpriz: ['Şimdi deneyin.', 'Görmeliydiniz.', 'Bu sefer durmayın.'],
}

const fill = (tpl: string, input: AIInput) =>
  tpl
    .replaceAll('{brand}', input.brand)
    .replaceAll('{product}', input.product)
    .replaceAll('{audience}', input.audience)
    .replaceAll('{objective}', input.objective)

const clean = (s: string) => s.replace(/\s{2,}/g, ' ').trim()

const shotTimes = (len: ScriptLength, index: number, count: number): [number, number] => {
  const per = len / count
  return [Math.round(index * per), Math.round((index + 1) * per)]
}

export function generateConceptLocal(input: AIInput): AIConcept {
  const seed = hash(
    `${input.brand}|${input.product}|${input.audience}|${input.objective}|${input.style}|${input.length}`,
  )
  const style = input.style

  const headline = clean(fill(pick(HEADLINES[style], seed, 1), input))
  const concept = clean(fill(pick(CONCEPT_TEXTS[style], seed, 2), input))
  const strategy = clean(fill(pick(STRATS[style], seed, 3), input))

  const sloganSet = new Set<string>()
  for (let i = 0; i < 4; i++) sloganSet.add(clean(fill(pick(SLOGANS[style], seed, i + 2), input)))
  const slogans = [...sloganSet].slice(0, 4)

  const shotsCount = input.length === 30 ? 5 : input.length === 15 ? 4 : 3
  const shots: ScriptShot[] = []
  for (let i = 0; i < shotsCount; i++) {
    const [from, to] = shotTimes(input.length, i, shotsCount)
    shots.push({
      from,
      to,
      visual: clean(fill(pick(SHOTS[style], seed, i), input)),
      audio: clean(pick(AUDIO[style], seed, i + 1)),
    })
  }

  const conceptName = clean(pick(CONCEPT_NAMES[style], seed, 5))
  const script = {
    length: input.length,
    style,
    shots,
    ctaText: clean(pick(CTAS[style], seed, 4)),
  }

  return {
    headline: `${headline}`,
    concept: `${conceptName}: ${concept}`,
    strategy,
    slogans,
    script,
    style,
  }
}
