export interface CareerPhase {
  level: string
  duration: string

  skills: string[]
  tools: string[]
  projects: string[]
  certifications: string[]
  interview: string[]
}

export interface CareerPath {
  title: string

  roles: string[]

  salary: string

  skills: string[]

  phases: {
    threeMonths: CareerPhase[]
    sixMonths: CareerPhase[]
    oneYear: CareerPhase[]
  }
}