export type ProjectStatus = 'planlama' | 'devam' | 'revizyon' | 'tamamlandi'
export type ProjectType = 'reklam' | 'grafik' | 'marka' | 'sosyal'
export type AdStyle = 'duygusal' | 'sinematik' | 'mizah' | 'kurumsal' | 'surpriz'
export type ScriptLength = 10 | 15 | 30

export interface Client {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  done: boolean
  due?: string
}

export interface Project {
  id: string
  title: string
  client: string
  type: ProjectType
  status: ProjectStatus
  deadline: string
  budget: number
  description: string
  progress: number
  tasks: Task[]
  createdAt: string
}

export interface StoryboardScene {
  id: string
  duration: number
  camera: string
  visual: string
  lighting: string
  sound: string
  transition: string
}

export interface Storyboard {
  id: string
  title: string
  brief: string
  client: string
  scenes: StoryboardScene[]
  createdAt: string
}

export interface ProposalService {
  id: string
  name: string
  description: string
  quantity: number
  price: number
}

export interface Proposal {
  id: string
  title: string
  client: string
  date: string
  validUntil: string
  services: ProposalService[]
  note: string
  createdAt: string
}

export interface Activity {
  id: string
  time: string
  text: string
  module: 'proje' | 'musteri' | 'storyboard' | 'teklif' | 'ai' | 'marka'
}

export interface AIConcept {
  headline: string
  concept: string
  strategy: string
  slogans: string[]
  script: VideoScript
  style: AdStyle
}

export interface ScriptShot {
  from: number
  to: number
  visual: string
  audio: string
}

export interface VideoScript {
  length: ScriptLength
  style: AdStyle
  shots: ScriptShot[]
  ctaText: string
}

export interface BrandPack {
  names: string[]
  slogans: string[]
  positioning: string
  palette: { name: string; colors: string[] }
  typography: { primary: string; secondary: string; usage: string }
  visualIdentity: string
}

export interface AppState {
  clients: Client[]
  projects: Project[]
  storyboards: Storyboard[]
  proposals: Proposal[]
  activity: Activity[]
  workspaces: Record<string, AIConcept>
  brandPacks: Record<string, BrandPack>
}
