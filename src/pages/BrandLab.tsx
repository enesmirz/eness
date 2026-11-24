import { useState } from 'react'
import { useStore } from '../store/store'
import type { BrandPack } from '../types'
import { CopyButton } from '../components/ui'
import { generateBrandPackLocal } from '../ai/brand'
import { IconPalette, IconSpark } from '../components/icons'

const TONES = [
  { key: 'modernen', label: 'Modern' },
  { key: 'lüks', label: 'Lüks / Premium' },
  { key: 'sıcak', label: 'Sıcak / Samimi' },
]

function PackView({ pack }: { pack: BrandPack }) {
  return (
    <div className="stack">
      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="card-title">Marka İsimleri</div>
          <CopyButton text={pack.names.join('\n')} />
        </div>
        <div className="slogan-list">
          {pack.names.map((n) => (
            <div className="slogan-item" key={n}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{n}</span>
              <CopyButton text={n} label="" />
            </div>
          ))}
        </div>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="card-title">Slogan Önerileri</div>
          <CopyButton text={pack.slogans.join('\n')} />
        </div>
        <div className="slogan-list">
          {pack.slogans.map((s) => (
            <div className="slogan-item" key={s}>
              <span>“{s}”</span>
              <CopyButton text={s} label="" />
            </div>
          ))}
        </div>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 12 }}>
          <div className="card-title">Marka Konumlandırma</div>
          <CopyButton text={pack.positioning} />
        </div>
        <div className="output-block">{pack.positioning}</div>
      </section>

      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 14 }}>Renk Paleti — {pack.palette.name}</div>
        <div className="swatch-row">
          {pack.palette.colors.map((c) => (
            <div key={c} className="swatch" style={{ background: c }}>
              <span style={{ color: ['#0f1320', '#1c2438', '#2a2d25', '#5c6147', '#2b1d16', '#54321e', '#12211c', '#1e3a31', '#141414', '#2e2e2e', '#191426', '#2e2545'].includes(c) ? '#fff' : '#15150f' }}>
                {c.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        <div className="pen-note" style={{ marginTop: 12 }}>
          Soldan sağa: koyu zemin → ara tonlar → vurgu/açık. Vurgu rengi CTA ve önemli verilerde sınırlı kullanılmalı.
        </div>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 12 }}>
          <div className="card-title">Tipografi</div>
          <CopyButton text={`${pack.typography.primary} + ${pack.typography.secondary}\n${pack.typography.usage}`} />
        </div>
        <div className="grid grid-2">
          <div className="scene-field">
            <div className="scene-field-label">Birincil (Başlık)</div>
            <div className="scene-field-value" style={{ fontSize: 17, fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {pack.typography.primary}
            </div>
          </div>
          <div className="scene-field">
            <div className="scene-field-label">İkincil (Gövde)</div>
            <div className="scene-field-value" style={{ fontSize: 15 }}>
              {pack.typography.secondary}
            </div>
          </div>
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>{pack.typography.usage}</p>
      </section>

      <section className="card card-pad">
        <div className="spread" style={{ marginBottom: 12 }}>
          <div className="card-title">Görsel Kimlik Konsepti</div>
          <CopyButton text={pack.visualIdentity} />
        </div>
        <div className="output-block">{pack.visualIdentity}</div>
      </section>
    </div>
  )
}

export default function BrandLab() {
  const { state, dispatch } = useStore()
  const [sector, setSector] = useState('')
  const [tone, setTone] = useState('modernen')
  const [pending, setPending] = useState<BrandPack | null>(null)
  const saved = Object.values(state.brandPacks)
  const last = saved[saved.length - 1]

  const generate = () => {
    const pack = generateBrandPackLocal(sector, tone === 'modernen' ? 'modern' : tone)
    setPending(pack)
    const key = `pack-${Date.now().toString(36)}`
    dispatch({ type: 'brand/store', key, pack })
    setSector('')
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">Kimlik Atölyesi</div>
          <h1 className="page-title">Marka Lab</h1>
          <p className="page-desc">
            İsim, slogan, konumlandırma, renk paleti, tipografi ve görsel kimlik konsepti — tek pakette.
          </p>
        </div>
      </div>

      <div className="grid grid-main-side">
        <div className="stack">
          {pending ? <PackView pack={pending} /> : last ? (
            <PackView pack={last} />
          ) : (
            <section className="card">
              <div className="empty">
                <div className="empty-icon"><IconPalette width={22} height={22} /></div>
                <div className="empty-title">Henüz paket üretilmedi</div>
                <p>Sektörü yazıp ton seçin; eksiksiz bir marka kimlik paketi burada görünür.</p>
              </div>
            </section>
          )}
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Kimlik Paketi Üret</div>
            <div className="form-grid">
              <div className="field">
                <label>Sektör /Alan</label>
                <input
                  className="input"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="örn. kahve zinciri, fintech, moda"
                />
              </div>
              <div className="field">
                <label>Marka Tonu</label>
                <div className="chip-row" style={{ marginTop: 4 }}>
                  {TONES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`style-chip${tone === t.key ? ' active' : ''}`}
                      onClick={() => setTone(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" onClick={generate}>
                <IconSpark width={15} height={15} /> Kimlik Paketi Üret
              </button>
            </div>
          </section>

          {saved.length > 0 && (
            <section className="card card-pad">
              <div className="card-title" style={{ marginBottom: 8 }}>Üretilen Paketler</div>
              {[...saved].reverse().slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPending(p)}
                  className="row-item"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'inherit', cursor: 'pointer', padding: '10px 4px' }}
                >
                  <div className="row-main">
                    <div className="row-title" style={{ fontSize: 13 }}>{p.names[0]}</div>
                    <div className="row-sub">{p.palette.name} · {p.typography.primary}</div>
                  </div>
                </button>
              ))}
            </section>
          )}
        </div>
      </div>
    </>
  )
}
