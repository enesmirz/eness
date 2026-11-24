import type { StoryboardScene } from '../types'

const hash = (s: string) => {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}
const at = <T,>(arr: T[], h: number, salt: number): T => arr[(h + salt * 7) % arr.length]

const CAMERAS = ['Geniş plan / statik', 'Detay / macro', 'Orta plan / dolly in', 'Orbit / takip', 'Üst çekim (top shot)', 'Göz hizası / handheld']
const LIGHTS = ['Yumuşak doğal ışık', 'Yüksek kontrast tek kaynak', 'Sıcak anahtar ışık', 'Soğuk sert ışık', 'Eşit düz aydınlatma', 'Altın saat tonları']
const SOUNDS = ['Ambiyans + yükselen müzik', 'Ses efekti odaklı (diegetic)', 'Narration + minimal müzik', 'Ritmik perküsyon', 'Ani sessizlik vurgusu']
const TRANSITIONS = ['Cut', 'Crossfade', 'Whip pan', 'Match cut', 'Speed ramp', 'Fade out']
const VISUALS = [
  'Açılışta ortam tanıtılır; ürün/hizmet kareye girer.',
  'Ürünün kullanımı yakın planda gösterilir; detay dokusu ön plana çıkar.',
  'Karakter ürünle etkileşir; yüz ifadesinde memnuniyet belirir.',
  'Hızlı kesmelerle faydalar sıralanır; ekranda kısa tipografik vurgular.',
  'Farklı kullanıcı bağlamlarından kısa kesitler; çeşitlilik hissi.',
  'Ürün ve logo kapanışı; net bir eylem çağrısı metni belirir.',
]

export function generateScenesLocal(brief: string, totalDuration: number, sceneCount: number): StoryboardScene[] {
  const h = hash(brief.trim() || 'brief')
  const scenes: StoryboardScene[] = []
  const per = Math.round(totalDuration / sceneCount)
  for (let i = 0; i < sceneCount; i++) {
    scenes.push({
      id: `sc${Date.now().toString(36)}${i}${Math.random().toString(36).slice(2, 5)}`,
      duration: i === sceneCount - 1 ? totalDuration - per * (sceneCount - 1) : per,
      camera: at(CAMERAS, h, i),
      visual: `${i + 1}. ${at(VISUALS, h, i)}`,
      lighting: at(LIGHTS, h, i + 1),
      sound: at(SOUNDS, h, i + 2),
      transition: at(TRANSITIONS, h, i + 3),
    })
  }
  return scenes
}
