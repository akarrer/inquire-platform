export type Domain = 'MATH' | 'ELA' | 'SCIENCE'
export type ContextLevel = 'SPARSE' | 'PARTIAL' | 'RICH'

export interface DimensionScore {
  score: number
  rationale: string
}

export interface QuestionScoreResult {
  d1Linguistic: DimensionScore
  d2ContentKnowledge: DimensionScore & {
    domainConceptsIdentified: string[]
    domainConceptsMissed: string[]
  }
  d3CriticalThinking: DimensionScore & {
    questionType: string
    assumptionIdentified: string | null
  }
  d4InquirySoph: DimensionScore & {
    questionLevel: number
    questionCategory: string
    wouldExpertAsk: boolean
    investigationOpened: string
  }
  d5ContextIntegration: DimensionScore & {
    contextUsed: boolean
    asksAboutGiven: boolean
  }
  composite: number
  feedback: string
}

export interface ScenarioData {
  id: string
  domain: Domain
  contextLevel: ContextLevel
  title: string
  scenarioText: string
  contextText?: string
  difficulty: number
}

export interface SessionState {
  id: string
  abilityEstimate: number
  abilitySE: number
  itemCount: number
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED'
}
