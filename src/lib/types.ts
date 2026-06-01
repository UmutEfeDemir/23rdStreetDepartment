export type Rank =
  | "Captain"
  | "Senior Lieutenant"
  | "Lieutenant"
  | "Senior Sergeant"
  | "Sergeant"
  | "Corporal"
  | "Master Trooper"
  | "Senior Trooper"
  | "Trooper"
  | "Cadet"

export type Unit = "High Command" | "Sup. Command" | "Supervisor" | "Polis"

export type OfficerStatus = "Görevde" | "Aktif" | "İzinli" | "Eğitimde"

export const UNIT_LABELS: Record<Unit, string> = {
  "High Command": "High Command",
  "Sup. Command": "Sup. Command",
  "Supervisor": "Supervisor",
  "Polis": "Polis",
}

export const RANK_ORDER: Rank[] = [
  "Captain",
  "Senior Lieutenant",
  "Lieutenant",
  "Senior Sergeant",
  "Sergeant",
  "Corporal",
  "Master Trooper",
  "Senior Trooper",
  "Trooper",
  "Cadet",
]

export interface Officer {
  id: string
  badgeNo: string
  name: string
  rank: Rank
  unit: Unit
  status: OfficerStatus
  seniorityMonths: number
  rankProgress: number
  nextRank: Rank | null
  stats: {
    dutyHours: number
    patrols: number
    commendations: number
    warnings: number
  }
  discordId?: string
  avatarUrl?: string
  isCommand?: boolean
}

export interface Activity {
  id: string
  officerId: string
  title: string
  meta: string
  at: string
}

export interface Application {
  id?: string
  fullName: string
  age: number
  discord: string
  characterName: string
  unit: Unit
  experience: string
  motivation: string
  acceptedRules: boolean
  createdAt?: string
  status?: "pending" | "interview" | "accepted" | "rejected"
}

export interface SiteStats {
  yearsActive: number
  totalPersonnel: number
  activeTroopers: number
  sectors: number
}
