import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { IconCheck, IconCopy, IconX } from './icons'

export function Modal({
  title,
  open,
  onClose,
  children,
  footer,
  large,
}: {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  large?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${large ? ' modal-lg' : ''}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div className="modal-title">{title}</div>
          <button className="x-btn" onClick={onClose} aria-label="Kapat">
            <IconX width={14} height={14} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Sil',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      title={title}
      open={open}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Vazgeç
          </button>
          <button
            className="btn"
            style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="muted" style={{ margin: 0 }}>{message}</p>
    </Modal>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  )
}

export function EmptyState({
  icon = '✳',
  title,
  desc,
  action,
}: {
  icon?: ReactNode
  title: string
  desc: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <p>{desc}</p>
      {action}
    </div>
  )
}

export function CopyButton({ text, label = 'Kopyala' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={copy} type="button">
      {copied ? <IconCheck width={13} height={13} /> : <IconCopy width={13} height={13} />}
      {copied ? 'Kopyalandı' : label}
    </button>
  )
}

export function StatCard({
  label,
  value,
  hint,
  suffix,
}: {
  label: string
  value: number | string
  hint?: string
  suffix?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-accent" />
      <div className="stat-label">{label}</div>
      <div className="stat-value mono">
        {value}
        {suffix && <span style={{ fontSize: 18, marginLeft: 4 }}>{suffix}</span>}
      </div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

const TR_MONTHS = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA']

export function DateBox({ iso }: { iso: string }) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return <div className="date-box"><div className="d-day">–</div></div>
  return (
    <div className="date-box">
      <div className="d-day">{d.getDate()}</div>
      <div className="d-mon">{TR_MONTHS[d.getMonth()]}</div>
    </div>
  )
}

const TR_MONTHS_FULL = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
]

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${TR_MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${TR_MONTHS_FULL[d.getMonth()]}, ${hh}:${mm}`
}

export function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'şimdi'
  if (mins < 60) return `${mins} dk önce`
  const h = Math.floor(mins / 60)
  if (h < 24) return `${h} sa önce`
  const d = Math.floor(h / 24)
  return `${d} gün önce`
}

const TL = {
  planlama: { label: 'Planlama', cls: 'badge-blue' },
  devam: { label: 'Devam Ediyor', cls: 'badge-lime' },
  revizyon: { label: 'Revizyon', cls: 'badge-amber' },
  tamamlandi: { label: 'Tamamlandı', cls: 'badge-done' },
} as const

export const StatusBadge = ({ s }: { s: keyof typeof TL }) => (
  <span className={`badge ${TL[s].cls}`}>{TL[s].label}</span>
)

export const statusLabel = (s: keyof typeof TL) => TL[s].label

const PROJECT_TYPES = {
  reklam: 'Reklam',
  grafik: 'Grafik Tasarım',
  marka: 'Markalaşma',
  sosyal: 'Sosyal Medya',
} as const
export const typeLabel = (t: keyof typeof PROJECT_TYPES) => PROJECT_TYPES[t]
export const PROJECT_TYPE_OPTIONS = Object.entries(PROJECT_TYPES) as [keyof typeof PROJECT_TYPES, string][]

export const TR_TRY = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)
