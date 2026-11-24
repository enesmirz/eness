import { useMemo, useState } from 'react'
import { useStore, uid } from '../store/store'
import type { Storyboard, StoryboardScene } from '../types'
import { ConfirmDialog, EmptyState, Field, Modal, formatDate } from '../components/ui'
import { generateScenesLocal } from '../ai/storyboard'
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconFilm,
  IconPlus,
  IconSpark,
  IconTrash,
} from '../components/icons'

const CAMERA_OPTIONS = [
  'Geniş plan / statik',
  'Detay / macro',
  'Orta plan / dolly in',
  'Orbit / takip',
  'Üst çekim (top shot)',
  'Göz hizası / handheld',
]
const TRANSITION_OPTIONS = ['Cut', 'Crossfade', 'Whip pan', 'Match cut', 'Speed ramp', 'Fade out', 'Ani kesme']
const LIGHTING_OPTIONS = [
  'Yumuşak doğal ışık',
  'Yüksek kontrast tek kaynak',
  'Sıcak anahtar ışık',
  'Soğuk sert ışık',
  'Eşit düz aydınlatma',
  'Altın saat tonları',
]

interface SceneDraft extends Omit<StoryboardScene, 'id'> {
  id?: string
}

function SceneModal({
  open,
  scene,
  onClose,
  onSave,
}: {
  open: boolean
  scene: SceneDraft | null
  onClose: () => void
  onSave: (s: SceneDraft) => void
}) {
  const [draft, setDraft] = useState<SceneDraft | null>(scene)
  const d = draft ?? scene!
  const set = (k: keyof SceneDraft, v: string | number) => setDraft({ ...d, [k]: v })

  return (
    <Modal
      title="Sahne Düzenle"
      open={open}
      onClose={onClose}
      large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              onSave(d)
              setDraft(null)
            }}
          >
            Sahneyi Kaydet
          </button>
        </>
      }
    >
      <div className="form-grid form-cols-2">
        <Field label="Süre (saniye)">
          <input
            className="input"
            type="number"
            min={1}
            max={120}
            value={d.duration}
            onChange={(e) => set('duration', Math.max(1, Number(e.target.value) || 0))}
          />
        </Field>
        <Field label="Geçiş">
          <select className="select" value={d.transition} onChange={(e) => set('transition', e.target.value)}>
            {TRANSITION_OPTIONS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-grid" style={{ marginTop: 14 }}>
        <Field label="Kamera Açısı">
          <input
            className="input"
            list="camera-list"
            value={d.camera}
            onChange={(e) => set('camera', e.target.value)}
          />
          <datalist id="camera-list">
            {CAMERA_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Işık">
          <input
            className="input"
            list="light-list"
            value={d.lighting}
            onChange={(e) => set('lighting', e.target.value)}
          />
          <datalist id="light-list">
            {LIGHTING_OPTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Görsel Açıklama">
          <textarea className="textarea" value={d.visual} onChange={(e) => set('visual', e.target.value)} />
        </Field>
        <Field label="Ses Efektleri">
          <textarea
            className="textarea"
            style={{ minHeight: 70 }}
            value={d.sound}
            onChange={(e) => set('sound', e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}

export default function Storyboard() {
  const { state, dispatch } = useStore()
  const [confirm, setConfirm] = useState<string | null>(null)
  const [sceneModal, setSceneModal] = useState<{ sbId: string; scene: SceneDraft; index: number | null } | null>(null)
  const [openId, setOpenId] = useState<string | null>(state.storyboards[0]?.id ?? null)
  const [filter, setFilter] = useState('')

  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [brief, setBrief] = useState('')
  const [totalDuration, setTotalDuration] = useState(30)
  const [sceneCount, setSceneCount] = useState(5)

  const visible = useMemo(
    () =>
      state.storyboards.filter(
        (s) =>
          s.title.toLowerCase().includes(filter.toLowerCase()) ||
          s.client.toLowerCase().includes(filter.toLowerCase()),
      ),
    [state.storyboards, filter],
  )

  const current = state.storyboards.find((s) => s.id === openId) ?? visible[0]
  const totalSecs = current?.scenes.reduce((a, s) => a + s.duration, 0) ?? 0

  const createBoard = () => {
    if (!title.trim()) return
    const scenes = generateScenesLocal(brief, totalDuration || sceneCount * 6, sceneCount)
    const sb: Storyboard = {
      id: uid('sb'),
      title: title.trim(),
      brief,
      client,
      scenes,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'storyboard/save', storyboard: sb })
    setOpenId(sb.id)
    setTitle('')
    setBrief('')
  }

  const updateStoryboard = (sb: Storyboard) => dispatch({ type: 'storyboard/save', storyboard: sb })

  const moveScene = (sb: Storyboard, index: number, dir: -1 | 1) => {
    const scenes = [...sb.scenes]
    const target = index + dir
    if (target < 0 || target >= scenes.length) return
    ;[scenes[index], scenes[target]] = [scenes[target], scenes[index]]
    updateStoryboard({ ...sb, scenes })
  }

  const saveScene = () => {
    if (!sceneModal || !current) return
    const scenes = [...current.scenes]
    const saved: StoryboardScene = { ...sceneModal.scene, id: sceneModal.scene.id ?? uid('sc') }
    if (sceneModal.index === null) scenes.push(saved)
    else scenes[sceneModal.index] = saved
    updateStoryboard({ ...current, scenes })
    setSceneModal(null)
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">Prodüksiyon</div>
          <h1 className="page-title">Storyboard Stüdyo</h1>
          <p className="page-desc">
            Sahne sahne reklam akışı planlayın: süre, kamera, ışık, ses ve geçiş. Sahneleri düzenleyin, sıralayın.
          </p>
        </div>
      </div>

      <div className="grid grid-main-side">
        <div className="stack">
          {current ? (
            <>
              <section className="card card-pad">
                <div className="spread">
                  <div>
                    <div className="card-title">{current.title}</div>
                    <div className="card-sub">
                      {current.client || 'Müşteri atanmadı'} · {current.scenes.length} sahne · {totalSecs} sn toplam · {formatDate(current.createdAt)}
                    </div>
                  </div>
                  <div className="toolbar">
                    <button
                      className="btn btn-sm"
                      onClick={() => setSceneModal({ sbId: current.id, scene: { duration: 5, camera: CAMERA_OPTIONS[0], visual: '', lighting: LIGHTING_OPTIONS[0], sound: '', transition: 'Cut' }, index: null })}
                    >
                      <IconPlus width={13} height={13} /> Sahne Ekle
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => setConfirm(current.id)}>
                      <IconTrash width={13} height={13} /> Sil
                    </button>
                  </div>
                </div>
                {current.brief && (
                  <p className="muted" style={{ fontSize: 13.5, marginBottom: 0, marginTop: 12 }}>
                    {current.brief}
                  </p>
                )}
              </section>

              <section className="card card-pad">
                <div className="card-title" style={{ marginBottom: 12 }}>Zaman Çizelgesi</div>
                <div className="scene-bar-bg">
                  {current.scenes.map((s, i) => (
                    <div
                      key={s.id}
                      className="scene-bar"
                      style={{ flexGrow: s.duration }}
                      title={`Sahne ${i + 1} — ${s.duration} sn`}
                      onClick={() => setSceneModal({ sbId: current.id, scene: { ...s }, index: i })}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <div className="faint" style={{ fontSize: 11.5, marginTop: 8 }}>
                  Toplam {totalSecs} saniye — bir sahneye tıklayarak düzenleyin.
                </div>
              </section>

              <div className="timeline">
                {current.scenes.map((scene, i) => (
                  <div className="scene-card" key={scene.id}>
                    <div className="scene-head">
                      <div className="inline">
                        <span className="scene-num">SAHNE {String(i + 1).padStart(2, '0')}</span>
                        <span className="badge badge-lime">{scene.duration} sn</span>
                        <span className="badge">{scene.transition}</span>
                      </div>
                      <div className="row-side">
                        <button className="x-btn" title="Yukarı taşı" onClick={() => moveScene(current, i, -1)} disabled={i === 0}>
                          <IconArrowUp width={13} height={13} />
                        </button>
                        <button className="x-btn" title="Aşağı taşı" onClick={() => moveScene(current, i, 1)} disabled={i === current.scenes.length - 1}>
                          <IconArrowDown width={13} height={13} />
                        </button>
                        <button className="x-btn" title="Düzenle" onClick={() => setSceneModal({ sbId: current.id, scene: { ...scene }, index: i })}>
                          <IconEdit width={13} height={13} />
                        </button>
                        <button
                          className="x-btn"
                          title="Sil"
                          onClick={() =>
                            updateStoryboard({ ...current, scenes: current.scenes.filter((s) => s.id !== scene.id) })
                          }
                        >
                          <IconTrash width={13} height={13} />
                        </button>
                      </div>
                    </div>
                    <div className="scene-grid">
                      <div className="scene-field">
                        <div className="scene-field-label">Kamera Açısı</div>
                        <div className="scene-field-value">{scene.camera}</div>
                      </div>
                      <div className="scene-field">
                        <div className="scene-field-label">Işık</div>
                        <div className="scene-field-value">{scene.lighting}</div>
                      </div>
                      <div className="scene-field">
                        <div className="scene-field-label">Ses Efektleri</div>
                        <div className="scene-field-value">{scene.sound || '—'}</div>
                      </div>
                      <div className="scene-field" style={{ gridColumn: '1 / -1' }}>
                        <div className="scene-field-label">Görsel Açıklama</div>
                        <div className="scene-field-value">{scene.visual}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <section className="card">
              <EmptyState
                icon={<IconFilm width={22} height={22} />}
                title="Storyboard yok"
                desc="Yan panelden ilk storyboard'unuzu oluşturun; sahneler otomatik taslak olarak gelir."
              />
            </section>
          )}
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>Yeni Storyboard</div>
            <div className="form-grid">
              <Field label="Başlık *">
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="örn. Kavun Kahve — Sabah" />
              </Field>
              <Field label="Müşteri">
                <input
                  className="input"
                  list="client-list"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Müşteri seçin veya yazın"
                />
                <datalist id="client-list">
                  {state.clients.map((c) => (
                    <option key={c.id} value={c.company} />
                  ))}
                </datalist>
              </Field>
              <Field label="Brief">
                <textarea className="textarea" style={{ minHeight: 80 }} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Kısa sahne taslağı için brief özeti" />
              </Field>
              <div className="form-grid form-cols-2">
                <Field label="Toplam Süre (sn)">
                  <input className="input" type="number" min={5} max={180} value={totalDuration} onChange={(e) => setTotalDuration(Number(e.target.value) || 0)} />
                </Field>
                <Field label="Sahne Sayısı">
                  <input className="input" type="number" min={2} max={12} value={sceneCount} onChange={(e) => setSceneCount(Math.max(2, Number(e.target.value) || 0))} />
                </Field>
              </div>
              <button className="btn btn-primary" onClick={createBoard} disabled={!title.trim()}>
                <IconSpark width={15} height={15} /> Oluştur + Taslak Sahneler
              </button>
              <div className="pen-note">
                Brief metnine göre kamera, ışık, ses ve geçiş ön önerileri otomatik doldurulur; her sahne ayrıca düzenlenebilir.
              </div>
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title">
              <input className="input" style={{ padding: '8px 12px', fontSize: 13 }} placeholder="Storyboards ara..." value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <div className="row-list" style={{ marginTop: 12 }}>
              {visible.map((s) => (
                <button
                  key={s.id}
                  className="row-item"
                  type="button"
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'inherit', cursor: 'pointer', padding: '12px 8px', borderRadius: 8 }}
                  onClick={() => setOpenId(s.id)}
                >
                  <span className="nav-icon lime">
                    <IconFilm width={15} height={15} />
                  </span>
                  <div className="row-main">
                    <div className="row-title" style={{ fontSize: 13 }}>{s.title}</div>
                    <div className="row-sub">{s.client || '—'} · {s.scenes.length} sahne</div>
                  </div>
                </button>
              ))}
              {visible.length === 0 && <div className="faint" style={{ padding: 8 }}>Sonuç yok.</div>}
            </div>
          </section>
        </div>
      </div>

      {sceneModal && (
        <SceneModal
          open
          scene={sceneModal.scene}
          onClose={() => setSceneModal(null)}
          onSave={saveScene}
        />
      )}
      <ConfirmDialog
        open={confirm !== null}
        title="Storyboard Sil"
        message="Bu storyboard ve tüm sahneleri kalıcı olarak silinecek. Emin misiniz?"
        onConfirm={() => {
          if (confirm) dispatch({ type: 'storyboard/delete', id: confirm })
          setOpenId(null)
        }}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
