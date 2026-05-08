import { createHash } from 'crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const { neon } = await import(pathToFileURL(join(__dirname,'../apps/web/node_modules/@neondatabase/serverless/index.mjs')).href);
const sql = neon('postgresql://neondb_owner:npg_5OI0cxWkJwzq@ep-little-mud-aqgl4ijv-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const clusterId = '70e1e3d2422f30b5';

const output = {
story_age_band: "breaking",
established_facts: [
  {
    claim: "BJP won 207 of 293 seats in the 2026 West Bengal Assembly elections, giving it a comfortable majority (halfway mark: 147). TMC was reduced to 80 seats, down from 215 in 2021.",
    tier: 1,
    citations: ["India Today: 'BJP has dethroned the TMC in West Bengal, winning 207 of 293 seats'", "Indian Express: 'BJP wins 207 seats, TMC 80'", "Hindustan Times: 'BJP's historic win with 207 out of 294 seats'"]
  },
  {
    claim: "Governor RN Ravi dissolved the West Bengal Legislative Assembly on May 7, 2026, invoking Article 174(2)(b) of the Constitution of India, removing Mamata Banerjee as Chief Minister.",
    tier: 1,
    citations: ["India Today: 'Governor RN Ravi dissolves cabinet, Mamata Banerjee no longer Chief Minister'", "The Hindu: 'West Bengal Governor dissolves State Legislative Assembly'"]
  },
  {
    claim: "Suvendu Adhikari defeated Mamata Banerjee in the Bhabanipur constituency in 2026 — five years after previously defeating her in Nandigram in 2021.",
    tier: 1,
    citations: ["India Today: 'Bhabanipur election result: Why Mamata Banerjee lost her safe seat to BJP's Suvendu Adhikari'"]
  },
  {
    claim: "22 of 35 TMC ministers who contested the 2026 election were defeated — a 63% ministerial defeat rate.",
    tier: 1,
    citations: ["Hindustan Times: 'Mamata Banerjee among 22 TMC ministers defeated in BJP's West Bengal election win'"]
  }
],
reported_facts: [
  {
    claim: "BJP's oath-taking ceremony was scheduled for May 9, 2026, with Union Home Minister Amit Shah appointed as the central observer to preside over the BJP legislative party meeting on May 8 to elect the leader.",
    tier: 2,
    citations: ["The Hindu: 'Newly elected BJP legislators will meet on Friday (May 8, 2026) at 4pm'", "NDTV: 'BJP Says Oath-Taking Ceremony To Take Place On May 9'", "India Today: 'BJP MLAs meet tomorrow at 2 pm to elect leader of legislative party'"]
  },
  {
    claim: "Suvendu Adhikari and Dilip Ghosh were the top contenders for Chief Minister; ground reports and BJP cadre sentiment strongly favoured Adhikari.",
    tier: 2,
    citations: ["India Today: 'West Bengal Next CM: The risks of not having BJP's Suvendu Adhikari as the Chief Minister'", "Times of India: 'Suvendu Adhikari, Dilip Ghosh top contenders'"]
  },
  {
    claim: "West Bengal Police reported 2 deaths and 433 arrests for post-poll violence since counting day (May 4, 2026); incidents included arson and vandalism of TMC offices.",
    tier: 2,
    citations: ["The Hindu (May 6 reference in blog): 'two deaths and 433 arrests since the day of counting'", "NDTV: 'stray incidents of post-poll violence were reported across West Bengal'"]
  },
  {
    claim: "Mamata Banerjee held a press conference stating she would not resign, claiming 'Officially, through the Election Commission, they can defeat us, but morally we won the election' and alleging the result was a conspiracy.",
    tier: 2,
    citations: ["The Guardian: 'Defeated by conspiracy: West Bengal chief minister refuses to resign'", "Times of India: 'Mamata Banerjee refuses to resign, rejects poll defeat'", "The Hindu: 'Mamata Banerjee ruled out stepping down, claiming the verdict was not a genuine public mandate'"]
  }
],
contested_claims: {
  right_narrative: {
    summary: "BJP and its supporters frame the 2026 West Bengal result as a historic democratic verdict that ends 15 years of TMC rule — which they characterise as corrupt, dynasty-based, and sustained through systematic violence against BJP workers. Senior BJP leaders declared 'Poriborton has arrived with a bulldozer', invoking the 2011 anti-Left slogan TMC itself once used. The right-wing narrative holds that the BJP's sweeping 207-seat win, including Suvendu Adhikari personally defeating Mamata Banerjee in her own stronghold Bhabanipur, is unambiguous evidence of a genuine popular mandate. Post-poll violence is attributed exclusively to TMC's 'gunda vahini', and Mamata's refusal to resign is framed as an authoritarian last gasp of a party that used state power to suppress the opposition for years.",
    key_claims: [
      {claim: "BJP won 207 of 293 seats — a decisive mandate ending TMC's 15-year dominance.", citations: ["India Today", "Indian Express"]},
      {claim: "BJP alleges TMC elements disguised as BJP workers are committing post-poll violence to create disorder.", citations: ["The Hindu (BJP West Bengal unit statement, May 6)"]},
      {claim: "Suvendu Adhikari's defeat of Mamata in Bhabanipur carries symbolic weight beyond poll arithmetic.", citations: ["India Today: 'Bhabanipur election result'"]}
    ],
    framing_devices: ["Poriborton (change)", "end of TMC misrule", "democratic verdict", "TMC violence", "historic first BJP government"],
    sources_used: ["times_of_india", "india_today", "ndtv", "hindustan_times"]
  },
  left_narrative: {
    summary: "Mamata Banerjee and TMC reject the election result as a 'conspiracy' facilitated by a biased Election Commission and coordinated BJP-Centre machinery, arguing they won 'morally' even if not officially. The Guardian and left-leaning Indian coverage note that Mamata — described as 'India's fiercest female politician' — is framing this as an institutional assault rather than a defeat of policy or governance. The Hindu and centre-left outlets raise the constitutional question of a sitting CM refusing to resign and what it reveals about the fragility of India's democratic norms under stress. TMC also alleges that the reported post-poll violence is either BJP-on-BJP or being misattributed, pointing to their own offices being vandalised.",
    key_claims: [
      {claim: "Mamata Banerjee claimed the result was 'not a genuine public mandate but the result of a conspiracy', specifically alleging EC bias.", citations: ["The Hindu", "The Guardian"]},
      {claim: "TMC did not contest against only BJP but against a 'broader machinery', Mamata alleged.", citations: ["The Hindu"]},
      {claim: "Kalyan Banerjee (TMC) asked 'Where is the rule that says a Chief Minister must resign after losing?' — raising constitutional ambiguity.", citations: ["Indian Express live blog"]}
    ],
    framing_devices: ["electoral conspiracy", "EC bias", "moral majority", "institutional assault on democracy", "CM refusal as constitutional question"],
    sources_used: ["the_hindu", "web_theguardian", "indian_express", "web_bbc"]
  },
  other_narrative: {
    summary: "International and independent coverage (BBC, The Guardian) contextualises this result within the broader pattern of Indian state elections where the national ruling party BJP has progressively broken opposition strongholds. They note that Mamata Banerjee's survival as a political force will depend on whether TMC can regroup in the Opposition and whether her refusal to accept defeat damages or strengthens her political identity. The constitutional question raised by The Hindu — what happens when a sitting CM refuses to leave office — is treated as a serious governance gap that India's parliamentary system has never fully stress-tested.",
    key_claims: [
      {claim: "Mamata Banerjee's political survival instinct means she is unlikely to disappear from Indian politics even after this defeat.", citations: ["BBC"]},
      {claim: "India's constitutional conventions on CM resignation after electoral defeat are not legally enforceable — the Governor's dissolution is the actual mechanism.", citations: ["The Hindu: 'What happens if a Chief Minister refuses to relinquish office'"]}
    ],
    framing_devices: ["BJP's state-by-state consolidation", "Mamata's political survival", "constitutional grey area"],
    sources_used: ["web_bbc", "web_theguardian", "the_hindu"]
  }
},
named_individuals: [
  {
    name: "Mamata Banerjee",
    role: "Outgoing Chief Minister of West Bengal; TMC supremo",
    party_or_affiliation: "Trinamool Congress",
    procedural_status: "TIER_3_ALLEGED",
    specific_acts: ["Refused to resign as CM after BJP's election victory", "Alleged Election Commission bias without providing evidence", "Lost Bhabanipur constituency to Suvendu Adhikari"],
    status_evidence: [
      {fact: "Governor dissolved assembly after Mamata's refusal to resign", citation: "India Today, The Hindu"},
      {fact: "Lost Bhabanipur to Suvendu Adhikari — confirmed by official EC results", citation: "India Today"}
    ],
    procedural_barriers: null
  },
  {
    name: "Suvendu Adhikari",
    role: "BJP leader; defeated Mamata in Bhabanipur; frontrunner for Chief Minister",
    party_or_affiliation: "BJP",
    procedural_status: "TIER_3_ALLEGED",
    specific_acts: ["Won Bhabanipur constituency, defeating Mamata Banerjee", "Frontrunner for West Bengal CM post"],
    status_evidence: [
      {fact: "Defeated Mamata in Bhabanipur 2026 after Nandigram 2021", citation: "India Today"}
    ],
    procedural_barriers: null
  },
  {
    name: "RN Ravi",
    role: "Governor of West Bengal",
    party_or_affiliation: "Appointed by BJP-led Central Government",
    procedural_status: "TIER_3_ALLEGED",
    specific_acts: ["Dissolved West Bengal Legislative Assembly on May 7, 2026 under Article 174(2)(b)"],
    status_evidence: [
      {fact: "Official dissolution notice cited in India Today and The Hindu", citation: "India Today, The Hindu (May 7)"}
    ],
    procedural_barriers: null
  },
  {
    name: "Amit Shah",
    role: "Union Home Minister; BJP central observer for WB CM selection",
    party_or_affiliation: "BJP",
    procedural_status: "TIER_3_ALLEGED",
    specific_acts: ["Appointed as central observer to preside over BJP legislative party meeting on May 8"],
    status_evidence: [{fact: "Confirmed in The Hindu and multiple outlets", citation: "The Hindu (May 8)"}],
    procedural_barriers: null
  },
  {
    name: "Dilip Ghosh",
    role: "BJP leader; CM contender; credited with building Bengal BJP from 3 MLAs in 2016",
    party_or_affiliation: "BJP",
    procedural_status: "TIER_3_ALLEGED",
    specific_acts: [],
    status_evidence: [],
    procedural_barriers: null
  }
],
precedents_cited_by_right: [
  {event: "TMC's 'Poriborton' anti-Left wave in West Bengal 2011 — BJP appropriates the same slogan", year: 2011, citing_outlets: ["times_of_india"]},
  {event: "Suvendu Adhikari defeats Mamata in Nandigram 2021", year: 2021, citing_outlets: ["india_today"]}
],
precedents_cited_by_left: [
  {event: "Mamata's 2021 Nandigram loss followed by Bhabanipur bypoll win — showing her electoral resilience", year: 2021, citing_outlets: ["the_hindu"]},
  {event: "TMC's allegations of EC bias in multiple recent state elections", year: 2024, citing_outlets: ["the_hindu", "web_theguardian"]}
],
precedents_cited_by_other: [
  {event: "BJP's progressive electoral conquest of opposition-held states: Karnataka (lost), Telangana (lost), Bengal (won)", year: 2023, citing_outlets: ["web_bbc"]}
],
rhetoric_flags: [
  {
    type: "FACTUAL_FALSEHOOD",
    leader_name: "Mamata Banerjee",
    party: "Trinamool Congress",
    quoted_statement: "Officially, through the Election Commission, they can defeat us, but morally we won the election.",
    context: "Made at a press conference after BJP won 207 of 293 seats in the official Election Commission count.",
    contradicting_fact_or_question: "The Election Commission's count — 207 BJP vs 80 TMC — is the only legally valid measure of an election result. 'Moral victory' is not a constitutional concept and directly contradicts the official verdict without any evidence of fraud presented.",
    citation: "Times of India (May 5-6, 2026)"
  },
  {
    type: "EVASION",
    leader_name: "Mamata Banerjee",
    party: "Trinamool Congress",
    quoted_statement: "We will not resign. The verdict was the result of a conspiracy.",
    context: "Refused to name specific conspirators, provide evidence of electoral fraud, or specify which constitutional mechanism she was invoking to remain in office.",
    contradicting_fact_or_question: "India's constitutional convention requires the losing CM to resign; the Governor's dissolution was ultimately required to remove her, raising questions about whether claiming conspiracy without evidence is a legitimate democratic response.",
    citation: "The Guardian, The Hindu (May 5-7, 2026)"
  }
],
statistics: [
  {claim: "BJP won 207 of 293 seats in 2026 West Bengal Assembly elections", value: "207", unit: "seats out of 293", year: 2026, source_authority: "Election Commission of India (via multiple outlets)", source_url: null, self_confidence: "high"},
  {claim: "TMC won 80 seats in 2026, down from 215 in 2021", value: "80", unit: "seats (vs 215 in 2021)", year: 2026, source_authority: "Indian Express, India Today citing EC results", source_url: null, self_confidence: "high"},
  {claim: "22 of 35 TMC ministers who contested were defeated", value: "22 of 35", unit: "ministers defeated", year: 2026, source_authority: "Hindustan Times", source_url: null, self_confidence: "high"},
  {claim: "West Bengal Police recorded 433 arrests and 2 deaths in post-poll violence since May 4, 2026", value: "433 arrests, 2 deaths", unit: "post-poll incidents", year: 2026, source_authority: "West Bengal Police / The Hindu", source_url: null, self_confidence: "medium"}
],
common_ground: null,
irreconcilable_disagreements: [
  "Whether the 2026 West Bengal election result was a genuine democratic mandate or the product of institutional conspiracy (biased EC, central agency interference) is a direct dispute between BJP and TMC, with TMC providing no documentary evidence for its conspiracy claim and BJP providing no independent audit of its own.",
  "Whether the post-poll violence is primarily TMC-inflicted on BJP workers or a mix that includes BJP targeting of TMC cadre is disputed; police data exists (433 arrests) but party affiliation of perpetrators is not broken down in available reporting.",
  "Whether Mamata Banerjee's refusal to resign was a constitutionally defensible act (no law explicitly requires immediate resignation) or an undemocratic obstruction is a genuine constitutional ambiguity that India's parliamentary system has not fully resolved."
],
model_uncertainty_notes: "Multiple articles are live-blog excerpts with navigation UI text mixed into body; some data points (exact seat counts vary slightly: 206 vs 207, 293 vs 294 total seats) reflect intra-day reporting discrepancies before final EC figures. The confirmed EC count of 207/293 appears in Indian Express constituency-wise winner list and India Today — treated as authoritative. International sources (BBC, Guardian) body text was heavily truncated due to paywalls and navigation HTML. The total seat count discrepancy (293 vs 294) may reflect one constituency result pending at time of some reporting."
};

const synthId = createHash('sha256').update(clusterId).digest('hex').slice(0,16);
await sql(
  `INSERT INTO syntheses(id,cluster_id,output,created_at)VALUES($1,$2,$3,NOW())ON CONFLICT(cluster_id)DO UPDATE SET output=$3,created_at=NOW()`,
  [synthId, clusterId, JSON.stringify(output)]
);
await sql(`UPDATE clusters SET status='synthesized',updated_at=NOW()WHERE id=$1`,[clusterId]);
console.log('✓ West Bengal Election 2026 cluster synthesized and inserted.');
console.log('  Cluster ID:', clusterId);
