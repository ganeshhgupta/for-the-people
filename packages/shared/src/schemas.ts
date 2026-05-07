import { z } from 'zod';

const CitationSchema = z.string();

const FactSchema = z.object({
  claim: z.string(),
  tier: z.union([z.literal(1), z.literal(2)]),
  citations: z.array(CitationSchema),
});

const NarrativeSchema = z.object({
  summary: z.string(),
  key_claims: z.array(z.object({ claim: z.string(), citations: z.array(CitationSchema) })),
  framing_devices: z.array(z.string()),
  sources_used: z.array(z.string()),
});

const PrecedentSchema = z.object({
  event: z.string(),
  year: z.number(),
  citing_outlets: z.array(z.string()),
});

const RhetoricFlagSchema = z.object({
  type: z.enum(['RED_HERRING', 'BROKEN_PROMISE', 'EVASION', 'THREAT', 'FACTUAL_FALSEHOOD']),
  leader_name: z.string(),
  party: z.string(),
  quoted_statement: z.string(),
  context: z.string(),
  contradicting_fact_or_question: z.string(),
  citation: z.string(),
});

const StatisticSchema = z.object({
  claim: z.string(),
  value: z.string(),
  unit: z.string(),
  year: z.number(),
  source_authority: z.string(),
  source_url: z.string().nullable(),
  self_confidence: z.enum(['high', 'medium']),
});

const NamedIndividualSchema = z.object({
  name: z.string(),
  role: z.string(),
  party_or_affiliation: z.string(),
  procedural_status: z.enum([
    'TIER_1_CONVICTED',
    'TIER_2_CHARGED',
    'TIER_3_ALLEGED',
    'PROCEDURAL_BARRIERS_NOTED',
  ]),
  specific_acts: z.array(z.string()),
  status_evidence: z.array(z.object({ fact: z.string(), citation: z.string() })),
  procedural_barriers: z
    .array(z.object({ fact: z.string(), citation: z.string() }))
    .nullable(),
});

const CommonGroundSchema = z.object({
  proposal: z.string(),
  why_right_might_accept: z.string(),
  why_left_might_accept: z.string(),
  why_it_might_still_fail: z.string(),
});

export const SynthesisOutputSchema = z
  .object({
    story_age_band: z.enum(['breaking', 'developing', 'mature', 'historical']),
    established_facts: z.array(FactSchema),
    reported_facts: z.array(FactSchema),
    contested_claims: z.object({
      right_narrative: NarrativeSchema,
      left_narrative: NarrativeSchema,
      other_narrative: NarrativeSchema.nullable(),
    }),
    named_individuals: z.array(NamedIndividualSchema),
    precedents_cited_by_right: z.array(PrecedentSchema),
    precedents_cited_by_left: z.array(PrecedentSchema),
    precedents_cited_by_other: z.array(PrecedentSchema),
    rhetoric_flags: z.array(RhetoricFlagSchema),
    statistics: z.array(StatisticSchema),
    common_ground: z.array(CommonGroundSchema).nullable(),
    irreconcilable_disagreements: z.array(z.string()),
    model_uncertainty_notes: z.string().min(1),
  })
  .refine(
    (data) => {
      if (data.common_ground === null && data.irreconcilable_disagreements.length === 0) {
        return false;
      }
      return true;
    },
    {
      message:
        'If common_ground is null, irreconcilable_disagreements must be non-empty.',
    }
  );

export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>;
export type NamedIndividual = z.infer<typeof NamedIndividualSchema>;
export type RhetoricFlag = z.infer<typeof RhetoricFlagSchema>;
export type Statistic = z.infer<typeof StatisticSchema>;
