import { useMemo, useState } from 'react'
import { useStore, uid } from '../store/store'
import type { Client } from '../types'
import { ConfirmDialog, EmptyState, Field, Modal, formatDateTime } from '../components/ui'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '../components/icons'

const EMPTY: Omit<Client, 'id' | 'createdAt'> = {
  name: '',
  company: '',
  email: '',
  phone: '',
  notes: '',
}

export default function Clients() {
  const { state, dispatch } = useStore()
  const [modal, setModal] = useState<{ mode: 'new' } | { mode: 'edit'; client: Client } | null>(null)
  const [confirm, setConfirm] = useState<Client | null>(null)
  const [query, setQuery] = useState('')

  const [form, setForm] = useState(EMPTY)

  const filtered = useMemo(
    () =>
      state.clients.filter((c) => {
        const q = query.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        )
      }),
    [state.clients, query],
  )

  const projectCount = (company: string) =>
    state.projects.filter((p) => p.client === company).length

  const openNew = () => {
    setForm(EMPTY)
    setModal({ mode: 'new' })
  }

  const openEdit = (c: Client) => {
    setForm({ name: c.name, company: c.company, email: c.email, phone: c.phone, notes: c.notes })
    setModal({ mode: 'edit', client: c })
  }

  const save = () => {
    if (!form.name.trim() || !form.company.trim()) return
    const isEdit = modal?.mode === 'edit'
    const client: Client = isEdit
      ? { ...(modal as { client: Client }).client, ...form }
      : { id: uid('cl'), ...form, createdAt: new Date().toISOString() }
    dispatch({ type: 'client/save', client })
    setModal(null)
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">İş Yönetimi</div>
          <h1 className="page-title">Müşteriler</h1>
          <p className="page-desc">
            Ajans defteri: iletişim bilgileri, notlar ve müşteri başına açık iş sayısı.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <IconPlus width={15} height={15} /> Yeni Müşteri
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 18 }}>
        <input
          className="input"
          style={{ minWidth: 260 }}
          placeholder="İsim, şirket veya e-posta ara..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="badge">{filtered.length} kayıt</span>
      </div>

      {filtered.length === 0 ? (
        <section className="card">
          <EmptyState
            icon="✳"
            title={query ? 'Sonuç bulunamadı' : 'Müşteri kaydı yok'}
            desc={query ? 'Arama kriterlerinize uyan müşteri bulunamadı.' : 'İlk müşteri kaydınızı ekleyerek başlayın.'}
            action={
              !query ? (
                <button className="btn btn-primary" onClick={openNew}>
                  <IconPlus width={14} height={14} /> Yeni Müşteri
                </button>
              ) : undefined
            }
          />
        </section>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Yetkili Kişi</th>
                <th>Şirket</th>
                <th>İletişim</th>
                <th>Aktif Proje</th>
                <th>Kayıt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="inline" style={{ flexWrap: 'nowrap' }}>
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                        {c.name.slice(0, 1)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        {c.notes && <div className="row-sub" style={{ maxWidth: 260 }}>{c.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.company}</td>
                  <td>
                    <div>{c.email}</div>
                    <div className="faint" style={{ fontSize: 12.5 }}>{c.phone}</div>
                  </td>
                  <td>
                    <span className="badge badge-lime">{projectCount(c.company)} proje</span>
                  </td>
                  <td className="faint" style={{ fontSize: 12.5 }}>{formatDateTime(c.createdAt)}</td>
                  <td>
                    <div className="row-side">
                      <button className="x-btn" title="Düzenle" onClick={() => openEdit(c)}>
                        <IconEdit width={13} height={13} />
                      </button>
                      <button className="x-btn" title="Sil" onClick={() => setConfirm(c)}>
                        <IconTrash width={13} height={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        title={modal?.mode === 'edit' ? 'Müşteriyi Düzenle' : 'Yeni Müşteri'}
        open={modal !== null}
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModal(null)}>Vazgeç</button>
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={!form.name.trim() || !form.company.trim()}
            >
              Kaydet
            </button>
          </>
        }
      >
        <div className="form-grid form-cols-2">
          <Field label="Yetkili Kişi *">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="örn. Elif Yıldırım" />
          </Field>
          <Field label="Şirket *">
            <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="örn. Kavun Kahve" />
          </Field>
          <Field label="E-posta">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@sirket.com" />
          </Field>
          <Field label="Telefon">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+90 5xx xxx xx xx" />
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Notlar">
              <textarea className="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Müşteri tercihleri, geçmiş işler, özel istekler..." />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm !== null}
        title="Müşteriyi Sil"
        message={confirm ? `“${confirm.name} / ${confirm.company}” kaydı silinecek. Bağlı projeler silinmez.` : ''}
        onConfirm={() => confirm && dispatch({ type: 'client/delete', id: confirm.id })}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
