import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '../store/store'
import type { ProjectStatus } from '../types'
import {
  EmptyState,
  PROJECT_TYPE_OPTIONS,
  ProgressBar,
  StatusBadge,
  TR_TRY,
  formatDate,
} from '../components/ui'
import { IconChevron, IconClock, IconPlus, IconTrash } from '../components/icons'
import { ProjectFormModal } from './Projects'

const STATUS_OPTIONS: [ProjectStatus, string][] = [
  ['planlama', 'Planlama'],
  ['devam', 'Devam Ediyor'],
  ['revizyon', 'Revizyon'],
  ['tamamlandi', 'Tamamlandı'],
]

export default function ProjectDetail() {
  const { id } = useParams()
  const { state, dispatch } = useStore()
  const project = state.projects.find((p) => p.id === id)
  const [editOpen, setEditOpen] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDue, setTaskDue] = useState('')

  if (!project) {
    return (
      <section className="card">
        <EmptyState
          icon="?"
          title="Proje bulunamadı"
          desc="Bu proje silinmiş veya hiç var olmamış olabilir."
          action={<Link to="/projeler" className="btn btn-primary">Projelere Dön</Link>}
        />
      </section>
    )
  }

  const client = state.clients.find((c) => c.company === project.client)
  const openTasks = project.tasks.filter((t) => !t.done)

  const addTask = () => {
    if (!taskTitle.trim()) return
    dispatch({ type: 'task/add', projectId: project.id, title: taskTitle.trim(), due: taskDue || undefined })
    setTaskTitle('')
    setTaskDue('')
  }

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <Link to="/projeler" className="inline faint" style={{ fontSize: 12.5, marginBottom: 10, display: 'inline-flex' }}>
            <IconChevron width={12} height={12} style={{ transform: 'rotate(180deg)' }} /> Projeler
          </Link>
          <h1 className="page-title">{project.title}</h1>
          <div className="inline" style={{ marginTop: 12 }}>
            <StatusBadge s={project.status} />
            <span className="badge">{PROJECT_TYPE_OPTIONS.find(([k]) => k === project.type)?.[1]}</span>
            <span className="badge badge-lime">{TR_TRY(project.budget)}</span>
          </div>
        </div>
        <button className="btn" onClick={() => setEditOpen(true)}>Projeyi Düzenle</button>
      </div>

      <div className="grid grid-main-side">
        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Genel Bakış</div>
            {project.description && <p className="muted" style={{ marginTop: 0 }}>{project.description}</p>}
            <div className="grid grid-3" style={{ marginTop: 14 }}>
              <div className="scene-field">
                <div className="scene-field-label">Müşteri</div>
                <div className="scene-field-value">{project.client || '—'}</div>
              </div>
              <div className="scene-field">
                <div className="scene-field-label">Teslim Tarihi</div>
                <div className="scene-field-value">
                  <IconClock width={12} height={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />
                  {formatDate(project.deadline)}
                </div>
              </div>
              <div className="scene-field">
                <div className="scene-field-label">Bütçe</div>
                <div className="scene-field-value mono">{TR_TRY(project.budget)}</div>
              </div>
            </div>
            {client && (
              <div className="notice" style={{ marginTop: 14 }}>
                <div>
                  <strong>{client.name}</strong> — {client.company}
                  <div className="faint" style={{ fontSize: 12.5 }}>{client.email} · {client.phone}</div>
                </div>
              </div>
            )}
          </section>

          <section className="card card-pad">
            <div className="spread" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">Görevler</div>
                <div className="card-sub">
                  {project.tasks.filter((t) => t.done).length}/{project.tasks.length} tamamlandı
                </div>
              </div>
            </div>
            <div>
              {project.tasks.map((t) => (
                <div className="row-item" key={t.id}>
                  <button
                    type="button"
                    className="x-btn"
                    style={{
                      background: t.done ? 'var(--lime)' : 'transparent',
                      color: t.done ? '#12140a' : 'var(--text-faint)',
                      borderColor: t.done ? 'var(--lime)' : 'var(--border-strong)',
                      borderRadius: 8,
                    }}
                    title={t.done ? 'Geri al' : 'Tamamlandı işaretle'}
                    onClick={() => dispatch({ type: 'task/toggle', projectId: project.id, taskId: t.id })}
                  >
                    ✓
                  </button>
                  <div className="row-main">
                    <div className="row-title" style={{ textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--text-faint)' : undefined }}>
                      {t.title}
                    </div>
                  </div>
                  {t.due && (
                    <span className={`badge${t.done ? '' : new Date(t.due) < new Date() ? ' badge-danger' : ''}`}>
                      {formatDate(t.due)}
                    </span>
                  )}
                  <button
                    className="x-btn"
                    title="Görevi sil"
                    onClick={() => dispatch({ type: 'task/delete', projectId: project.id, taskId: t.id })}
                  >
                    <IconTrash width={13} height={13} />
                  </button>
                </div>
              ))}
              {project.tasks.length === 0 && <div className="faint">Henüz görev yok.</div>}
            </div>

            <hr className="divider" />
            <div className="form-grid form-cols-2">
              <div className="field">
                <label>Yeni Görev</label>
                <input
                  className="input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="örn. Moodboard sunumu"
                />
              </div>
              <div className="field">
                <label>Bitiş (opsiyonel)</label>
                <input className="input" type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary btn-sm" onClick={addTask} disabled={!taskTitle.trim()}>
                <IconPlus width={13} height={13} /> Görev Ekle
              </button>
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>İlerleme</div>
            <div className="spread" style={{ marginBottom: 8 }}>
              <span className="stat-value" style={{ fontSize: 30 }}>%{project.progress}</span>
              {openTasks.length > 0 && <span className="badge badge-amber">{openTasks.length} açık görev</span>}
            </div>
            <ProgressBar value={project.progress} />
            <p className="faint" style={{ fontSize: 12.5 }}>
              İlerleme, tamamlanan görev oranına göre otomatik hesaplanır.
            </p>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 12 }}>Durumu Değiştir</div>
            <div className="chip-row">
              {STATUS_OPTIONS.map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={`style-chip${project.status === k ? ' active' : ''}`}
                  onClick={() => {
                    if (project.status !== k) {
                      dispatch({
                        type: 'project/save',
                        project: {
                          ...project,
                          status: k,
                          progress: k === 'tamamlandi' ? 100 : project.progress,
                        },
                      })
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 8 }}>Proje Bilgisi</div>
            <div className="row-list">
              <div className="row-item" style={{ padding: '10px 0' }}>
                <div className="row-main">
                  <div className="row-sub">Oluşturulma</div>
                  <div className="row-title" style={{ fontSize: 13 }}>{formatDate(project.createdAt)}</div>
                </div>
              </div>
              <div className="row-item" style={{ padding: '10px 0' }}>
                <div className="row-main">
                  <div className="row-sub">Proje No</div>
                  <div className="row-title mono" style={{ fontSize: 13 }}>{project.id.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ProjectFormModal open={editOpen} project={project} onClose={() => setEditOpen(false)} />
    </>
  )
}
