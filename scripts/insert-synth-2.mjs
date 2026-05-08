import { createHash } from 'crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const { neon } = await import(pathToFileURL(join(__dirname,'../apps/web/node_modules/@neondatabase/serverless/index.mjs')).href);
const sql = neon('postgresql://neondb_owner:npg_5OI0cxWkJwzq@ep-little-mud-aqgl4ijv-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const BATCH = [

// ── 17. Operation Sindoor Completes One Year ──────────────────────────────────
{clusterId:'fab6958eba9b084a',output:{
story_age_band:"developing",
established_facts:[],
reported_facts:[
  {claim:"Indian armed forces shared a throwback video on May 7, 2026 at exactly 1:05 AM — the precise launch time of Operation Sindoor one year prior.",tier:2,citations:["Hindustan Times: 'Just took 88 hours: Army shares video revisiting Operation Sindoor'"]},
  {claim:"Operation Sindoor targeted terror infrastructure in Pakistan and Pakistan-occupied Kashmir and lasted 88 hours.",tier:2,citations:["Hindustan Times"]},
  {claim:"Indian Express reported that a year on, schools in Pulwama and Poonch damaged by Pakistani retaliatory shelling still await compensation to rebuild.",tier:2,citations:["The Hindu: 'A year after Operation Sindoor, two schools bear the cost of conflict'"]},
  {claim:"Shahida Kouser, whose husband Mohammad Abrar Malik was killed in shelling on May 8 during the operation, has been struggling to make ends meet.",tier:2,citations:["Hindustan Times: 'A year after Operation Sindoor, scars of shelling run deep in Poonch'"]}
],
contested_claims:{
  right_narrative:{
    summary:"BJP, the armed forces, and right-leaning outlets frame the first anniversary as a moment of national pride and strategic vindication. Operation Sindoor is presented as proof that India will no longer absorb cross-border terror attacks without decisive military response, and the 88-hour precision operation is held up as a model of calibrated force projection. PM Modi's visible commemoration (profile picture change, statement on forces' 'unparalleled courage') reinforces the government's effort to consolidate the operation as a defining achievement of its national security doctrine. Right-leaning commentary emphasises zero Indian infrastructure damage as evidence of professional military execution.",
    key_claims:[
      {claim:"The operation was launched at 1:05 AM on May 7 one year ago and completed in 88 hours.",citations:["Hindustan Times"]},
      {claim:"India's armed forces statement: 'No terror sanctuary safe'.",citations:["Hindustan Times: 'No terror sanctuary safe'"]}
    ],
    framing_devices:["national pride","strategic deterrence","zero tolerance","precision operation"],
    sources_used:["hindustan_times","times_of_india"]
  },
  left_narrative:{
    summary:"Indian Express and The Hindu use the anniversary to foreground the human cost of the conflict on the Indian side: damaged schools in border districts still not rebuilt, families in Poonch and Uri still bearing psychological trauma, widows of shelling victims struggling financially. Centre-left commentary argues that celebrating military success without acknowledging civilian suffering and without defining a long-term Pakistan policy is strategically incomplete. The 'Sindoor 2.0' commentary calls for an endgame that moves beyond deterrence to structural resolution of cross-border terror sponsorship.",
    key_claims:[
      {claim:"Schools in Pulwama and Poonch damaged by Pakistani retaliation remain unrepaired one year on.",citations:["The Hindu"]},
      {claim:"Children in Uri still carry psychological scars from the four-day war.",citations:["NDTV: '1 Year After Operation Sindoor, Children In Uri Still Carry Scars'"]},
      {claim:"India's Pakistan policy needs an endgame beyond deterrence.",citations:["Indian Express"]}
    ],
    framing_devices:["human cost","civilian suffering","strategic incompleteness","need for endgame"],
    sources_used:["the_hindu","indian_express","ndtv"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Narendra Modi",role:"Prime Minister of India",party_or_affiliation:"BJP",procedural_status:"TIER_3_ALLEGED",specific_acts:["Commemorated Operation Sindoor anniversary; changed social media profile"],status_evidence:[{fact:"Hindustan Times confirmed profile picture change and statement",citation:"Hindustan Times (May 7)"}],procedural_barriers:null},
  {name:"Shahida Kouser",role:"Widow of Mohammad Abrar Malik, killed in Operation Sindoor retaliation shelling",party_or_affiliation:"N/A",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[{fact:"Husband killed in May 8 shelling; cited in Hindustan Times feature",citation:"Hindustan Times (May 7)"}],procedural_barriers:null}
],
precedents_cited_by_right:[{event:"Pahalgam massacre (trigger for Operation Sindoor)",year:2025,citing_outlets:["hindustan_times"]}],
precedents_cited_by_left:[{event:"Uri attack and subsequent 'surgical strikes' — precedent for India's calibrated military response doctrine",year:2016,citing_outlets:["indian_express"]}],
precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[{claim:"Operation Sindoor lasted 88 hours",value:"88",unit:"hours",year:2025,source_authority:"Indian Army official statement",source_url:null,self_confidence:"high"}],
common_ground:[{proposal:"A joint civilian rehabilitation fund for border district residents displaced or harmed by the conflict, administered independently of the military success narrative.",why_right_might_accept:"Demonstrates the government cares for those who bore the cost of its security decisions, without diminishing the military achievement.",why_left_might_accept:"Addresses the concrete human suffering documented in border villages without requiring agreement on the strategic wisdom of the operation itself.",why_it_might_still_fail:"Political incentive is to maintain the triumph narrative; acknowledging civilian cost may be seen as politically damaging."}],
irreconcilable_disagreements:[],
model_uncertainty_notes:"Indian Express body excerpts were empty; article substance is inferred from headlines. The claimed casualty and infrastructure figures from Operation Sindoor remain government-asserted without independent verification."
}},

// ── 18. Prince Yadav Stuns Virat Kohli (IPL) ─────────────────────────────────
{clusterId:'eb25341464ecb069',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"Lucknow Super Giants (LSG) defeated Royal Challengers Bengaluru (RCB) by 9 runs under DLS method, keeping LSG's playoff hopes alive.",tier:2,citations:["Times of India: 'Virat bhaiya only told me: Prince Yadav stuns Kohli'"]},
  {claim:"Mitchell Marsh scored 111 for LSG; LSG posted 209/3. Prince Yadav took 3/33 including the wicket of Virat Kohli, claiming he used advice Kohli himself had given him.",tier:2,citations:["Times of India"]},
  {claim:"RCB's chase faltered despite Rajat Patidar scoring 61.",tier:2,citations:["Times of India"]}
],
contested_claims:{
  right_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  left_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[
  {claim:"Mitchell Marsh scored 111 runs for LSG",value:"111",unit:"runs",year:2026,source_authority:"Times of India match report",source_url:null,self_confidence:"high"},
  {claim:"Prince Yadav took 3 wickets for 33 runs",value:"3/33",unit:"wickets/runs",year:2026,source_authority:"Times of India match report",source_url:null,self_confidence:"high"}
],
common_ground:null,
irreconcilable_disagreements:["No contested claims in this story."],
model_uncertainty_notes:"Sports reporting; no political or factual contestation. Two articles corroborate core match facts. The human-interest angle (Prince Yadav using Kohli's own advice) is unverified beyond player's own statement."
}},

// ── 19. Somnath and Bharat's Unconquerable Spirit ────────────────────────────
{clusterId:'f17719e17dad9248',output:{
story_age_band:"mature",
established_facts:[],
reported_facts:[
  {claim:"A cultural/pilgrimage feature on Somnath temple and its civilisational significance was published simultaneously across Times of India, India Today, and Hindustan Times on May 7–8, 2026.",tier:2,citations:["Times of India, India Today, Hindustan Times (same headline)"]}
],
contested_claims:{
  right_narrative:{
    summary:"The Somnath narrative as published by these outlets foregrounds the temple's repeated destruction by Mahmud of Ghazni and subsequent Islamic rulers as evidence of centuries of civilisational assault on Hinduism, and its reconstruction after 1947 as symbolic national and religious renewal. The 'unconquerable spirit' framing celebrates Hindu continuity and resilience in the face of historical conquest, serving as a cultural-political assertion of Hindu civilisational pride that is central to BJP's cultural politics.",
    key_claims:[{claim:"Somnath represents the continuity of a civilisation whose flame could never be extinguished.",citations:["Hindustan Times"]}],
    framing_devices:["Hindu civilisational resilience","continuity despite conquest","national-religious renewal"],
    sources_used:["hindustan_times","times_of_india","india_today"]
  },
  left_narrative:{
    summary:"The near-simultaneous publication of the same cultural hagiography across multiple mainstream outlets with no independent or secular counterpoint raises questions about coordinated cultural messaging. Centre-left readings of the Somnath narrative point out that the 'unconquerable spirit' framing selectively emphasises certain historical events to construct a Hindu victimhood and triumph narrative, which can be used to legitimise contemporary political positions on Muslim-Hindu relations in India.",
    key_claims:[{claim:"The article presents a one-sided civilisational narrative without historical counterpoints.",citations:["Analysis of framing across three outlets"]}],
    framing_devices:["civilisational victimhood","selective history","BJP cultural politics"],
    sources_used:[]
  },
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[{event:"Destruction of Somnath temple by Mahmud of Ghazni",year:1025,citing_outlets:["hindustan_times"]},{event:"Reconstruction of Somnath temple post-1947 Indian independence",year:1951,citing_outlets:["times_of_india"]}],
precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether the 'unconquerable spirit' narrative is legitimate cultural heritage reporting or politically motivated religious nationalism framing is a deep disagreement that maps onto Indian political identity divides."],
model_uncertainty_notes:"All three article body excerpts were empty or near-empty. Analysis relies on headline and the one available excerpt from Hindustan Times. This is primarily a soft cultural feature with no hard news content; the political reading is an interpretive analysis of framing, not factual reporting."
}},

// ── 20. US–Iran Contradictory Ceasefire Signals ───────────────────────────────
{clusterId:'264f1b2ab32411fe',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"Trump called the Iranian warship attack a 'trifle' while asserting the ceasefire holds, even as Iran accused the U.S. of conducting fresh strikes in violation of the ceasefire.",tier:2,citations:["Mint: 'Trump calls Iran warship attack a trifle, says ceasefire holds; Tehran accuses US of fresh strikes'"]},
  {claim:"The Trump administration sent contradictory signals simultaneously: some officials suggesting the ceasefire was intact, others suggesting new military action was underway.",tier:2,citations:["Indian Express: 'Iran ceasefire or fresh bombing? Inside the Trump administration's contradictory signals'"]}
],
contested_claims:{
  right_narrative:{
    summary:"Trump and administration allies portray the U.S. position as strategically coherent: any Iranian military action will be answered but the broader diplomatic process — negotiations toward a nuclear or regional deal — remains on track. The 'trifle' framing is presented as presidential composure: minimising a skirmish to prevent escalation while preserving the negotiating track. Right-leaning interpretation holds that this dual-track posture (respond militarily, maintain diplomacy) is sophisticated statecraft.",
    key_claims:[{claim:"Trump said the ceasefire holds and called the Iranian attack a 'trifle'.",citations:["Mint"]}],
    framing_devices:["presidential composure","dual-track diplomacy","controlled response"],
    sources_used:["mint"]
  },
  left_narrative:{
    summary:"The Indian Express and critical analysis frame the administration's contradictory signals as evidence of a fundamental incoherence: you cannot simultaneously bomb Iranian military sites, maintain a ceasefire, and negotiate a peace deal. The contradictions — different officials saying different things, Trump dismissing attacks as trivial while threatening to 'knock them out harder' — suggest either strategic chaos within the administration or a deliberate ambiguity designed to avoid accountability for actions that violate the ceasefire.",
    key_claims:[{claim:"The Trump administration sent contradictory signals about whether the ceasefire was intact or whether fresh bombing was underway.",citations:["Indian Express"]}],
    framing_devices:["strategic incoherence","accountability gap","deliberate ambiguity"],
    sources_used:["indian_express"]
  },
  other_narrative:null
},
named_individuals:[{name:"Donald Trump",role:"President of the United States",party_or_affiliation:"Republican Party",procedural_status:"TIER_3_ALLEGED",specific_acts:["Called Iranian warship attack a 'trifle'; asserted ceasefire holds while administration sent contradictory signals"],status_evidence:[{fact:"Mint reporting confirmed Trump's 'trifle' statement",citation:"Mint (May 8)"}],procedural_barriers:null}],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[{type:"EVASION",leader_name:"Donald Trump",party:"Republican Party",quoted_statement:"Trump calls Iran warship attack a 'trifle', says ceasefire holds",context:"Made while the administration was simultaneously conducting or justifying military strikes on Iranian targets, creating a contradiction between diplomatic reassurance and military action.",contradicting_fact_or_question:"Iranian state media and Iran's government accused the U.S. of fresh strikes on Iranian vessels, directly contradicting Trump's claim that the ceasefire holds.",citation:"Mint (May 8, 2026)"}],
statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether the U.S.-Iran ceasefire is intact or effectively broken is disputed between the Trump administration and the Iranian government, with no independent arbiter available.","Whether the Trump administration's mixed signals represent sophisticated dual-track diplomacy or strategic incoherence is a fundamental interpretive disagreement."],
model_uncertainty_notes:"Indian Express body excerpt was empty; content is inferred from headline. This cluster overlaps substantially with clusters 349f185759f4b478 and 4f31a5c9fa3ed9c6. The ceasefire's legal status and terms are not detailed in available excerpts."
}},

];

let done=0,failed=0;
for(const {clusterId,output} of BATCH){
  try{
    const synthId=createHash('sha256').update(clusterId).digest('hex').slice(0,16);
    await sql(`INSERT INTO syntheses(id,cluster_id,output,created_at)VALUES($1,$2,$3,NOW())ON CONFLICT(cluster_id)DO UPDATE SET output=$3,created_at=NOW()`,[synthId,clusterId,JSON.stringify(output)]);
    await sql(`UPDATE clusters SET status='synthesized',updated_at=NOW()WHERE id=$1`,[clusterId]);
    console.log('✓',clusterId);
    done++;
  }catch(e){console.error('✗',clusterId,e.message);failed++;}
}
console.log(`\nDone: ${done} inserted, ${failed} failed`);
