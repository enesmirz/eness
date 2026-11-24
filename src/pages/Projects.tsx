import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useStore, uid } from '../store/store'
import type { Project, ProjectStatus, ProjectType } from '../types'
import {
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  PROJECT_TYPE_OPTIONS,
  ProgressBar,
  StatusBadge,
  TR_TRY,
  statusLabel,
} from '../components/ui'
import { IconEdit, IconFolder, IconPlus, IconSearch, IconTrash } from '../components/icons'

const STATUS_OPTIONS: [ProjectStatus, string][] = [
  ['planlama', 'Planlama'],
  ['devam', 'Devam Ediyor'],
  ['revizyon', 'Revizyon'],
  ['tamamlandi', 'Tamamlandı'],
]

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

interface ProjectForm {
  title: string
  client: string
  type: ProjectType
  status: ProjectStatus
  deadline: string
  budget: string
  description: string
}

const emptyForm = (): ProjectForm => ({
  title: '',
  client: '',
  type: 'reklam',
  status: 'planlama',
  deadline: inDays(21),
  budget: '',
  description: '',
})

export function ProjectFormModal({
  open,
  project,
  onClose,
}: {
  open: boolean
  project?: Project | null
  onClose: () => void
}) {
  const { state, dispatch } = useStore()
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const set = <K extends keyof ProjectForm,>(k: K, v: ProjectForm[K]) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!open) return
    setForm(
      project
        ? {
            title: project.title,
            client: project.client,
            type: project.type,
            status: project.status,
            deadline: project.deadline,
            budget: String(project.budget),
            description: project.description,
          }
        : emptyForm(),
    )
  }, [open, project])

  const save = () => {
    if (!form.title.trim()) return
    const isEdit = Boolean(project)
    const base = project ?? undefined
    const p: Project = {
      id: base?.id ?? uid('pr'),
      title: form.title.trim(),
      client: form.client.trim(),
      type: form.type,
      status: form.status,
      deadline: form.deadline || today(),
      budget: Number(form.budget) || 0,
      description: form.description,
      progress: base?.progress ?? (form.status === 'tamamlandi' ? 100 : 0),
      tasks: base?.tasks ?? [],
      createdAt: base?.createdAt ?? new Date().toISOString(),
    }
    if (form.status === 'tamamlandi') p.progress = 100
    dispatch({ type: 'project/save', project: p })
    onClose()
  }

  return (
    <Modal
      title={project ? 'Projeyi Düzenle' : 'Yeni Proje'}
      open={open}
      onClose={onClose}
      large
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Vazgeç</button>
          <button className="btn btn-primary" onClick={save} disabled={!form.title.trim()}>
            {project ? 'Değişiklikleri Kaydet' : 'Projeyi Oluştur'}
          </button>
        </>
      }
    >
      <div className="form-grid form-cols-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Proje Adı *">
            <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="örn. Kavun Kahve — Tanıtım Filmi" />
          </Field>
        </div>
        <Field label="Müşteri">
          <input
            className="input"
            list="project-client-list"
            value={form.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Müşteri seçin veya yazın"
          />
          <datalist id="project-client-list">
            {state.clients.map((c) => (
              <option key={c.id} value={c.company} />
            ))}
          </datalist>
        </Field>
        <Field label="Proje Türü">
          <select className="select" value={form.type} onChange={(e) => set('type', e.target.value as ProjectType)}>
            {PROJECT_TYPE_OPTIONS.map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Durum">
          <select className="select" value={form.status} onChange={(e) => set('status', e.target.value as ProjectStatus)}>
            {STATUS_OPTIONS.map(([k, label]) => (
              <option key={k} value={k}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Teslim Tarihi">
          <input className="input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
        </Field>
        <Field label="Bütçe (₺)">
          <input className="input" type="number" min={0} step={1000} value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="örn. 150000" />
        </Field>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Açıklama">
            <textarea className="textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Kapsam, teslim çıktıları ve notlar..." />
          </Field>
        </div>
      </div>
    </Modal>
  )
}

export default function Projects() {
  const { state, dispatch: storeDispatch } = useStore()
  const [params, setParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(params.get('new') === '1')
  const [editTarget, setEditTarget] = useState<Project | null>(null)
  const [confirm, setConfirm] = useState<Project | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'hepsi' | ProjectStatus>('hepsi')
  const [typeFilter, setTypeFilter] = useState<'hepsi' | ProjectType>('hepsi')

  useEffect(() => {
    if (params.get('new') === '1') {
      setModalOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const filtered = useMemo(
    () =>
      state.projects.filter((p) => {
        const q = query.toLowerCase()
        const matchQ =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        const matchS = statusFilter === 'hepsi' || p.status === statusFilter
        const matchT = typeFilter === 'hepsi' || p.type === typeFilter
        return matchQ && matchS && matchT
      }),
    [state.projects, query, statusFilter, typeFilter],
  )

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">İş Yönetimi</div>
          <h1 className="page-title">Projeler</h1>
          <p className="page-desc">
            Reklam, grafik tasarım, markalaşma ve sosyal medya işleri — durum, teslim ve bütçe takibiyle.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <IconPlus width={15} height={15} /> Yeni Proje
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 18 }}>
        <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 280, padding: '0 12px' }}>
          <IconSearch width={15} height={15} className="faint" />
          <input
            style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text)', width: '100%', padding: '10px 0', fontSize: 13.5 }}
            placeholder="Proje ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="hepsi">Tüm Durumlar</option>
          {STATUS_OPTIONS.map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}>
          <option value="hepsi">Tüm Türler</option>
          {PROJECT_TYPE_OPTIONS.map(([k, label]) => (
            <option key={k} value={k}>{label}</option>
          ))}
        </select>
        <span className="badge">{filtered.length} / {state.projects.length} proje</span>
      </div>

      {filtered.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={<IconFolder width={22} height={22} />}
            title="Proje bulunamadı"
            desc="Filtreleri temizleyin veya yeni bir proje oluşturun."
            action={
              <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                <IconPlus width={14} height={14} /> Yeni Proje
              </button>
            }
          />
        </section>
      ) : (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Proje</th>
                <th>Müşteri</th>
                <th>Tür</th>
                <th>Durum</th>
                <th style={{ minWidth: 150 }}>İlerleme</th>
                <th>Teslim</th>
                <th>Bütçe</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/projeler/${p.id}`} className="row-title lime" style={{ textDecoration: 'none' }}>
                      {p.title}
                    </Link>
                  </td>
                  <td>{p.client || <span className="faint">—</span>}</td>
                  <td><span className="badge">{PROJECT_TYPE_OPTIONS.find(([k]) => k === p.type)?.[1]}</span></td>
                  <td><StatusBadge s={p.status} /></td>
                  <td>
                    <ProgressBar value={p.progress} />
                    <div className="faint" style={{ fontSize: 11.5, marginTop: 5 }}>%{p.progress}</div>
                  </td>
                  <td style={{ fontSize: 13 }}>{new Date(p.deadline).toLocaleDateString('tr-TR')}</td>
                  <td className="mono" style={{ fontSize: 13 }}>{TR_TRY(p.budget)}</td>
                  <td>
                    <div className="row-side">
                      <button className="x-btn" title="Düzenle" onClick={() => setEditTarget(p)}>
                        <IconEdit width={13} height={13} />
                      </button>
                      <button className="x-btn" title="Sil" onClick={() => setConfirm(p)}>
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

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <ProjectFormModal
        open={editTarget !== null}
        project={editTarget}
        onClose={() => setEditTarget(null)}
      />
      <ConfirmDialog
        open={confirm !== null}
        title="Projeyi Sil"
        message={confirm ? `“${confirm.title}” projesi silinecek. Bu işlem geri alınamaz.` : ''}
        onConfirm={() => confirm && storeDispatch({ type: 'project/delete', id: confirm.id })}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
