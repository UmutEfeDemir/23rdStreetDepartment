export type Rank =
  | "Captain"
  | "Senior Lieutenant"
  | "Lieutenant"
  | "Senior Sergeant"
  | "Sergeant"
  | "Senior Officer"
  | "Officer"
  | "Probationary Officer"
  | "Cadet"
  // Türkçe rütbeler (eski uyumluluk)
  | "Komiser"
  | "Komiser Yardımcısı"
  | "Yardımcı Komiser"
  | "Başmüfettiş"
  | "Müfettiş"
  | "Başçavuş"
  | "Çavuş"
  | "Kıdemli Trooper"
  | "Trooper"
  | "Deneme Trooper"
  | "Aday"

export type Unit = "HC" | "Detective" | "HPD" | "CID" | "SWAT" | "TFD" | "K9" | "ASD"

export type OfficerStatus = "Görevde" | "Aktif" | "İzinli" | "Eğitimde"

export const UNIT_LABELS: Record<Unit, string> = {
  HC: "High Command",
  Detective: "Detective Supervisor",
  HPD: "Karayolu Devriye",
  CID: "Suç Soruşturma",
  SWAT: "Özel Harekat",
  TFD: "Trafik Denetleme",
  K9: "K9 Köpek Birimi",
  ASD: "Hava Destek",
}

export const RANK_ORDER: Rank[] = [
  "Captain",
  "Senior Lieutenant",
  "Lieutenant",
  "Senior Sergeant",
  "Sergeant",
  "Senior Officer",
  "Officer",
  "Probationary Officer",
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
