import { useMemo, useState } from 'react'
import { useStore, uid } from '../store/store'
import type { Proposal, ProposalService } from '../types'
import { ConfirmDialog, EmptyState, Field, Modal, TR_TRY, formatDate } from '../components/ui'
import { IconDoc, IconEdit, IconPlus, IconPrint, IconTrash } from '../components/icons'

const emptyNewProposal = (): Proposal => ({
  id: '',
  title: '',
  client: '',
  date: new Date().toISOString().slice(0, 10),
  validUntil: (() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })(),
  services: [],
  note: '',
  createdAt: '',
})

function totals(p: Proposal) {
  const subtotal = p.services.reduce((sum, s) => sum + s.quantity * s.price, 0)
  return { subtotal }
}

function ProposalEditor({
  open,
  proposal,
  onClose,
}: {
  open: boolean
  proposal: Proposal | null
  onClose: () => void
}) {
  const { state, dispatch } = useStore()
  const [draft, setDraft] = useState<Proposal>(proposal ?? emptyNewProposal())
  const [draftKey, setDraftKey] = useState<string>(proposal?.id ?? 'new')

  const currentKey = proposal?.id ?? 'new'
  if (open && currentKey !== draftKey) {
    setDraft(proposal ? { ...proposal } : emptyNewProposal())
    setDraftKey(currentKey)
  }

  if (!open) return null

  const set = <K extends keyof Proposal>(k: K, v: Proposal[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const { subtotal } = totals(draft)

  const addService = () =>
    set('services', [...draft.services, { id: uid('sv'), name: '', description: '', quantity: 1, price: 0 }])

  const updateService = (sid: string, patch: Partial<ProposalService>) =>
    set(
      'services',
      draft.services.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    )

  const removeService = (sid: string) =>
    set('services', draft.services.filter((s) => s.id !== sid))

  const save = () => {
    if (!draft.title.trim() || draft.services.length === 0) return
    const toSave: Proposal = {
      ...draft,
      id: draft.id || uid('po'),
      createdAt: draft.createdAt || new Date().toISOString(),
      services: draft.services.map((s) => ({ ...s, id: s.id || uid('sv') })),
    }
    dispatch({ type: 'proposal/save', proposal: toSave })
    onClose()
  }

  return (
    <Modal
      title={proposal ? 'Teklifi Düzenle' : 'Yeni Teklif'}
      open={open}
      onClose={onClose}
      large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={!draft.title.trim() || draft.services.length === 0}
          >
            Teklifi Kaydet
          </button>
        </>
      }
    >
      <div className="form-grid form-cols-2">
        <Field label="Teklif Başlığı *">
          <input className="input" value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="örn. Kimlik Yenileme Teklifi" />
        </Field>
        <Field label="Müşteri">
          <input
            className="input"
            list="proposal-client-list"
            value={draft.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Müşteri seçin veya yazın"
          />
          <datalist id="proposal-client-list">
            {state.clients.map((c) => (
              <option key={c.id} value={c.company} />
            ))}
          </datalist>
        </Field>
        <Field label="Teklif Tarihi">
          <input className="input" type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />
        </Field>
        <Field label="Geçerlilik Tarihi">
          <input className="input" type="date" value={draft.validUntil} onChange={(e) => set('validUntil', e.target.value)} />
        </Field>
      </div>

      <div className="card-sub" style={{ margin: '18px 0 10px' }}>Hizmetler</div>
      <div className="stack" style={{ gap: 10 }}>
        {draft.services.map((s) => (
          <div key={s.id} className="scene-field" style={{ padding: 14 }}>
            <div className="form-grid form-cols-2">
              <Field label="Hizmet Adı">
                <input className="input" value={s.name} onChange={(e) => updateService(s.id, { name: e.target.value })} placeholder="örn. Logo Tasarımı" />
              </Field>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 44px' }}>
                <Field label="Adet">
                  <input className="input" type="number" min={1} value={s.quantity} onChange={(e) => updateService(s.id, { quantity: Math.max(1, Number(e.target.value) || 1) })} />
                </Field>
                <Field label="Birim Fiyat (₺)">
                  <input className="input" type="number" min={0} value={s.price} onChange={(e) => updateService(s.id, { price: Math.max(0, Number(e.target.value) || 0) })} />
                </Field>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button className="x-btn" title="Satırı sil" onClick={() => removeService(s.id)}>
                    <IconTrash width={13} height={13} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <Field label="Açıklama">
                <input className="input" value={s.description} onChange={(e) => updateService(s.id, { description: e.target.value })} placeholder="Kısa kapsam tanımı" />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-sm" style={{ marginTop: 12 }} onClick={addService}>
        <IconPlus width={13} height={13} /> Hizmet Ekle
      </button>

      <div style={{ marginTop: 18 }}>
        <Field label="Not / Ödeme Koşulları">
          <textarea className="textarea" style={{ minHeight: 70 }} value={draft.note} onChange={(e) => set('note', e.target.value)} />
        </Field>
      </div>

      <div className="spread" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <span className="muted">Ara Toplam (KDV hariç)</span>
        <span className="badge badge-lime mono">{TR_TRY(subtotal)}</span>
      </div>
    </Modal>
  )
}

function ProposalPrintView({ proposal }: { proposal: Proposal }) {
  const { subtotal } = totals(proposal)
  const rowTotals = proposal.services.map((s) => s.quantity * s.price)
  return (
    <div className="print-sheet">
      <div className="sheet-head">
        <div>
          <div className="sheet-logo">CREATIVE STUDIO</div>
          <div className="faint" style={{ fontSize: 12 }}>Yaratıcı Ajans · Teklif Dokümanı</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>{proposal.title}</div>
          <div className="faint">{proposal.client || 'Müşteri belirtilmedi'}</div>
          <div className="faint">Teklif: {formatDate(proposal.date)}</div>
          <div className="faint">Geçerlilik: {formatDate(proposal.validUntil)}</div>
        </div>
      </div>

      <hr className="divider print-line" />

      <div className="table-wrap" style={{ boxShadow: 'none' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th style={{ minWidth: 200 }}>Hizmet</th>
              <th>Açıklama</th>
              <th style={{ textAlign: 'center' }}>Adet</th>
              <th style={{ textAlign: 'right' }}>Birim Fiyat</th>
              <th style={{ textAlign: 'right' }}>Toplam</th>
            </tr>
          </thead>
          <tbody>
            {proposal.services.map((s, i) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="muted" style={{ fontSize: 12.5 }}>{s.description}</td>
                <td style={{ textAlign: 'center' }} className="mono">{s.quantity}</td>
                <td style={{ textAlign: 'right' }} className="mono">{TR_TRY(s.price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }} className="mono">{TR_TRY(rowTotals[i])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="spread" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
        <div style={{ minWidth: 260 }}>
          <div className="spread" style={{ padding: '8px 0' }}>
            <span className="muted">Ara Toplam</span>
            <span className="mono">{TR_TRY(subtotal)}</span>
          </div>
          <div className="spread" style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--lime-soft)', border: '1px solid rgba(216,243,78,0.3)' }}>
            <strong>Genel Toplam</strong>
            <strong className="mono lime">{TR_TRY(subtotal)}</strong>
          </div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 6, textAlign: 'right' }}>KDV dahil değildir.</div>
        </div>
      </div>

      {proposal.note && (
        <div className="pen-note" style={{ marginTop: 18 }}>{proposal.note}</div>
      )}

      <div className="spread" style={{ marginTop: 32, fontSize: 12 }}>
        <span className="faint">CREATIVE STUDIO · merhaba@creativestudio.example · +90 212 000 00 00</span>
        <span className="faint">İmza: ____________________</span>
      </div>
    </div>
  )
}

export default function Proposals() {
  const { state, dispatch } = useStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Proposal | null>(null)
  const [confirm, setConfirm] = useState<Proposal | null>(null)
  const [openId, setOpenId] = useState<string | null>(state.proposals[0]?.id ?? null)

  const current = state.proposals.find((p) => p.id === openId) ?? state.proposals[0]
  const totalValue = useMemo(
    () => state.proposals.reduce((sum, p) => sum + totals(p).subtotal, 0),
    [state.proposals],
  )

  return (
    <>
      <div className="page-head page-head-row print-hide">
        <div>
          <div className="page-eyebrow">İş Yönetimi</div>
          <h1 className="page-title">Teklif Oluşturucu</h1>
          <p className="page-desc">
            Hizmet kalemlerini ekleyin, toplamlar otomatik hesaplanır; baskıya hazır profesyonel teklif dokümanı.
          </p>
        </div>
        <div className="toolbar">
          <button
            className="btn"
            onClick={() => window.print()}
            disabled={!current}
            title="Yazdır / PDF olarak kaydet"
          >
            <IconPrint width={15} height={15} /> Yazdır / PDF
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setEditorOpen(true) }}>
            <IconPlus width={15} height={15} /> Yeni Teklif
          </button>
        </div>
      </div>

      <div className="grid grid-main-side">
        <div>
          {current ? (
            <ProposalPrintView proposal={current} />
          ) : (
            <section className="card">
              <EmptyState
                icon={<IconDoc width={22} height={22} />}
                title="Teklif yok"
                desc="Yeni bir teklif oluşturun; hizmet kalemleri ve toplamlar burada hazır doküman olarak görünür."
                action={
                  <button className="btn btn-primary" onClick={() => { setEditing(null); setEditorOpen(true) }}>
                    <IconPlus width={14} height={14} /> Yeni Teklif
                  </button>
                }
              />
            </section>
          )}
        </div>

        <div className="stack print-hide">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Teklifler</div>
            <div className="row-list">
              {state.proposals.map((p) => (
                <div className="row-item" key={p.id} style={{ cursor: 'pointer' }} onClick={() => setOpenId(p.id)}>
                  <div className="row-main">
                    <div className="row-title" style={{ fontSize: 13, color: p.id === current?.id ? 'var(--lime)' : undefined }}>
                      {p.title}
                    </div>
                    <div className="row-sub">{p.client || '—'} · {formatDate(p.date)}</div>
                  </div>
                  <div className="row-side">
                    <span className="badge mono">{TR_TRY(totals(p).subtotal)}</span>
                    <button
                      className="x-btn"
                      title="Düzenle"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditing(p)
                        setEditorOpen(true)
                      }}
                    >
                      <IconEdit width={13} height={13} />
                    </button>
                    <button
                      className="x-btn"
                      title="Sil"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirm(p)
                      }}
                    >
                      <IconTrash width={13} height={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 8 }}>Özet</div>
            <div className="spread" style={{ padding: '6px 0' }}>
              <span className="muted">Teklif sayısı</span>
              <span className="badge">{state.proposals.length}</span>
            </div>
            <div className="spread" style={{ padding: '6px 0' }}>
              <span className="muted">Toplam teklif değeri</span>
              <span className="badge badge-lime mono">{TR_TRY(totalValue)}</span>
            </div>
          </section>
        </div>
      </div>

      <ProposalEditor
        open={editorOpen}
        proposal={editing}
        onClose={() => {
          setEditorOpen(false)
          setEditing(null)
        }}
      />
      <ConfirmDialog
        open={confirm !== null}
        title="Teklifi Sil"
        message={confirm ? `“${confirm.title}” teklifi silinecek.` : ''}
        onConfirm={() => confirm && dispatch({ type: 'proposal/delete', id: confirm.id })}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
