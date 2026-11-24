import { useEffect, useState } from 'react'
import { useStore } from '../store/store'
import type { AIConcept, AdStyle, ScriptLength } from '../types'
import { CopyButton, EmptyState } from '../components/ui'
import { STYLE_OPTIONS, type AIInput } from '../ai/engine'
import { fetchAIStatus, generateConcept, type AI_SOURCE, type AIStatus } from '../ai/service'
import { IconSpark } from '../components/icons'

const LENGTH_OPTIONS: { value: ScriptLength; label: string }[] = [
  { value: 10, label: '10 saniye' },
  { value: 15, label: '15 saniye' },
  { value: 30, label: '30 saniye' },
]

function ConceptPanel({ concept, source }: { concept: AIConcept; source: AI_SOURCE }) {
  const scriptFull = concept.script.shots
    .map((s) => `[${s.from}-${s.to} sn] GÖRSEL: ${s.visual}\nSESLER: ${s.audio}`)
    .join('\n\n')
  const fullText = [
    `BAŞLIK: ${concept.headline}`,
    ``,
    `KONSEPT: ${concept.concept}`,
    ``,
    `YARATICI STRATEJİ: ${concept.strategy}`,
    ``,
    `SLOGANLAR:`,
    ...concept.slogans.map((s) => `- ${s}`),
    ``,
    `${concept.script.length} SANİYELİK SENARYO:`,
    scriptFull,
    ``,
    `CTA: ${concept.script.ctaText}`,
  ].join('\n')

  return (
    <div className="stack">
      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="card-title">
            <IconSpark width={16} height={16} className="lime" style={{ marginRight: 8 }} />
            Kampanya Konsepti
          </div>
          <CopyButton text={fullText} label="Tümünü Kopyala" />
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>{concept.headline}</h2>
        <div className="output-block">{concept.concept}</div>
        <div className="card-sub" style={{ margin: '16px 0 8px' }}>Yaratıcı Strateji</div>
        <div className="output-block">{concept.strategy}</div>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="card-title">Slogan Önerileri</div>
          <CopyButton text={concept.slogans.join('\n')} label="Sloganları Kopyala" />
        </div>
        <div className="slogan-list">
          {concept.slogans.map((s, i) => (
            <div className="slogan-item" key={i}>
              <span>“{s}”</span>
              <CopyButton text={s} label="" />
            </div>
          ))}
        </div>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="card-title">
            {concept.script.length} Saniyelik Video Senaryosu
          </div>
          <CopyButton text={`${concept.script.length} sn — ${concept.script.style}\n${scriptFull}\nCTA: ${concept.script.ctaText}`} label="Senaryoyu Kopyala" />
        </div>
        <div>
          {concept.script.shots.map((shot, i) => (
            <div className="script-shot" key={i}>
              <div className="shot-time mono">
                {shot.from}–{shot.to} sn
              </div>
              <div>
                <div className="shot-label">Görsel</div>
                <div className="muted" style={{ fontSize: 13 }}>{shot.visual}</div>
              </div>
              <div>
                <div className="shot-label">Ses</div>
                <div className="muted" style={{ fontSize: 13 }}>{shot.audio}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="notice" style={{ marginTop: 14 }}>
          <strong className="lime">CTA:</strong> {concept.script.ctaText}
        </div>
        <div className="pen-note" style={{ marginTop: 14 }}>
          Üretim kaynağı: {source === 'api' ? 'harici üretken model (sunucu taraflı anahtar ile)' : 'yerleşik şablon motoru — API anahtarı tanımlarsanız aynı kompozisyon gerçek modelle üretilir.'}
        </div>
      </section>
    </div>
  )
}

export default function AIDirector() {
  const { state, dispatch } = useStore()
  const [brand, setBrand] = useState('')
  const [product, setProduct] = useState('')
  const [audience, setAudience] = useState('')
  const [objective, setObjective] = useState('')
  const [style, setStyle] = useState<AdStyle>('sinematik')
  const [length, setLength] = useState<ScriptLength>(30)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [source, setSource] = useState<AI_SOURCE>('yerel')
  const [aiStatus, setAIStatus] = useState<AIStatus>({ mode: 'yerel', provider: 'yerleşik şablon motoru' })

  const workspaceKey = `${brand}|${style}`.toLowerCase()

  useEffect(() => {
    fetchAIStatus().then(setAIStatus)
  }, [])

  const saved: AIConcept | undefined = state.workspaces[workspaceKey]

  const generate = async () => {
    if (!brand.trim() || !product.trim()) {
      setNotice('Marka ve ürün alanları zorunludur.')
      return
    }
    setNotice(null)
    setLoading(true)
    const input: AIInput = { brand, product, audience, objective, style, length }
    const result = await generateConcept(input)
    setSource(result.source)
    const concept = { ...result.concept, style }
    dispatch({ type: 'ai/store', key: workspaceKey, concept: concept as never })
    if (result.error) setNotice(result.error)
    setLoading(false)
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">AI Workspace</div>
          <h1 className="page-title">AI Yaratıcı Yönetmen</h1>
          <p className="page-desc">
            Brief girin; konsept, kampanya fikirleri, yaratıcı strateji, sloganlar ve saniye bazlı video senaryosu üretin.
          </p>
        </div>
        <span className="badge badge-lime">
          {aiStatus.mode === 'api' ? 'Üretken model bağlı' : 'Yerel şablon motoru'}
        </span>
      </div>

      <div className="grid grid-main-side">
        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Brief</div>
            <div className="form-grid form-cols-2">
              <div className="field">
                <label>Marka *</label>
                <input
                  className="input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="örn. Kavun Kahve"
                />
              </div>
              <div className="field">
                <label>Ürün / Hizmet *</label>
                <input
                  className="input"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="örn. Soğuk demleme kahve serisi"
                />
              </div>
              <div className="field">
                <label>Hedef Kitle</label>
                <input
                  className="input"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="örn. 25-40 yaş şehirli profesyoneller"
                />
              </div>
              <div className="field">
                <label>Reklam Hedefi</label>
                <input
                  className="input"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="örn. Yeni serinin bilinirliğini artırmak"
                />
              </div>
            </div>

            <div className="card-sub" style={{ margin: '18px 0 10px' }}>Reklam Stili</div>
            <div className="chip-row">
              {STYLE_OPTIONS.map(([key, meta]) => (
                <button
                  key={key}
                  className={`style-chip${style === key ? ' active' : ''}`}
                  onClick={() => setStyle(key)}
                  title={meta.desc}
                  type="button"
                >
                  {meta.label}
                </button>
              ))}
            </div>
            <div className="pen-note" style={{ marginTop: 10 }}>
              {STYLE_OPTIONS.find(([k]) => k === style)?.[1].desc}
            </div>

            <div className="card-sub" style={{ margin: '18px 0 10px' }}>Senaryo Süresi</div>
            <div className="chip-row">
              {LENGTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`style-chip${length === opt.value ? ' active' : ''}`}
                  onClick={() => setLength(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: 20 }}>
              <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading}>
                <IconSpark width={16} height={16} />
                {loading ? 'Üretiliyor...' : 'Konsept Üret'}
              </button>
            </div>
            {notice && (
              <div className="pen-note" style={{ marginTop: 14, color: 'var(--amber)' }}>
                {notice}
              </div>
            )}
          </section>

          {loading && (
            <section className="card card-pad">
              <div className="thinking">
                <div className="thinking-dots">
                  <span /><span /><span />
                </div>
                <div className="muted">Yaratıcı yönetmen fikirleri işliyor...</div>
              </div>
            </section>
          )}

          {!loading && saved && <ConceptPanel concept={saved} source={source} />}

          {!loading && !saved && (
            <section className="card">
              <EmptyState
                icon="✦"
                title="Henüz konsept üretilmedi"
                desc="Brief alanlarını doldurun, bir reklam stili ve senaryo süresi seçin; konsept, sloganlar ve senaryo burada görünür."
              />
            </section>
          )}
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Nasıl Çalışır?</div>
            <ol className="muted" style={{ paddingLeft: 18, margin: 0, display: 'grid', gap: 10, fontSize: 13 }}>
              <li>Marka, ürün, hedef kitle ve reklam hedefini girin.</li>
              <li>Duygusal, sinematik, mizahi, kurumsal veya sürpriz stilden birini seçin.</li>
              <li>10, 15 veya 30 saniyelik senaryo süresini belirleyin.</li>
              <li>Konsepti, sloganları ve senaryoyu tek tuşla kopyalayın.</li>
            </ol>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>AI Modu</div>
            <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
              Uygulama, anahtar gerektirmeyen yerleşik bir şablon motoruyla çalışır: stillere göre yapılandırılmış konsept ve senaryo kalıpları üretir.
            </p>
            <p className="muted" style={{ fontSize: 13 }}>
              Gerçek bir üretken model kullanmak için sunucu tarafında <code className="lime">.env</code> dosyasına API anahtarınızı tanımlayın ve proxy sunucusunu başlatın. Anahtar tarayıcıya asla gönderilmez. Detaylar README dosyasında.
            </p>
            <div className="pen-note">
              Mevcut mod: <strong>{aiStatus.mode === 'api' ? 'harici model' : 'yerel motor'}</strong>
              <br />
              Anahtar olmadığında üretilen içerik şablon tabanlıdır ve gerçek model çıktısı değildir.
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 8 }}>Son Kavramlar</div>
            {Object.entries(state.workspaces).length === 0 && (
              <p className="faint" style={{ fontSize: 13 }}>Bu oturumda üretilen konsept burada listelenir.</p>
            )}
            {Object.entries(state.workspaces)
              .slice(-5)
              .reverse()
              .map(([key, c]) => (
                <button
                  key={key}
                  className="row-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'default', color: 'inherit' }}
                  type="button"
                >
                  <div className="row-main">
                    <div className="row-title" style={{ fontSize: 13 }}>{c.headline}</div>
                    <div className="row-sub">{STYLE_OPTIONS.find(([k]) => k === c.style)?.[1].label} · {c.script.length} sn</div>
                  </div>
                </button>
              ))}
          </section>
        </div>
      </div>
    </>
  )
}
