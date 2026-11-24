import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  IconBolt,
  IconDoc,
  IconFilm,
  IconFolder,
  IconGrid,
  IconMenu,
  IconPalette,
  IconSpark,
  IconUsers,
} from './icons'

const NAV = [
  {
    section: 'Genel Bakış',
    items: [{ to: '/', label: 'Panel', icon: <IconGrid /> }],
  },
  {
    section: 'Yaratıcı Stüdyo',
    items: [
      { to: '/yaratici-yonetmen', label: 'AI Yaratıcı Yönetmen', icon: <IconSpark /> },
      { to: '/storyboard', label: 'Storyboard Stüdyo', icon: <IconFilm /> },
      { to: '/marka-lab', label: 'Marka Lab', icon: <IconPalette /> },
    ],
  },
  {
    section: 'İş Yönetimi',
    items: [
      { to: '/musteriler', label: 'Müşteriler', icon: <IconUsers /> },
      { to: '/projeler', label: 'Projeler', icon: <IconFolder /> },
      { to: '/teklifler', label: 'Teklif Oluşturucu', icon: <IconDoc /> },
    ],
  },
]

const TITLES: Record<string, { title: string; crumb: string }> = {
  '/': { title: 'Yaratıcı Ajans Paneli', crumb: 'Genel Bakış' },
  '/yaratici-yonetmen': { title: 'AI Yaratıcı Yönetmen', crumb: 'Yaratıcı Stüdyo' },
  '/storyboard': { title: 'Storyboard Stüdyo', crumb: 'Yaratıcı Stüdyo' },
  '/marka-lab': { title: 'Marka Lab', crumb: 'Yaratıcı Stüdyo' },
  '/musteriler': { title: 'Müşteri Yönetimi', crumb: 'İş Yönetimi' },
  '/projeler': { title: 'Proje Yönetimi', crumb: 'İş Yönetimi' },
  '/teklifler': { title: 'Teklif Oluşturucu', crumb: 'İş Yönetimi' },
}

export default function Layout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const meta = TITLES[location.pathname] ?? {
    title: 'Proje Detayı',
    crumb: 'Projeler / Detay',
  }

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="shell">
      {open && <div className="overlay-nav on" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">C</div>
          <div>
            <div className="brand-name">CREATIVE<br />STUDIO</div>
            <div className="brand-sub">Ajans Platformu</div>
          </div>
        </div>
        <nav className="side-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="nav-section">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="ai-mode-chip">
            <span className="ai-dot" />
            <span>
              AI motoru <strong className="lime">yerel modda</strong> çalışıyor. API anahtarı ekleyerek üretken modele bağlanabilirsiniz.
            </span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar print-hide">
          <div className="inline">
            <button className="menu-toggle" onClick={() => setOpen((v) => !v)} aria-label="Menü">
              <IconMenu />
            </button>
            <div>
              <div className="topbar-title">{meta.title}</div>
              <div className="topbar-crumbs">{meta.crumb}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="badge badge-lime">
              <IconBolt width={12} height={12} /> v1.0
            </span>
          </div>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
