import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type {
  Activity,
  AppState,
  BrandPack,
  Client,
  Project,
  Proposal,
  Storyboard,
} from '../types'
import { seedState } from '../data/seed'

const STORAGE_KEY = 'creative-studio-state-v1'

export const uid = (prefix: string) =>
  `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

type Action =
  | { type: 'client/save'; client: Client }
  | { type: 'client/delete'; id: string }
  | { type: 'project/save'; project: Project }
  | { type: 'project/delete'; id: string }
  | { type: 'task/toggle'; projectId: string; taskId: string }
  | { type: 'task/add'; projectId: string; title: string; due?: string }
  | { type: 'task/delete'; projectId: string; taskId: string }
  | { type: 'storyboard/save'; storyboard: Storyboard }
  | { type: 'storyboard/delete'; id: string }
  | { type: 'proposal/save'; proposal: Proposal }
  | { type: 'proposal/delete'; id: string }
  | { type: 'ai/store'; key: string; concept: Record<string, unknown> }
  | { type: 'brand/store'; key: string; pack: BrandPack }
  | { type: 'activity/log'; text: string; module: Activity['module'] }
  | { type: 'reset' }

export function logActivity(state: AppState, text: string, module: Activity['module']): AppState {
  const entry: Activity = { id: uid('ac'), time: new Date().toISOString(), text, module }
  return { ...state, activity: [entry, ...state.activity].slice(0, 60) }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'client/save': {
      const exists = state.clients.some((c) => c.id === action.client.id)
      const clients = exists
        ? state.clients.map((c) => (c.id === action.client.id ? action.client : c))
        : [action.client, ...state.clients]
      return logActivity(
        { ...state, clients },
        exists
          ? `“${action.client.name} / ${action.client.company}” müşteri kaydı güncellendi`
          : `“${action.client.name} / ${action.client.company}” müşteri kaydı oluşturuldu`,
        'musteri',
      )
    }
    case 'client/delete':
      return logActivity(
        {
          ...state,
          clients: state.clients.filter((c) => c.id !== action.id),
        },
        'Bir müşteri kaydı silindi',
        'musteri',
      )
    case 'project/save': {
      const exists = state.projects.some((p) => p.id === action.project.id)
      const projects = exists
        ? state.projects.map((p) => (p.id === action.project.id ? action.project : p))
        : [action.project, ...state.projects]
      return logActivity(
        { ...state, projects },
        exists
          ? `“${action.project.title}” projesi güncellendi`
          : `“${action.project.title}” projesi oluşturuldu`,
        'proje',
      )
    }
    case 'project/delete':
      return logActivity(
        { ...state, projects: state.projects.filter((p) => p.id !== action.id) },
        'Bir proje silindi',
        'proje',
      )
    case 'task/toggle': {
      const project = state.projects.find((p) => p.id === action.projectId)
      if (!project) return state
      const tasks = project.tasks.map((t) =>
        t.id === action.taskId ? { ...t, done: !t.done } : t,
      )
      const doneCount = tasks.filter((t) => t.done).length
      const progress = tasks.length
        ? Math.round((doneCount / tasks.length) * 100)
        : project.progress
      const status =
        progress === 100 ? 'tamamlandi' : project.status === 'planlama' && progress > 0 ? 'devam' : project.status
      const updated = { ...project, tasks, progress, status }
      return logActivity(
        { ...state, projects: state.projects.map((p) => (p.id === project.id ? updated : p)) },
        `“${project.title}” projesinde görev durumu değişti ( %{progress})`.replace('%progress', String(progress)),
        'proje',
      )
    }
    case 'task/add': {
      const project = state.projects.find((p) => p.id === action.projectId)
      if (!project) return state
      const task = { id: uid('tk'), title: action.title, done: false, due: action.due }
      const updated = { ...project, tasks: [...project.tasks, task] }
      return logActivity(
        { ...state, projects: state.projects.map((p) => (p.id === project.id ? updated : p)) },
        `“${project.title}” projesine “${action.title}” görevi eklendi`,
        'proje',
      )
    }
    case 'task/delete': {
      const project = state.projects.find((p) => p.id === action.projectId)
      if (!project) return state
      const updated = { ...project, tasks: project.tasks.filter((t) => t.id !== action.taskId) }
      return logActivity(
        { ...state, projects: state.projects.map((p) => (p.id === project.id ? updated : p)) },
        `“${project.title}” projesinden bir görev kaldırıldı`,
        'proje',
      )
    }
    case 'storyboard/save': {
      const exists = state.storyboards.some((s) => s.id === action.storyboard.id)
      const storyboards = exists
        ? state.storyboards.map((s) => (s.id === action.storyboard.id ? action.storyboard : s))
        : [action.storyboard, ...state.storyboards]
      return logActivity(
        { ...state, storyboards },
        exists
          ? `“${action.storyboard.title}” storyboard güncellendi`
          : `“${action.storyboard.title}” storyboard oluşturuldu`,
        'storyboard',
      )
    }
    case 'storyboard/delete': {
      const sb = state.storyboards.find((s) => s.id === action.id)
      return logActivity(
        { ...state, storyboards: state.storyboards.filter((s) => s.id !== action.id) },
        sb ? `“${sb.title}” storyboard silindi` : 'Bir storyboard silindi',
        'storyboard',
      )
    }
    case 'proposal/save': {
      const exists = state.proposals.some((p) => p.id === action.proposal.id)
      const proposals = exists
        ? state.proposals.map((p) => (p.id === action.proposal.id ? action.proposal : p))
        : [action.proposal, ...state.proposals]
      return logActivity(
        { ...state, proposals },
        exists
          ? `“${action.proposal.title}” teklifi güncellendi`
          : `“${action.proposal.title}” teklifi oluşturuldu`,
        'teklif',
      )
    }
    case 'proposal/delete':
      return logActivity(
        { ...state, proposals: state.proposals.filter((p) => p.id !== action.id) },
        'Bir teklif silindi',
        'teklif',
      )
    case 'ai/store':
      return logActivity(
        {
          ...state,
          workspaces: { ...state.workspaces, [action.key]: action.concept as never },
        },
        'Yaratıcı Yönetmen yeni bir konsept üretti',
        'ai',
      )
    case 'brand/store':
      return logActivity(
        {
          ...state,
          brandPacks: { ...state.brandPacks, [action.key]: action.pack },
        },
        'Marka Laboratuvarı yeni bir kimlik paketi üretti',
        'marka',
      )
    case 'activity/log':
      return logActivity(state, action.text, action.module)
    case 'reset':
      return seedState()
    default:
      return state
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed.projects || !Array.isArray(parsed.projects)) return seedState()
    return { ...seedState(), ...parsed }
  } catch {
    return seedState()
  }
}

interface Store {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as unknown as AppState, loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* kota dolabilir; sessizce geç */
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
