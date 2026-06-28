import Anthropic from '@anthropic-ai/sdk'
import type { Domain, ContextLevel, QuestionScoreResult } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DOMAIN_SYSTEM_PROMPTS: Record<Domain, string> = {
  MATH: 'You are a PhD-level mathematician and mathematics education researcher. You are deeply familiar with content at the pre-calculus, calculus, statistics, and discrete mathematics level. You know what variables, relationships, and structures matter in mathematical modeling scenarios.',
  ELA: 'You are a PhD-level literary scholar and rhetoric specialist with expertise in textual analysis, narrative theory, rhetorical criticism, and the history of English-language texts. You are familiar with the conventions of literary analysis, close reading, and argumentation.',
  SCIENCE: 'You are a PhD-level research scientist with broad knowledge spanning biology (particularly ecology, cell biology, and genetics), chemistry, earth science, and physics. You are familiar with experimental design, data interpretation, and the conventions of scientific reasoning.',
}

function buildScoringPrompt(
  domain: Domain,
  scenarioText: string,
  contextText: string | undefined,
  contextLevel: ContextLevel,
  question: string
): string {
  return `You are an expert assessment scorer evaluating a student's question submitted in response to a real-world scenario.

DOMAIN: ${domain}
CONTEXT LEVEL: ${contextLevel}
SCENARIO: ${scenarioText}
${contextText ? `CONTEXTUAL INFORMATION PROVIDED TO STUDENT: ${contextText}` : ''}

STUDENT'S QUESTION: "${question}"

Score this question on FIVE dimensions. Return ONLY valid JSON matching this exact schema with no additional text:

{
  "d1": {
    "score": <integer 1-5>,
    "rationale": "<2-3 sentences citing specific language in the question>"
  },
  "d2": {
    "score": <integer 1-5>,
    "rationale": "<2-3 sentences>",
    "domainConceptsIdentified": ["<concept>"],
    "domainConceptsMissed": ["<concept>"]
  },
  "d3": {
    "score": <integer 1-5>,
    "rationale": "<2-3 sentences>",
    "questionType": "<one of: fact-seeking|descriptive|explanatory|causal|conditional|assumption-surfacing>",
    "assumptionIdentified": "<string or null>"
  },
  "d4": {
    "score": <integer 1-5>,
    "rationale": "<2-3 sentences>",
    "questionLevel": <integer 1-5>,
    "questionCategory": "<one of: recall|application|explanation|analysis|evaluation|synthesis>",
    "wouldExpertAsk": <boolean>,
    "investigationOpened": "<brief description or none>"
  },
  "d5": {
    "score": <integer 1-5>,
    "rationale": "<2-3 sentences>",
    "contextUsed": <boolean>,
    "asksAboutGiven": <boolean>
  },
  "feedback": "<2-3 sentence growth-oriented feedback, Socratic not corrective — help the student see what a stronger question might probe without giving it away>"
}

RUBRICS:

D1 LINGUISTIC SOPHISTICATION (grammar, vocabulary, precision):
5: Grammatically flawless, precise domain vocabulary where relevant, complex but clear structure, zero redundancy
4: Grammatically correct, mostly precise vocabulary, one minor register slip
3: Mostly correct (1-2 errors), general vocabulary rather than precise terms, comprehensible but imprecise
2: Grammatical errors cause ambiguity, vague or misused vocabulary, reader must infer meaning
1: Barely comprehensible; fragment or statement rather than question

D2 CONTENT KNOWLEDGE SIGNAL (domain understanding):
5: Demonstrates domain command; correctly identifies operative variables; sharply distinguishes given vs. unknown; only someone with real knowledge would ask this
4: Shows clear domain understanding; key variables identified; slight imprecision in naming
3: Partial understanding; some variables identified, others missed or conflated
2: Surface-level; uses domain vocabulary without depth; peripheral rather than central focus
1: No domain knowledge signal; generic question applicable to any scenario

D3 CRITICAL THINKING DEPTH (analysis beyond the surface):
5: Surfaces non-obvious assumption; seeks causal/conditional/mechanistic relationship; precisely scoped; requires moving beyond given information
4: Seeks relational answer; doesn't merely accept framing; appropriate scope; would advance understanding
3: Asks "why" but at shallow causal level; accepts scenario framing; somewhat helpful
2: Asks for fact, definition, or description; accepts scenario entirely at face value
1: Restates given information, out of scope, or too vague to answer meaningfully

D4 INQUIRY SOPHISTICATION (DOK level of question):
5: Opens substantial investigation; conditional/evidential/meta-cognitive phrasing; expert-level question
4: Substantively productive; analytical or evaluative; appropriately open; invites exploration
3: Seeks explanation/mechanism but leads to relatively closed answer
2: Descriptive "how" or "what happens"; narrow investigative trajectory quickly exhausted
1: Recall-seeking or yes/no; closes inquiry; confirms a single fact

D5 CONTEXT INTEGRATION (reading comprehension signal — did they read and process the provided context?):
5: Explicitly builds on the provided context to probe what is missing; demonstrates full comprehension of the given material
4: Clearly informed by the context; does not ask about something already answered in it
3: Partially engages with context; may miss some of what was provided
2: Ignores context; asks questions that the provided information already answers
1: Asks about something explicitly stated in the context, suggesting it was not read or understood`
}

export async function scoreQuestion(
  domain: Domain,
  contextLevel: ContextLevel,
  scenarioText: string,
  contextText: string | undefined,
  question: string
): Promise<QuestionScoreResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    system: DOMAIN_SYSTEM_PROMPTS[domain],
    messages: [
      {
        role: 'user',
        content: buildScoringPrompt(domain, scenarioText, contextText, contextLevel, question),
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = JSON.parse(text)

  const composite =
    parsed.d1.score * 0.15 +
    parsed.d2.score * 0.30 +
    parsed.d3.score * 0.30 +
    parsed.d4.score * 0.25

  return {
    d1Linguistic: { score: parsed.d1.score, rationale: parsed.d1.rationale },
    d2ContentKnowledge: {
      score: parsed.d2.score,
      rationale: parsed.d2.rationale,
      domainConceptsIdentified: parsed.d2.domainConceptsIdentified ?? [],
      domainConceptsMissed: parsed.d2.domainConceptsMissed ?? [],
    },
    d3CriticalThinking: {
      score: parsed.d3.score,
      rationale: parsed.d3.rationale,
      questionType: parsed.d3.questionType,
      assumptionIdentified: parsed.d3.assumptionIdentified ?? null,
    },
    d4InquirySoph: {
      score: parsed.d4.score,
      rationale: parsed.d4.rationale,
      questionLevel: parsed.d4.questionLevel,
      questionCategory: parsed.d4.questionCategory,
      wouldExpertAsk: parsed.d4.wouldExpertAsk,
      investigationOpened: parsed.d4.investigationOpened,
    },
    d5ContextIntegration: {
      score: parsed.d5.score,
      rationale: parsed.d5.rationale,
      contextUsed: parsed.d5.contextUsed,
      asksAboutGiven: parsed.d5.asksAboutGiven,
    },
    composite,
    feedback: parsed.feedback,
  }
}

export async function generateScenario(
  domain: Domain,
  contextLevel: ContextLevel,
  difficulty: number
): Promise<{ title: string; scenarioText: string; contextText?: string }> {
  const contextInstructions = {
    SPARSE:
      'Write a SPARSE scenario: 40-80 words, just enough to name the situation. Maximum ambiguity. No quantitative data, no causal context, no outcomes. Force the reader to ask foundational questions.',
    PARTIAL:
      'Write a PARTIAL scenario: 120-200 words. Provide 40-60% of the information needed for full analysis. Include at least one numerical data point. Leave key variables unstated without announcing their absence.',
    RICH:
      'Write a RICH scenario: 300-500 words. Provide abundant information — some relevant, some irrelevant. Include at least one stakeholder framing that introduces potential bias. May include a small table or quoted statement.',
  }

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: DOMAIN_SYSTEM_PROMPTS[domain],
    messages: [
      {
        role: 'user',
        content: `Generate a ${domain} scenario for a university entrance assessment. Difficulty level: ${difficulty.toFixed(1)} (scale -3 to +3, where 0 is average, +3 is hardest).

${contextInstructions[contextLevel]}

Requirements:
- Real-world context, not abstract or textbook-style
- Culturally neutral and fair across demographic groups
- Rewards sophisticated questioning over surface-level questioning
- Appropriate for a college-bound high school senior or first-year college student

Return ONLY valid JSON with no additional text:
{
  "title": "<short descriptive title, 5-8 words>",
  "scenarioText": "<the core scenario>",
  "contextText": "<additional context or data given to the student, or null for SPARSE>"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  return JSON.parse(text)
}
