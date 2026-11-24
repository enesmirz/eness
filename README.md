# CREATIVE STUDIO

Premium, karanlık temalı yaratıcı ajans yönetim platformu. React 18 + TypeScript + Vite ile geliştirildi; tüm veriler tarayıcıda `localStorage` üzerinde kalıcı olarak saklanır.

## Modüller

| Modül | Açıklama |
|---|---|
| **Panel** | Aktif proje, müşteri, tamamlanan iş ve bekleyen görev istatistikleri; son hareketler; yaklaşan teslimler; durum dağılımı |
| **AI Yaratıcı Yönetmen** | Marka/ürün/kitle/hedef girişiyle konsept, strateji, slogan ve 10/15/30 sn senaryo üretimi; 5 reklam stili; kopyalama düğmeleri |
| **Storyboard Stüdyo** | Sahne bazlı planlama (süre, kamera, ışık, ses, geçiş), görsel zaman çizelgesi, düzenleme ve sıralama |
| **Marka Lab** | İsim/slogan üretici, konumlandırma, renk paleti, tipografi önerileri, görsel kimlik konsepti |
| **Müşteriler** | CRUD + projelere bağlama |
| **Projeler** | CRUD, durum akışı (Planlama → Devam → Revizyon → Tamamlandı), bütçe/teslim takibi, görev listeleri, proje detay sayfası |
| **Teklif Oluşturucu** | Hizmet satırları, otomatik toplamlar, baskıya hazır (print/PDF) teklif dokümanı |

## Çalıştırma

```bash
npm install
npm run dev          # http://localhost:5173
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## AI Kurulumu (opsiyonel ama önerilir)

Uygulama **anahtar gerekmeyen yerleşik bir şablon motoruyla** gelir; bu mod açıkça "yerel motor" olarak etiketlenir — gerçek bir model çıktısı taklit etmez.

Gerçek üretken model bağlamak için:

1. `.env.example` dosyasını `.env` olarak kopyalayın.
2. `ANTHROPIC_API_KEY` **veya** `OPENAI_API_KEY` değerini girin (opsiyonel: `AI_MODEL`).
3. Proxy sunucusunu başlatın:

```bash
npm run server      # http://localhost:8787
```

4. Vite dev sunucusu `/api/ai/*` isteklerini otomatik olarak bu sunucuya yönlendirir (`vite.config.ts`). `npm run dev:all` ile ikisini birlikte çalıştırabilirsiniz.

**Güvenlik:** API anahtarı yalnızca `server/ai-proxy.mjs` içinde, `.env` üzerinden okunur. Anahtar tarayıcıya, derlenen pakete veya `localStorage`'a hiçbir koşulda yazılmaz. `.env` dosyası `.gitignore` ile hariç tutulur.

## Mimari

```
src/
  ai/          → yerel üretim motorları + API servis katmanı
  components/  → Layout, ikonlar, yeniden kullanılabilir UI parçaları
  data/        → gerçekçi demo verisi
  pages/       → 7 modül sayfası (Dashboard, AIDirector, Storyboard, BrandLab, Clients, Projects, ProjectDetail, Proposals)
  store/       → reducer tabanlı merkezi state + localStorage kalıcılığı + aktivite günlüğü
  styles/      → tek dosyalık tasarım sistemi (koyu tema, elektrik lime vurgu)
server/        → anahtar barındıran AI proxy (Node, bağımlılıksız)
```
