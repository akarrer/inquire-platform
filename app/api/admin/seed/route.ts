import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SEED_KEY = process.env.SEED_KEY ?? 'inquire-seed-dev'

export async function POST(req: Request) {
  const { key } = await req.json()
  if (key !== SEED_KEY) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Users
  const student = await prisma.user.upsert({
    where: { email: 'demo@inquire.dev' },
    update: {},
    create: { email: 'demo@inquire.dev', name: 'Demo Student', role: 'STUDENT' },
  })
  const educator = await prisma.user.upsert({
    where: { email: 'educator@inquire.dev' },
    update: {},
    create: { email: 'educator@inquire.dev', name: 'Demo Educator', role: 'EDUCATOR' },
  })

  // Scenarios
  const scenarios = [
    {
      domain: 'MATH' as const,
      contextLevel: 'SPARSE' as const,
      title: 'City School Construction Decision',
      scenarioText: 'A school district needs to decide how many new elementary schools to build over the next fifteen years. The district serves a growing city. Construction costs money, and so does leaving children without adequate facilities.',
      contextText: null,
      difficulty: 0.0,
      tags: [],
    },
    {
      domain: 'MATH' as const,
      contextLevel: 'PARTIAL' as const,
      title: 'Municipal Water Usage Forecasting',
      scenarioText: "A city's water authority must plan infrastructure investments based on projected population growth. Current and historical data are available, but future demand depends on factors that are difficult to predict.",
      contextText: "Current population: 340,000. Annual growth rate over the past decade: 2.3%. Current daily water consumption: 42 million gallons. Reservoir capacity: 890 million gallons. A neighboring city of similar size recently experienced a 40% spike in summer consumption during a drought year. The water authority's planning horizon is 20 years.",
      difficulty: 0.3,
      tags: [],
    },
    {
      domain: 'MATH' as const,
      contextLevel: 'RICH' as const,
      title: 'Student Loan Repayment Analysis',
      scenarioText: 'Marcus is 23 years old and has just completed a degree in mechanical engineering. He borrowed $52,400 in federal student loans and must choose a repayment plan. His loan servicer has offered four options.',
      contextText: 'Plan A (Standard): Fixed payment of $603/month for 10 years. Total repayment: $72,360. Interest rate: 6.54% APR.\n\nPlan B (Extended): Fixed payment of $398/month for 20 years. Total repayment: $95,520.\n\nPlan C (Income-Driven): 10% of discretionary income monthly. Payments recalculated annually. Balance forgiven after 20 years. Forgiven amount taxable as income.\n\nPlan D (Graduated): Starts at $350/month, increases 8% every two years over 10 years. Total repayment: $74,100.\n\nMarcus has accepted a position at an aerospace firm. Starting salary: $72,000/year. His employer offers a 401(k) with 4% match. Rent: $1,650/month. His parents paid off their mortgage last year and have offered to let him move back home rent-free for two years. His sister, a financial advisor, recommends Plan A. His college roommate, who earns $95,000, chose Plan C and says it is the obvious choice.',
      difficulty: 0.5,
      tags: [],
    },
    {
      domain: 'ELA' as const,
      contextLevel: 'SPARSE' as const,
      title: 'The Anonymous Endorsement Letter',
      scenarioText: "In 1923, an anonymous letter of endorsement appeared in a small literary magazine. The letter praised a then-unknown writer's first collection of short stories. That writer went on to significant fame. The letter's author was never publicly identified during their lifetime.",
      contextText: null,
      difficulty: 0.0,
      tags: [],
    },
    {
      domain: 'ELA' as const,
      contextLevel: 'PARTIAL' as const,
      title: 'Conflicting Reviews of the Same Novel',
      scenarioText: 'A debut novel published in 2019 received dramatically different critical responses. Two prominent reviews, published within a week of each other, reached opposite conclusions about the same book.',
      contextText: "Review A (The Atlantic): 'A luminous debut. The novel's fragmented structure mirrors its protagonist's fractured sense of identity, and the author's decision to withhold backstory until the final chapter transforms what might have been a conventional bildungsroman into something genuinely unsettling. The prose is precise without being cold.'\n\nReview B (The New York Times): 'A frustrating misfire. The fragmented structure feels like a substitute for plot rather than an enhancement of theme. Readers who invest 300 pages in a narrator whose history is withheld until the final chapter may feel manipulated rather than rewarded. The prose is clinical where it should be warm.'\n\nThe novel was a finalist for two major literary awards. The author is a first-generation immigrant writing in their second language.",
      difficulty: 0.3,
      tags: [],
    },
    {
      domain: 'ELA' as const,
      contextLevel: 'RICH' as const,
      title: 'The Plantation Ledger Letter',
      scenarioText: 'The following letter was written in 1847 by a cotton plantation owner in Mississippi to his business factor in New Orleans. It was discovered in a university archive in 1987 and has been studied by historians ever since.',
      contextText: "Dear Mr. Whitfield,\n\nI write to apprise you of conditions here at Belleview for the season just concluded. The harvest has been satisfactory — some 340 bales at good weight, though the quality of the later picking fell below what I had hoped, owing to weather and to difficulties I shall describe below.\n\nThe workforce numbered forty-three at the start of the season. We lost two to illness in September, both older hands whose constitutions had been weakening for some years. Their loss was anticipated and I have made arrangements to remedy the shortage before spring. The remaining hands performed adequately on the whole, though I was compelled to make examples of three individuals who showed a disposition toward idleness during the critical weeks of October. Order has since been restored.\n\nI trust you will find buyers for the full consignment at or above the prices we discussed in August. The market uncertainty you mentioned in your last letter concerns me, though I remain confident that demand from the English mills will sustain prices through the winter.\n\nYour servant in all things,\nThomas Beaumont Hargrove\n\nNote: This letter was written eight years before the Civil War. 'Factor' was the term for a cotton broker. The phrase 'make examples of' appears in plantation records of the period as a euphemism for physical punishment. Historians have noted that the ledger from which this letter comes records the purchase of two enslaved people in November 1847, shortly after this letter was written.",
      difficulty: 0.6,
      tags: [],
    },
    {
      domain: 'SCIENCE' as const,
      contextLevel: 'SPARSE' as const,
      title: 'The Recurring Hospital Infection',
      scenarioText: 'A hospital in a mid-sized city has reported an unusual cluster of infections among patients in its cardiac surgery unit. The infections have occurred in three separate months over the past year. Hospital administrators and the medical team are trying to understand what is happening.',
      contextText: null,
      difficulty: 0.0,
      tags: [],
    },
    {
      domain: 'SCIENCE' as const,
      contextLevel: 'PARTIAL' as const,
      title: 'Lake Algal Bloom Investigation',
      scenarioText: 'Clearwater Lake, a recreational lake used for swimming and fishing in a rural county, has experienced visible algal blooms in August for three consecutive years. County health officials have issued swimming advisories each time. The blooms were not observed in prior years.',
      contextText: 'Water temperature at bloom onset (surface): 78°F in 2022, 81°F in 2023, 80°F in 2024.\nPhosphorus concentration data: not collected prior to 2024. 2024 reading: 94 µg/L (threshold for bloom risk: 50 µg/L).\nLand use in the watershed: 60% agricultural (primarily row crops), 25% forested, 15% residential.\nA new residential subdivision of 180 homes was completed in the watershed in late 2021.\nThe county began a voluntary program encouraging farmers to use cover crops in 2023. Participation rate: approximately 30%.',
      difficulty: 0.4,
      tags: [],
    },
    {
      domain: 'SCIENCE' as const,
      contextLevel: 'RICH' as const,
      title: 'Antibiotic Resistance at Regional Medical Center',
      scenarioText: "Regional Medical Center (RMC), a 400-bed hospital serving a metropolitan area of 600,000, has reported a significant increase in infections caused by antibiotic-resistant organisms over an 18-month period. The hospital's infection control committee has been tasked with understanding and addressing the problem.",
      contextText: "Resistance data:\n- MRSA (methicillin-resistant Staph aureus) infections: 12 cases in Year 1, 31 cases in Year 2 (months 1-18)\n- C. diff infections: 28 cases in Year 1, 29 cases in Year 2 (roughly stable)\n- Carbapenem-resistant Enterobacteriaceae (CRE): 2 cases in Year 1, 14 cases in Year 2\n\nHospital context:\n- RMC expanded its ICU capacity by 40% in Month 3 of Year 2\n- A new electronic medical record system was implemented in Month 1 of Year 2; staff reported a 3-month adjustment period during which documentation compliance fell\n- Antibiotic stewardship program in place since Year 1, but audits show prescribing compliance dropped from 84% to 71% during the EMR transition\n- Hand hygiene compliance (measured by direct observation): 91% in Year 1, 88% in Year 2\n\nExternal context:\n- A long-term care facility that regularly transfers patients to RMC reported its own MRSA outbreak beginning in Month 2 of Year 2\n- Regional agricultural reports show three large poultry operations within 15 miles of RMC; all use subtherapeutic antibiotics under current regulations\n- A published study from a similar-sized hospital found that ICU expansion increases infection risk by 1.8x per bed added if infection control protocols are not simultaneously scaled\n\nThe infection control committee chair's memo states: 'The EMR transition is the clear culprit here. Documentation failures led to lapses in isolation protocols.'",
      difficulty: 0.7,
      tags: [],
    },
  ]

  const created = []
  for (const s of scenarios) {
    const scenario = await prisma.scenario.create({ data: s })
    created.push(`[${scenario.domain}/${scenario.contextLevel}] ${scenario.title}`)
  }

  return NextResponse.json({
    users: [student.email, educator.email],
    scenarios: created,
  })
}
