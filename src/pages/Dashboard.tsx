import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import { DateBox, ProgressBar, StatCard, StatusBadge, TR_TRY, formatDate, relTime } from '../components/ui'
import { IconChevron, IconClock, IconPlus } from '../components/icons'
import type { Project } from '../types'

function daysUntil(iso: string): number {
  const d = new Date(iso)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function deadlineBadge(d: number) {
  if (d < 0) return <span className="badge badge-danger">Gecikti</span>
  if (d === 0) return <span className="badge badge-amber">Bugün</span>
  if (d <= 3) return <span className="badge badge-amber">{d} gün</span>
  return <span className="badge">{d} gün</span>
}

export default function Dashboard() {
  const { state } = useStore()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const active = state.projects.filter((p) => p.status === 'devam' || p.status === 'revizyon')
    const completed = state.projects.filter((p) => p.status === 'tamamlandi')
    const pendingTasks = state.projects.flatMap((p) =>
      p.tasks.filter((t) => !t.done).map((t) => ({ p, t })),
    )
    const pipeline = state.projects
      .filter((p) => p.status !== 'tamamlandi')
      .reduce((sum, p) => sum + p.budget, 0)
    return { active, completed, pendingTasks, pipeline }
  }, [state.projects])

  const upcoming = useMemo(
    () =>
      state.projects
        .filter((p) => p.status !== 'tamamlandi')
        .map((p) => ({ p, d: daysUntil(p.deadline) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 5),
    [state.projects],
  )

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { planlama: 0, devam: 0, revizyon: 0, tamamlandi: 0 }
    state.projects.forEach((p) => (map[p.status] = (map[p.status] ?? 0) + 1))
    return map
  }, [state.projects])

  const topActive: Project[] = useMemo(
    () => stats.active.slice(0, 4),
    [stats.active],
  )

  const maxStatus = Math.max(1, ...Object.values(statusCounts))

  return (
    <>
      <div className="page-head page-head-row">
        <div>
          <div className="page-eyebrow">Genel Bakış</div>
          <h1 className="page-title">Stüdyo Paneli</h1>
          <p className="page-desc">
            Aktif işler, yaklaşan teslimler ve ekibin son hareketleri tek ekranda.
          </p>
        </div>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={() => navigate('/projeler?new=1')}>
            <IconPlus width={15} height={15} /> Yeni Proje
          </button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <StatCard
          label="Aktif Projeler"
          value={stats.active.length}
          hint={`${statusCounts.planlama} proje planlama aşamasında`}
        />
        <StatCard label="Müşteriler" value={state.clients.length} hint="Ajans defterinde kayıtlı" />
        <StatCard
          label="Tamamlanan"
          value={stats.completed.length}
          hint="Teslim edilen işler"
        />
        <StatCard
          label="Bekleyen Görev"
          value={stats.pendingTasks.length}
          hint="Açık görev kalemleri"
        />
      </div>

      <div className="grid grid-main-side">
        <div className="stack">
          <section className="card card-pad">
            <div className="spread" style={{ marginBottom: 16 }}>
              <div>
                <div className="card-title">Aktif Projeler</div>
                <div className="card-sub">İlerleme durumu ve yaklaşan teslimler</div>
              </div>
              <Link to="/projeler" className="btn btn-sm">
                Tümü <IconChevron width={13} height={13} />
              </Link>
            </div>
            <div className="grid grid-2">
              {topActive.map((p) => (
                <Link key={p.id} to={`/projeler/${p.id}`} className="card card-pad" style={{ boxShadow: 'none' }}>
                  <div className="spread" style={{ alignItems: 'flex-start', marginBottom: 10 }}>
                    <div className="row-title" style={{ maxWidth: '85%' }}>{p.title}</div>
                    <StatusBadge s={p.status} />
                  </div>
                  <div className="faint" style={{ fontSize: 12, marginBottom: 10 }}>{p.client}</div>
                  <ProgressBar value={p.progress} />
                  <div className="spread" style={{ marginTop: 10 }}>
                    <span className="faint" style={{ fontSize: 12 }}>
                      <IconClock
                        width={12}
                        height={12}
                        style={{ verticalAlign: '-2px', marginRight: 5 }}
                      />
                      {formatDate(p.deadline)}
                    </span>
                    <span className="badge">{TR_TRY(p.budget)}</span>
                  </div>
                </Link>
              ))}
              {topActive.length === 0 && (
                <div className="empty" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-title">Aktif proje yok</div>
                  <p>Yeni bir proje oluşturarak iş akışını başlatın.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/projeler?new=1')}>
                    <IconPlus width={14} height={14} /> Proje Oluştur
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 16 }}>
              Yaklaşan Teslimler
            </div>
            <div>
              {upcoming.map(({ p, d }) => (
                <Link to={`/projeler/${p.id}`} key={p.id} className="deadline-item">
                  <DateBox iso={p.deadline} />
                  <div className="row-main">
                    <div className="row-title">{p.title}</div>
                    <div className="row-sub">{p.client}</div>
                  </div>
                  {deadlineBadge(d)}
                </Link>
              ))}
              {upcoming.length === 0 && <div className="faint">Yaklaşan teslim yok.</div>}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 14 }}>
              Proje Durumu Dağılımı
            </div>
            {(
              [
                ['planlama', 'Planlama'],
                ['devam', 'Devam Ediyor'],
                ['revizyon', 'Revizyon'],
                ['tamamlandi', 'Tamamlandı'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div className="spread" style={{ marginBottom: 6 }}>
                  <span className="muted" style={{ fontSize: 13 }}>{label}</span>
                  <span className="mono faint" style={{ fontSize: 13 }}>{statusCounts[key]}</span>
                </div>
                <ProgressBar value={(statusCounts[key] / maxStatus) * 100} />
              </div>
            ))}
            <div className="spread" style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <span className="faint" style={{ fontSize: 12.5 }}>Açık iş pipeline değeri</span>
              <span className="badge badge-lime">{TR_TRY(stats.pipeline)}</span>
            </div>
          </section>

          <section className="card card-pad">
            <div className="card-title" style={{ marginBottom: 8 }}>
              Son Hareketler
            </div>
            <div>
              {state.activity.slice(0, 7).map((a) => (
                <div className="activity-item" key={a.id}>
                  <span className="activity-dot" />
                  <div>
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-time">{relTime(a.time)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
