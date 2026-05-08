import { createHash } from 'crypto';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const { neon } = await import(pathToFileURL(join(__dirname,'../apps/web/node_modules/@neondatabase/serverless/index.mjs')).href);
const sql = neon('postgresql://neondb_owner:npg_5OI0cxWkJwzq@ep-little-mud-aqgl4ijv-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const BATCH = [

// ── 1. US Trade Court Tariffs ──────────────────────────────────────────────────
{clusterId:'8a6f98bfc176b92e',output:{
story_age_band:"breaking",
established_facts:[
  {claim:"The U.S. Court of International Trade issued a 2-1 ruling on May 7, 2026 finding Trump's 10% global tariffs unlawful and invalid.",tier:1,citations:["The Hindu: 'U.S. trade court rules against Trump's global 10% tariff'","Times of India: 'Big setback for Trump: US court rules 10% global tariffs unlawful'","The Hindu: 'Federal court rules against new global tariffs Trump imposed after loss at Supreme Court'"]}
],
reported_facts:[
  {claim:"The three-judge panel of the Court of International Trade in New York found the tariffs illegal after small businesses and the state of Washington sued.",tier:2,citations:["The Hindu (May 8)","Indian Express: 'Trump's sidestep trade strategy hit by new court ruling'"]},
  {claim:"The tariffs were imposed under the International Emergency Economic Powers Act of 1974; the court found this legal basis insufficient.",tier:2,citations:["Times of India","Mint: 'US trade court rules Trump's new 10% tariffs unlawful — What happens next?'"]},
  {claim:"The ruling initially blocks the tariffs only against the two plaintiff companies and the state of Washington, leaving broader application open to further litigation.",tier:2,citations:["The Hindu (May 7)"]}
],
contested_claims:{
  right_narrative:{
    summary:"Pro-executive voices and Trump allies argue the ruling is an instance of judicial overreach into the President's constitutionally broad foreign-commerce and national-security authority. They contend the 1974 IEEPA statute was deliberately written to give the executive flexibility to respond to economic emergencies, and that courts have historically deferred to the President on trade. The right frames the tariffs as a necessary tool to rebalance decades of unfair trade arrangements that hollowed out American manufacturing. From this view, two companies and one state persuading a lower court to block a national economic policy represents activist judging that undermines the separation of powers and the democratic mandate behind Trump's trade agenda.",
    key_claims:[
      {claim:"IEEPA grants broad executive authority to impose tariffs during declared national emergencies; the administration argued this authority covers the trade deficit.",citations:["Mint"]},
      {claim:"A 2-1 split ruling from a lower trade court is not the final word; the administration is expected to appeal.",citations:["The Hindu (May 7)"]}
    ],
    framing_devices:["judicial overreach","executive authority","national security","unfair trade"],
    sources_used:["times_of_india","mint"]
  },
  left_narrative:{
    summary:"Critics of the tariffs, including centre-left Indian outlets reporting on the ruling, frame it as a vindication of the rule of law against an executive branch that has repeatedly stretched statutory authority beyond its textual limits. The left-leaning reading holds that IEEPA was never intended to authorise sweeping across-the-board tariffs on all trading partners simultaneously, and that using a Cold War-era emergency statute to pursue protectionist economic policy is an abuse of emergency powers doctrine. They note the tariffs' destabilising effect on global supply chains and point to small businesses — not ideological opponents — as the parties that successfully challenged them.",
    key_claims:[
      {claim:"Small businesses and the state of Washington — not political opponents — sued and won, suggesting the harm is concrete and widespread.",citations:["The Hindu (May 7)"]},
      {claim:"The 1974 IEEPA statute's justification was found insufficient by the court; the administration's reading of the law was rejected.",citations:["Times of India","Mint"]}
    ],
    framing_devices:["rule of law","judicial check on executive","harm to small businesses","illegal overreach"],
    sources_used:["the_hindu","india_today","indian_express"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Donald Trump",role:"President of the United States",party_or_affiliation:"Republican Party",procedural_status:"TIER_3_ALLEGED",specific_acts:["Imposed 10% global tariffs under IEEPA emergency authority"],status_evidence:[{fact:"Court of International Trade ruled the tariffs unlawful in a 2-1 decision",citation:"The Hindu (May 7 & 8)"}],procedural_barriers:null}
],
precedents_cited_by_right:[],
precedents_cited_by_left:[
  {event:"Historical limits on IEEPA emergency tariff authority in prior administrations",year:1974,citing_outlets:["indian_express"]}
],
precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[],
common_ground:[
  {proposal:"Both sides agree certainty for businesses is a legitimate goal; a negotiated trade framework with statutory authorisation would satisfy rule-of-law concerns while addressing trade imbalances.",why_right_might_accept:"Gets tariff objectives through a durable legal mechanism rather than emergency powers that courts can strike down.",why_left_might_accept:"Removes the constitutional emergency-powers abuse while still allowing trade policy debate through Congress.",why_it_might_still_fail:"The administration has shown no interest in seeking Congressional authorisation; the appeal is faster and preserves executive flexibility."}
],
irreconcilable_disagreements:[],
model_uncertainty_notes:"Indian Express body excerpt was empty. Analysis relies on The Hindu, Mint, TOI, and India Today. The full legal reasoning of the 2-1 ruling is not available in excerpts; tier classifications reflect what is determinable from headlines and available text."
}},

// ── 2. Chandranath Rath Murder ─────────────────────────────────────────────────
{clusterId:'15a0fba3e9da265d',output:{
story_age_band:"breaking",
established_facts:[
  {claim:"Chandranath Rath, personal assistant to BJP leader Suvendu Adhikari and a former Indian Air Force serviceman, was shot dead in North 24 Parganas, West Bengal on the night of May 7, 2026.",tier:1,citations:["Hindustan Times: 'Mystery car, fake plates, ambush: Inside the killing of Suvendu Adhikari aide Chandranath Rath'","The Hindu (May 8)"]}
],
reported_facts:[
  {claim:"Police recovered a car and motorcycle used in the attack; both had fake number plates and the motorcycle had an erased chassis number.",tier:2,citations:["Hindustan Times: 'Fake plate, erased chassis'","The Hindu: 'Vehicles with fake number plates used to shoot Suvendu Adhikari's aide'"," Indian Express: 'Police recover car, bike used in attack'"]},
  {claim:"The SIT determined hitmen had conducted a 72-hour reconnaissance of the area before the attack and that the assault lasted approximately 50 seconds involving 8 bullets.",tier:2,citations:["Times of India: 'Hitmen hired to kill Suvendu's aide conducted recce for 72 hours'","Times of India: '50 seconds, 8 bullets'"]},
  {claim:"Police suspect attackers used a car to force Rath's vehicle to slow near a traffic signal before opening fire.",tier:2,citations:["Hindustan Times: 'Fake plate, erased chassis'"]}
],
contested_claims:{
  right_narrative:{
    summary:"BJP and Suvendu Adhikari frame the killing as a politically motivated targeted assassination by TMC-affiliated actors, arguing that Rath was killed specifically because of his close association with Adhikari and because Adhikari defeated Mamata Banerjee's party. Adhikari publicly demanded the death penalty for the killers and alleged the murder was connected to TMC's post-election violence culture in West Bengal. Right-leaning outlets portray the killing as part of a broader pattern of political violence against BJP workers that the TMC government allegedly tolerated or enabled, and demand a court-monitored CBI investigation rather than a state police inquiry.",
    key_claims:[
      {claim:"Suvendu Adhikari stated Rath was targeted because Adhikari defeated Mamata and because Rath was his close aide.",citations:["Hindustan Times: 'Me defeating Mamata, him being my aide'"]},
      {claim:"Adhikari demanded the death penalty for the killers and called for a CBI investigation.",citations:["The Hindu (May 8)"]}
    ],
    framing_devices:["TMC political violence","targeted assassination","post-poll retribution"],
    sources_used:["hindustan_times","organiser_implied"]
  },
  left_narrative:{
    summary:"TMC MP Saugata Roy, a TMC legislator, broke ranks with any implied party defensiveness by demanding the 'strongest' action against perpetrators and calling for a court-monitored CBI investigation — the same demand as BJP. Centre-leaning and left-adjacent coverage emphasises that the police investigation is ongoing, that no perpetrators have been named or arrested, and that calling it a TMC hit before any arrests is premature. These outlets note the professional, premeditated nature of the attack (fake plates, 72-hour recce, hired killers) to argue the truth may be more complex than simple political retribution.",
    key_claims:[
      {claim:"TMC MP Saugata Roy also demanded strongest action and a court-monitored CBI probe, undercutting the pure partisan framing.",citations:["Hindustan Times: 'TMC MP Saugata Roy demands strongest action'"]},
      {claim:"The investigation is continuing; the victim's family is waiting for the new government before seeking justice.",citations:["Hindustan Times: 'Was busy because of oath ceremony'"]}
    ],
    framing_devices:["ongoing investigation","premature blame","professional contract killing"],
    sources_used:["the_hindu","indian_express"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Chandranath Rath",role:"Personal Assistant to Suvendu Adhikari; former Indian Air Force serviceman",party_or_affiliation:"BJP-affiliated",procedural_status:"TIER_3_ALLEGED",specific_acts:["Victim of targeted shooting"],status_evidence:[{fact:"Shot dead in North 24 Parganas on May 7, 2026",citation:"Hindustan Times, The Hindu, Indian Express"}],procedural_barriers:null},
  {name:"Suvendu Adhikari",role:"BJP leader, defeated Mamata Banerjee in West Bengal elections",party_or_affiliation:"BJP",procedural_status:"TIER_3_ALLEGED",specific_acts:["Alleged by his own account to be indirect motive for Rath's murder"],status_evidence:[],procedural_barriers:null}
],
precedents_cited_by_right:[
  {event:"Pattern of post-election violence against BJP workers in West Bengal",year:2021,citing_outlets:["hindustan_times"]}
],
precedents_cited_by_left:[],
precedents_cited_by_other:[],
rhetoric_flags:[
  {type:"THREAT",leader_name:"Suvendu Adhikari",party:"BJP",quoted_statement:"demands death penalty for the killers",context:"Made before any arrests or trial in the case.",contradicting_fact_or_question:"Demanding a specific sentence before investigation or trial is complete is not appropriate for any political figure, regardless of party.",citation:"The Hindu (May 8)"}
],
statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether the killing was politically motivated by TMC or a separate criminal conspiracy cannot be determined without arrests and a transparent investigation.","Whether state police or CBI should lead the investigation is disputed along party lines."],
model_uncertainty_notes:"Multiple Hindustan Times articles provide the richest detail. Indian Express body excerpts were empty. Perpetrators have not been arrested as of reporting date; motive is contested and unproven."
}},

// ── 3. Tamil Nadu Governor / Government Formation ──────────────────────────────
{clusterId:'cd12785321bb6bec',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"Tamil Nadu election results gave Vijay's TVK party 108 seats, making it the single-largest party; TVK holds 107 MLAs after Vijay himself won two seats.",tier:2,citations:["NDTV: 'All 108 TVK MLAs To Resign If DMK, AIADMK Try To Form Government'","Hindustan Times: 'Tamil Nadu governor keeps Vijay waiting'"]},
  {claim:"Governor R.V. Arlekar met Vijay on Wednesday but did not invite him to form a government on the basis that TVK had not established majority.",tier:2,citations:["Hindustan Times: 'Tamil Nadu governor keeps Vijay waiting'","The Hindu: 'DMK explores backing AIADMK, Tamil Nadu Governor tells Vijay he hasn't established majority'"]},
  {claim:"There is active discussion of a DMK-AIADMK alliance — the first in over 50 years — to jointly prevent TVK from forming government; CPI(M), CPI and VCK hold the balance.",tier:2,citations:["The Hindu","NDTV: 'AIADMK-DMK Pact Could Happen In Tamil Nadu'"]}
],
contested_claims:{
  right_narrative:{
    summary:"BJP-aligned and anti-TVK commentary frames the possible DMK-AIADMK alliance as a constitutionally legitimate use of coalition arithmetic to prevent an untested new party from governing. They argue the Governor is correct to demand proof of majority before inviting TVK, and that as single-largest party without an outright majority, TVK has no automatic right to form government. The BJP, which nudged this alliance according to NDTV sources, sees the outcome as a check on a populist film-star politician who has not yet demonstrated governing capacity.",
    key_claims:[
      {claim:"As single-largest party without majority, TVK cannot demand government formation as a matter of right.",citations:["NDTV: 'AIADMK-DMK Pact Could Happen In Tamil Nadu'"]},
      {claim:"Governor is constitutionally entitled to satisfy himself about majority before issuing an invitation.",citations:["Hindustan Times"]}
    ],
    framing_devices:["constitutional process","majority requirement","coalition legitimacy"],
    sources_used:["ndtv","hindustan_times"]
  },
  left_narrative:{
    summary:"TVK and its supporters argue that as the single-largest party by a significant margin, the Governor is obligated to invite them first to prove majority on the floor of the house — the constitutionally standard practice. All 107 TVK MLAs have threatened mass resignation if DMK and AIADMK form a government by bypassing the people's mandate. Left and centre coverage notes the unprecedented nature of DMK-AIADMK cooperation as evidence that established parties are colluding to deny democratic outcomes, and that the Governor is acting as a political instrument of the Centre rather than as a constitutional authority.",
    key_claims:[
      {claim:"TVK's 107 MLAs threatened collective resignation if DMK-AIADMK bypass their mandate.",citations:["NDTV: 'All 108 TVK MLAs To Resign'","India Today"]},
      {claim:"Prakash Raj called the Governor's conduct unconstitutional.",citations:["Indian Express (cluster 48)"]}
    ],
    framing_devices:["people's mandate","anti-democratic manoeuvre","Governor as Centre's instrument"],
    sources_used:["the_hindu","india_today"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Vijay (Thalapathy)",role:"Actor-politician; TVK party leader; Tamil Nadu election winner",party_or_affiliation:"Tamilaga Vettri Kazhagam (TVK)",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null},
  {name:"R.V. Arlekar",role:"Tamil Nadu Governor",party_or_affiliation:"Appointed by BJP-led Central government",procedural_status:"TIER_3_ALLEGED",specific_acts:["Declined to invite TVK to form government despite single-largest party status"],status_evidence:[{fact:"Met Vijay but did not issue invitation",citation:"Hindustan Times"}],procedural_barriers:null}
],
precedents_cited_by_right:[],
precedents_cited_by_left:[
  {event:"Standard constitutional convention of inviting single-largest party to prove majority",year:2023,citing_outlets:["the_hindu"]}
],
precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[
  {claim:"TVK won 108 seats in Tamil Nadu; total assembly seats is 234",value:"108",unit:"seats",year:2026,source_authority:"NDTV election results coverage",source_url:null,self_confidence:"high"}
],
common_ground:null,
irreconcilable_disagreements:["Whether the Governor is constitutionally obligated to invite the single-largest party first is disputed between TVK and its opponents.","Whether DMK-AIADMK cooperation is legitimate coalition-building or anti-democratic collusion is framed entirely differently by each side."],
model_uncertainty_notes:"India Today Hindi-language article body was in Hindi transliteration; content interpreted from NDTV and Hindustan Times. Government formation was still unresolved as of reporting date."
}},

// ── 4. Congress Kerala CM Selection ───────────────────────────────────────────
{clusterId:'7a1eb60daee1142a',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"The Congress high command (AICC) will decide Kerala's Chief Minister following a UDF election victory, after AICC observers consulted MLAs.",tier:2,citations:["The Hindu: 'Congress high command to pick Kerala CM'","Hindustan Times: 'Cong leaves it to high command to pick Kerala CM'"]},
  {claim:"Three candidates are in contention: V.D. Satheesan (outgoing Opposition Leader), K.C. Venugopal (Alappuzha MP), and Ramesh Chennithala (senior leader). Most UDF allies favour Satheesan.",tier:2,citations:["The Hindu","Hindustan Times"]}
],
contested_claims:{
  right_narrative:{
    summary:"Right-leaning outlets note that the Congress high command bypassing elected MLAs' preference to impose a CM represents the party's continuing centralisation of power, undermining internal democracy. They point out that AICC's ability to override a state-level preference demonstrates the organisation's top-down culture.",
    key_claims:[{claim:"AICC observers consulted MLAs but final decision rests with high command, not the elected representatives.",citations:["Hindustan Times"]}],
    framing_devices:["high command culture","internal Congress authoritarianism"],
    sources_used:["hindustan_times"]
  },
  left_narrative:{
    summary:"Congress and UDF supporters frame the high command decision as a rational mechanism to avoid internal factionalism tearing apart a fresh government mandate. They argue centrally managed CM selection has historically produced stable Congress-led governments in Kerala and that Satheesan's frontrunner status is widely acknowledged even within this process.",
    key_claims:[{claim:"Most UDF allies support Satheesan, suggesting the high command decision will likely align with ground sentiment.",citations:["The Hindu"]}],
    framing_devices:["party unity","stable governance","earned mandate"],
    sources_used:["the_hindu"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"V.D. Satheesan",role:"Outgoing Kerala Opposition Leader; CM frontrunner",party_or_affiliation:"Indian National Congress",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null},
  {name:"K.C. Venugopal",role:"Alappuzha MP; CM contender",party_or_affiliation:"Indian National Congress",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null},
  {name:"Ramesh Chennithala",role:"Senior Congress leader; CM contender",party_or_affiliation:"Indian National Congress",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null}
],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:[{proposal:"All three contenders are experienced Congress leaders; whichever is chosen, early coalition management and a clear governance agenda would address concerns about mandate legitimacy.",why_right_might_accept:"Stable governance reduces political instability regardless of intra-party process.",why_left_might_accept:"Party cohesion preserved; internal competition resolved.",why_it_might_still_fail:"Losing factions may not fully cooperate, especially if Venugopal's national-level allies are bypassed."}],
irreconcilable_disagreements:[],
model_uncertainty_notes:"Only two sources available; story was developing at time of publication with no final decision announced."
}},

// ── 5. Maharashtra SSC / Tamil Nadu HSC Results ────────────────────────────────
{clusterId:'20ac5a4f5605d36a',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"Tamil Nadu Class 12 HSC results for over 8 lakh students were declared on May 8, 2026 at 9:30 AM; results accessible via tnresults.nic.in, dge.tn.gov.in, SMS, and WhatsApp.",tier:2,citations:["NDTV: 'Tamil Nadu Class 12 Result 2026'","Times of India: 'TN HSC result: When, where and how to check'"]},
  {claim:"Maharashtra SSC Class 10 results were also announced on May 8, 2026; accessible via MSBSHSE portals and DigiLocker.",tier:2,citations:["Indian Express (multiple articles)"]}
],
contested_claims:{
  right_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  left_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[{claim:"Over 8 lakh students appeared for Tamil Nadu Class 12 HSC examination 2026",value:"8,00,000+",unit:"students",year:2026,source_authority:"NDTV citing Tamil Nadu School Education Department",source_url:null,self_confidence:"high"}],
common_ground:null,
irreconcilable_disagreements:["No contested claims in this story."],
model_uncertainty_notes:"All Indian Express body excerpts were empty. Article content is primarily logistical guidance on checking results. No analytical synthesis possible beyond confirmed facts."
}},

// ── 6. West Bengal WBBSE Madhyamik Results ────────────────────────────────────
{clusterId:'c7658b9a66c1f373',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"WBBSE Madhyamik (Class 10) results for West Bengal were announced on May 8, 2026 at 10:15 AM, with a press conference starting at 9:30 AM; results available at wbbse.wb.gov.in.",tier:2,citations:["Hindustan Times: 'WBBSE Madhyamik Result 2026 LIVE'","NDTV: 'West Bengal Madhyamik Result 2026 LIVE'"]},
  {claim:"Tripura Board Class 10 and 12 results were also announced around the same period.",tier:2,citations:["Indian Express (Tripura articles)"]}
],
contested_claims:{
  right_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  left_narrative:{summary:"No political contest in this story.",key_claims:[],framing_devices:[],sources_used:[]},
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["No contested claims in this story."],
model_uncertainty_notes:"Multiple Indian Express articles had empty body excerpts; content is purely logistical. NDTV coverage notes the press conference timing discrepancy (9:30 AM vs 10:15 AM for results). No substantive analysis possible."
}},

// ── 7. West Bengal Governor Dissolves Assembly ────────────────────────────────
{clusterId:'d01591f2fcfc3af4',output:{
story_age_band:"breaking",
established_facts:[
  {claim:"The West Bengal Governor dissolved the 17th West Bengal Legislative Assembly on or around May 7, 2026, after BJP won 207 of 294 seats in the assembly election.",tier:1,citations:["The Hindu: 'West Bengal Governor dissolves State Legislative Assembly'","Hindustan Times: 'West Bengal assembly dissolved'"]}
],
reported_facts:[
  {claim:"BJP won 207 of 294 assembly seats, marking the first time the party will form a government in West Bengal; Trinamool Congress won 80 seats.",tier:2,citations:["Hindustan Times: 'West Bengal CM announcement LIVE'"]},
  {claim:"Mamata Banerjee refused to resign as Chief Minister following the election results; the Governor dissolved the assembly amid her refusal.",tier:2,citations:["Indian Express: 'Governor dissolves West Bengal Assembly amid Mamata refusing to resign as CM'"]},
  {claim:"The swearing-in ceremony for the first BJP government in West Bengal was scheduled at Brigade Parade Grounds.",tier:2,citations:["The Hindu"]}
],
contested_claims:{
  right_narrative:{
    summary:"BJP frames the election result as a historic democratic mandate decisively ending 14 years of TMC rule, and views the Governor's dissolution of the assembly as the constitutionally necessary step after the sitting CM refused to accept the election verdict. Right-leaning outlets portray the BJP's 207-seat win as a repudiation of TMC governance and political violence, and Mamata's refusal to resign as an unconstitutional clinging to power that forced the Governor's hand.",
    key_claims:[{claim:"BJP won 207 of 294 seats — a decisive mandate that required the outgoing CM to resign and facilitate a smooth transition.",citations:["Hindustan Times"]}],
    framing_devices:["historic mandate","democratic verdict","end of TMC misrule"],
    sources_used:["hindustan_times"]
  },
  left_narrative:{
    summary:"TMC and opposition-sympathetic voices contest the legitimacy of the election outcome, alleging manipulation through what SP leader Akhilesh Yadav described as a 'multi-layer mafia operation.' Mamata Banerjee's refusal to resign reflects her party's position that the election was not free and fair. Left coverage frames the Governor's rapid dissolution as a BJP-Centre manoeuvre to fast-track government formation before any legal challenge to results could be mounted.",
    key_claims:[{claim:"Akhilesh Yadav alleged votes were stolen through a multi-layer mafia operation; he said Mamata 'won when elections were impartial'.",citations:["Hindustan Times (Akhilesh-Mamata meeting cluster)"]}],
    framing_devices:["stolen election","Centre's instrument","democratic subversion"],
    sources_used:["indian_express","the_hindu"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Mamata Banerjee",role:"Outgoing Chief Minister of West Bengal; TMC supremo",party_or_affiliation:"Trinamool Congress",procedural_status:"TIER_3_ALLEGED",specific_acts:["Refused to resign as CM after election defeat"],status_evidence:[{fact:"Governor dissolved assembly amid her refusal to resign",citation:"Indian Express"}],procedural_barriers:null}
],
precedents_cited_by_right:[{event:"Historic pattern of TMC political violence against opposition workers in West Bengal",year:2021,citing_outlets:["hindustan_times"]}],
precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[{claim:"BJP won 207 of 294 West Bengal assembly seats",value:"207",unit:"seats out of 294",year:2026,source_authority:"Hindustan Times election results",source_url:null,self_confidence:"high"}],
common_ground:null,
irreconcilable_disagreements:["Whether the election results reflect a genuine popular mandate or were manipulated is disputed between BJP and TMC, with no independent verification referenced in available articles.","Whether Mamata's refusal to resign was constitutionally defensible or obstructionist is viewed entirely differently by the two sides."],
model_uncertainty_notes:"Only three articles; Indian Express body was empty. The election result figures (207/294, 80 TMC seats) come from one Hindustan Times live-blog excerpt and should be verified against official Election Commission data."
}},

// ── 8. Rat Poison Mumbai Deaths (forensic confirmation) ───────────────────────
{clusterId:'7d8b01c3decd0811',output:{
story_age_band:"breaking",
established_facts:[
  {claim:"A forensic report confirmed that zinc phosphide — a rodenticide (rat poison) — was found in the viscera of all four deceased family members and in the watermelon samples consumed before their deaths.",tier:1,citations:["The Hindu: 'Mumbai family deaths: Rat poison ingredient zinc phosphide found in viscera and watermelon sample'","Organiser: 'Rat poison in watermelon killed family of four in Mumbai, forensic report confirms'"]}
],
reported_facts:[
  {claim:"The four victims were Abdullah Dokadia (45), his wife Nasreen (35), and their daughters Zainab (13) and Ayesha (16), who died after a family dinner on the night of April 25, 2026 at their Bhendi Bazaar residence.",tier:2,citations:["Organiser","The Hindu"]},
  {claim:"Guests at the same dinner who ate mutton pulao were unaffected; the family consumed watermelon after guests left, pointing to the watermelon as the contaminated item.",tier:2,citations:["Organiser"]},
  {claim:"JJ Marg police station is conducting the probe; statements of kin and neighbours have been recorded.",tier:2,citations:["The Hindu"]}
],
contested_claims:{
  right_narrative:{
    summary:"Right-leaning outlet Organiser published detailed forensic findings and emphasised the family's Muslim identity (Bhendi Bazaar, names), framing the investigation around the nature of the poisoning without explicit attribution of motive. By publishing the family's religion prominently alongside forensic findings, Organiser's framing — without any evidence of targeted communal violence — risks implying a communal dimension that has no evidentiary basis in the available reporting.",
    key_claims:[{claim:"Forensic analysis confirmed zinc phosphide in both viscera and watermelon",citations:["Organiser"]}],
    framing_devices:["forensic confirmation","Muslim family identity","Bhendi Bazaar location"],
    sources_used:["organiser"]
  },
  left_narrative:{
    summary:"Mainstream outlets (The Hindu, Mint, Indian Express) focus on the forensic facts and the ongoing investigation without characterising the family by religion or implying communal motive. They report the case as a food-safety and criminal investigation matter, noting that the exact circumstances remain unclear and that the case may involve poisoned produce reaching the market rather than a targeted killing.",
    key_claims:[{claim:"The exact circumstances remain unclear and police investigation is ongoing.",citations:["Mint"]}],
    framing_devices:["food safety","criminal investigation","no motive established"],
    sources_used:["the_hindu","mint","indian_express"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Abdullah Dokadia",role:"Victim; head of household",party_or_affiliation:"N/A",procedural_status:"TIER_3_ALLEGED",specific_acts:["Victim of poisoning"],status_evidence:[{fact:"Zinc phosphide confirmed in viscera by forensic report",citation:"The Hindu, Organiser"}],procedural_barriers:null}
],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:[{proposal:"Immediate food safety audit of watermelon supply chain in Mumbai markets to determine whether other contaminated produce is in circulation.",why_right_might_accept:"Addresses a concrete public health threat regardless of motive questions.",why_left_might_accept:"Prevents further deaths while investigation continues without prejudging communal motive.",why_it_might_still_fail:"If the poisoning was deliberate and targeted, supply chain audit would not address the criminal question."}],
irreconcilable_disagreements:[],
model_uncertainty_notes:"Whether the zinc phosphide entered the watermelon through accidental contamination, commercial fraud, or deliberate targeting is unknown. No motive has been established. The Organiser's editorial framing which emphasises Muslim identity without evidence of communal motive is noted as a framing device, not a factual claim."
}},

// ── 9. US–Iran Fire Exchange in Hormuz ────────────────────────────────────────
{clusterId:'349f185759f4b478',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"U.S. and Iranian forces exchanged fire in the Strait of Hormuz on or around May 7–8, 2026, in what outlets describe as the sharpest escalation since an April 7 ceasefire.",tier:2,citations:["India Today: 'US, Iran exchange fire in Hormuz'","The Hindu: 'U.S. and Iran trade fire, threatening fragile truce'"]},
  {claim:"Iran's military accused the U.S. of violating the ceasefire by attacking an Iranian oil tanker and another ship, saying Iranian forces 'immediately and in retaliation attacked American military vessels'.",tier:2,citations:["The Hindu (May 8)"]},
  {claim:"Donald Trump dismissed the attacks and stated the United States is still negotiating with Iran.",tier:2,citations:["The Hindu: 'Iran-Israel war LIVE'"]}
],
contested_claims:{
  right_narrative:{
    summary:"Trump administration and its backers portray the exchange of fire as a measured U.S. response to Iranian aggression against American naval vessels, while simultaneously minimising it as a 'trifle' that does not invalidate the ceasefire. The right frames this as Iran — characterised by Trump as 'lunatics' — testing American resolve, with the U.S. demonstrating that attacks will be answered while still keeping negotiations alive. The overarching frame is one of American strength deterring further escalation.",
    key_claims:[{claim:"Trump dismissed the attacks as minor and said negotiations continue.",citations:["The Hindu LIVE"]}],
    framing_devices:["Iran as aggressor","American strength","negotiation from power"],
    sources_used:["india_today"]
  },
  left_narrative:{
    summary:"The Hindu and centre-left coverage foreground Iran's claim that the U.S. initiated the ceasefire violation by attacking Iranian vessels first, making the Iranian retaliation a response to American action rather than unprovoked aggression. This framing raises questions about whether the U.S. was itself acting in bad faith by conducting strikes while nominally in a ceasefire. The fragility of the ceasefire is presented as a structural problem arising from the absence of a formal, binding agreement.",
    key_claims:[{claim:"Iran accused the U.S. of violating the ceasefire by attacking an oil tanker before the Iranian retaliation.",citations:["The Hindu (May 8)"]}],
    framing_devices:["ceasefire fragility","competing violation claims","absence of binding agreement"],
    sources_used:["the_hindu"]
  },
  other_narrative:null
},
named_individuals:[{name:"Donald Trump",role:"President of the United States",party_or_affiliation:"Republican Party",procedural_status:"TIER_3_ALLEGED",specific_acts:["Dismissed the Hormuz incident and claimed negotiations ongoing"],status_evidence:[{fact:"Trump quoted in The Hindu LIVE coverage",citation:"The Hindu (May 8)"}],procedural_barriers:null}],
precedents_cited_by_right:[{event:"April 7, 2026 U.S.-Iran ceasefire",year:2026,citing_outlets:["india_today"]}],
precedents_cited_by_left:[{event:"April 7, 2026 U.S.-Iran ceasefire",year:2026,citing_outlets:["the_hindu"]}],
precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["Who fired first — whether the U.S. attacked Iranian vessels in violation of the ceasefire or Iran attacked U.S. destroyers first — is directly disputed between Tehran and Washington with no independent verification."],
model_uncertainty_notes:"Three articles with limited body text. The sequence of events (who fired first) is unresolved and both sides' accounts are self-serving. The April 7 ceasefire context is referenced but not elaborated on in available excerpts."
}},

// ── 10. US Navy Intercepts Iranian Attacks ────────────────────────────────────
{clusterId:'4f31a5c9fa3ed9c6',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"U.S. Central Command (CENTCOM) said Iran used missiles, drones and small boats to attack three U.S. Navy destroyers in the Strait of Hormuz; the U.S. says it intercepted the attacks and then targeted Iranian missile and drone sites in retaliation.",tier:2,citations:["Mint: 'US Iran War LIVE'","India Today: 'US says it foiled Iranian attacks on 3 Navy ships'"]},
  {claim:"Explosions were reported at the Bahman pier on Qeshm Island in the Strait of Hormuz; Iranian state TV attributed these to 'an exchange of fire between Iranian armed forces and the enemy'.",tier:2,citations:["The Hindu: 'Iran state TV reports explosions on island in Hormuz strait'"]}
],
contested_claims:{
  right_narrative:{
    summary:"The U.S. account, amplified by Indian pro-American outlets, presents CENTCOM's version as definitive: Iran attacked American warships unprovoked and the U.S. successfully intercepted all incoming weapons before conducting precision counter-strikes on Iranian military sites. The use of 'foiled' in headlines frames the U.S. as entirely defensive. This account treats the ceasefire as having been violated by Iran, not by the United States.",
    key_claims:[{claim:"CENTCOM stated Iran used missiles, drones and small boats against three Navy destroyers.",citations:["Mint"]},{claim:"The U.S. targeted missile and drone sites in response.",citations:["Mint"]}],
    framing_devices:["CENTCOM as authoritative source","U.S. purely defensive","Iran as aggressor"],
    sources_used:["india_today","mint"]
  },
  left_narrative:{
    summary:"The existence of explosions at Qeshm Island reported by Iranian state media introduces a counter-narrative: Iranian forces suffered genuine military damage, suggesting U.S. strikes were more than defensive. The simultaneous U.S. claim of a continuing ceasefire while conducting strikes in Iranian territory is presented as contradictory by The Hindu's coverage, which foregrounds Iran's own account of the exchange.",
    key_claims:[{claim:"Explosions at Qeshm Island's Bahman pier during the exchange suggest Iranian military infrastructure was struck.",citations:["The Hindu"]}],
    framing_devices:["competing national accounts","ceasefire contradiction","Iranian damage"],
    sources_used:["the_hindu"]
  },
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["The sequencing and characterisation of the Hormuz exchange — whether U.S. or Iranian forces initiated hostilities — is disputed between CENTCOM's account and Iran's state media account with no independent verification available."],
model_uncertainty_notes:"Directly overlaps with cluster 349f185759f4b478 (US-Iran fire exchange). The two clusters cover the same incident from slightly different angles; this cluster focuses on the CENTCOM/interception framing. Available excerpts are limited."
}},

// ── 11. Akhilesh Yadav Meets Mamata (short) ───────────────────────────────────
{clusterId:'efb49eb0b7eb106b',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"SP leader Akhilesh Yadav visited Mamata Banerjee in Kolkata following the West Bengal election results and stated that Trinamool Congress 'fought well'.",tier:2,citations:["The Hindu: 'Akhilesh Yadav calls on Mamata Banerjee'"]},
  {claim:"Akhilesh alleged that votes in West Bengal were stolen by the BJP, the Election Commission, and other agencies.",tier:2,citations:["The Hindu"]}
],
contested_claims:{
  right_narrative:{
    summary:"BJP frames Akhilesh Yadav's visit as a desperate Opposition solidarity exercise by a politician whose own party is not in a position to contest West Bengal effectively, and dismisses the election-theft allegation as sour grapes without evidence from a party that lost badly.",
    key_claims:[{claim:"BJP won 207 seats; TMC's loss was a clear democratic verdict.",citations:["Hindustan Times (WB Assembly cluster)"]}],
    framing_devices:["Opposition desperation","sour grapes","unfounded allegation"],
    sources_used:["hindustan_times"]
  },
  left_narrative:{
    summary:"Akhilesh Yadav's statement that 'if the right to vote is taken away, what remains of democracy' reflects the INDIA bloc's broader narrative that BJP used state machinery — EC, central agencies — to engineer election outcomes. This framing connects the West Bengal result to a wider pattern the opposition alleges across multiple state elections.",
    key_claims:[{claim:"Akhilesh stated votes were stolen by BJP, EC, and other agencies.",citations:["The Hindu"]}],
    framing_devices:["democratic subversion","EC bias","Opposition solidarity"],
    sources_used:["the_hindu"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"Akhilesh Yadav",role:"Samajwadi Party President",party_or_affiliation:"Samajwadi Party (INDIA bloc)",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null},
  {name:"Mamata Banerjee",role:"TMC supremo; outgoing West Bengal CM",party_or_affiliation:"Trinamool Congress",procedural_status:"TIER_3_ALLEGED",specific_acts:[],status_evidence:[],procedural_barriers:null}
],
precedents_cited_by_right:[],precedents_cited_by_left:[{event:"Pattern of alleged BJP-EC coordination in state elections",year:2024,citing_outlets:["the_hindu"]}],
precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether the West Bengal election was manipulated is directly disputed between BJP (democratic mandate) and TMC/opposition (stolen election); no independent election audit is referenced."],
model_uncertainty_notes:"India Today article had near-empty body ('Mamata Donald Banerjee'). Analysis relies entirely on The Hindu. Limited sourcing."
}},

// ── 12. Nvidia CEO Jensen Huang / China Visit ─────────────────────────────────
{clusterId:'02126a8186672c55',output:{
story_age_band:"developing",
established_facts:[],
reported_facts:[
  {claim:"The Trump administration invited Nvidia CEO Jensen Huang along with Boeing, Apple and other U.S. company CEOs to join Trump's upcoming China visit.",tier:2,citations:["Mint: 'Trump administration invites NVIDIA, Boeing CEOs to China'"]},
  {claim:"Jensen Huang stated that China should not have access to the 'latest and greatest' AI technology while also arguing the U.S. should not entirely abandon the Chinese market.",tier:2,citations:["Times of India: 'China should not have... Nvidia CEO Jensen Huang'"]}
],
contested_claims:{
  right_narrative:{
    summary:"The Trump administration and American tech-hawkish voices frame China's exclusion from cutting-edge AI chips as a national security imperative: advanced semiconductors give military advantage and enabling a strategic competitor to access them is a risk to American and global security. Huang's own framing of 'America as priority' while attending a China visit reflects the administration's position that engagement can continue on American terms without ceding technological supremacy.",
    key_claims:[{claim:"Huang said China should not have access to the 'latest and greatest' AI technology.",citations:["Times of India"]}],
    framing_devices:["national security","technological supremacy","engagement on U.S. terms"],
    sources_used:["times_of_india"]
  },
  left_narrative:{
    summary:"The paradox of the world's leading AI chip CEO simultaneously saying China should not have cutting-edge tech while attending a White House-facilitated trade mission to China is noted. Tech and market observers see this as revealing the tension between the U.S. government's desire to engage China commercially while restricting technology transfer — a contradiction that Nvidia navigates by selling lower-end chips to China while preserving premium products for American and allied markets.",
    key_claims:[{claim:"Huang said joining the trade mission would be a 'great honor', indicating continued engagement despite stated technology restrictions.",citations:["Mint"]}],
    framing_devices:["technology contradiction","commercial vs. security interests","trade engagement"],
    sources_used:["mint"]
  },
  other_narrative:null
},
named_individuals:[{name:"Jensen Huang",role:"CEO of Nvidia",party_or_affiliation:"N/A (corporate)",procedural_status:"TIER_3_ALLEGED",specific_acts:["Invited to join Trump's China visit"],status_evidence:[{fact:"Mint report confirmed Trump administration invitation",citation:"Mint"}],procedural_barriers:null}],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:[{proposal:"U.S. can permit commercial engagement with China in lower-tier technology while maintaining export controls on frontier AI chips — a tiered engagement policy already partially in practice.",why_right_might_accept:"Maintains national security controls on strategically sensitive technology.",why_left_might_accept:"Avoids full decoupling that would harm U.S. companies and global supply chains.",why_it_might_still_fail:"China's reverse-engineering capability means even lower-tier chips can accelerate frontier research over time."}],
irreconcilable_disagreements:[],
model_uncertainty_notes:"The Times of India article mentions Nvidia share 'falls to zero in Beijing' in its headline but the body discusses Huang's comments on access; this headline is inconsistent with the article content and may be a translation/editorial error. Share price data is not verified."
}},

// ── 13. Trump Warns Iran (Hormuz) ─────────────────────────────────────────────
{clusterId:'0bf67262a4183498',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"Trump claimed that three U.S. destroyers passed through the Strait of Hormuz under Iranian fire and sustained no damage, and that Iranian attackers suffered significant damage.",tier:2,citations:["Times of India: 'We'll knock them out harder'","Mint: 'Trump brands Iran's leaders lunatics'"]},
  {claim:"Trump threatened increased military action against Iran if a deal is not signed, saying 'We'll knock them out a lot harder'.",tier:2,citations:["Times of India","India Today","Indian Express"]}
],
contested_claims:{
  right_narrative:{
    summary:"Trump and his supporters frame his warning as credible deterrence — a leader demonstrating that attacks on American military assets will be met with disproportionate force, designed to force Iran to the negotiating table. The 'no damage' claim is used to show American military superiority while the escalatory threat is presented as negotiating leverage, not warmongering. Right-leaning outlets present Iran's leadership as irrational ('lunatics') whose behaviour requires overwhelming force to constrain.",
    key_claims:[{claim:"Trump stated three destroyers came under fire but sustained no damage.",citations:["Times of India","Mint"]},{claim:"Trump threatened 'knocking them out harder' if no peace deal is reached.",citations:["India Today","Indian Express"]}],
    framing_devices:["American military superiority","deterrence","Iran as irrational actor"],
    sources_used:["times_of_india","mint","india_today"]
  },
  left_narrative:{
    summary:"Critics frame Trump's threat as reckless escalatory rhetoric from a president simultaneously claiming a ceasefire is in effect while threatening renewed military strikes. The labelling of Iranian leaders as 'lunatics' is seen as dehumanising language that forecloses diplomatic space. Left-leaning observers note that threatening 'more violent' action while negotiating creates contradictory signals that undermine the U.S. negotiating position and risk miscalculation.",
    key_claims:[{claim:"Trump branded Iran's leaders 'lunatics' while simultaneously claiming negotiations are ongoing.",citations:["Mint"]}],
    framing_devices:["contradictory signals","dehumanising rhetoric","escalation risk"],
    sources_used:["indian_express"]
  },
  other_narrative:null
},
named_individuals:[{name:"Donald Trump",role:"President of the United States",party_or_affiliation:"Republican Party",procedural_status:"TIER_3_ALLEGED",specific_acts:["Threatened increased military action against Iran","Called Iranian leaders 'lunatics'"],status_evidence:[{fact:"Multiple Indian outlets quoted Trump's direct statement",citation:"Times of India, Mint, India Today, Indian Express"}],procedural_barriers:null}],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[{type:"THREAT",leader_name:"Donald Trump",party:"Republican Party",quoted_statement:"We'll knock them out a lot harder",context:"Statement made while claiming a ceasefire is still in effect, directed at Iranian government in context of Hormuz military exchange.",contradicting_fact_or_question:"Trump simultaneously claimed negotiations are ongoing and the ceasefire holds — threatening violent military escalation while claiming to negotiate is a contradictory posture.",citation:"Times of India, India Today, Indian Express (May 8, 2026)"}],
statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether Trump's threat constitutes legitimate deterrence or reckless escalation that endangers a fragile ceasefire is framed entirely differently by pro-administration and critical outlets."],
model_uncertainty_notes:"Indian Express body excerpt was empty. The 'no damage' claim from Trump is unverified independently. The sequence of who attacked first in this Hormuz incident is covered in more detail in clusters 349f and 4f31."
}},

// ── 14. India Lists Pakistan Losses — Op Sindoor Anniversary ──────────────────
{clusterId:'918e8eac79fdce97',output:{
story_age_band:"developing",
established_facts:[],
reported_facts:[
  {claim:"On the first anniversary of Operation Sindoor, Air Marshal AK Bharti stated that India destroyed 9 terror camps, 11 airfields, and 13 aircraft belonging to Pakistan and claimed no Indian military or civilian infrastructure was damaged.",tier:2,citations:["Hindustan Times: '9 terror camps, 11 airfields, 13 aircraft: India lists Pakistan losses'"]},
  {claim:"PM Modi changed his X profile picture and praised the armed forces' 'unparalleled courage' on the anniversary.",tier:2,citations:["Hindustan Times: 'PM Modi changes display pic'"]},
  {claim:"The Army issued a statement: 'Operation Sindoor stands as a defining testimony to India's resolve against terror and to the decisive strategic vision of the country's national leadership'.",tier:2,citations:["Hindustan Times: 'No terror sanctuary safe: Army warns Pakistan'"]}
],
contested_claims:{
  right_narrative:{
    summary:"The BJP government and Indian military present Operation Sindoor's anniversary as a moment to affirm India's strategic deterrence capability and the success of a 88-hour precision military operation. Right-leaning coverage frames the operation as proof that India's policy of 'zero tolerance for cross-border terror' is backed by credible military force, and the casualty and asset figures (9 camps, 11 airfields, 13 aircraft) are presented as verified achievements. The anniversary messaging is designed to reinforce PM Modi's image as a decisive national security leader.",
    key_claims:[{claim:"India destroyed 9 terror camps, 11 airfields, and 13 Pakistani aircraft with no damage to Indian infrastructure.",citations:["Hindustan Times"]},{claim:"The operation 'just took 88 hours'.",citations:["Hindustan Times: 'Just took 88 hours'"]}],
    framing_devices:["decisive leadership","zero tolerance for terror","military precision","national security achievement"],
    sources_used:["hindustan_times","times_of_india"]
  },
  left_narrative:{
    summary:"Indian Express's anniversary coverage raises questions about whether Operation Sindoor achieved a durable strategic outcome or merely a tactical one, arguing that 'Sindoor 2.0 must go beyond deterrence' and that India's Pakistan policy needs an 'endgame'. Centre-left coverage acknowledges diplomatic wins but notes 'hard lessons', suggesting the operation did not resolve the underlying structural problem of cross-border terror infrastructure and that India has not yet defined what sustainable success looks like.",
    key_claims:[{claim:"One year on, India has 'some diplomatic wins, some hard lessons' from Operation Sindoor.",citations:["Indian Express: 'One year after Operation Sindoor: For India, some diplomatic wins, some hard lessons'"]},{claim:"India's Pakistan policy needs an endgame beyond deterrence.",citations:["Indian Express: 'Best of Both Sides'"]}],
    framing_devices:["strategic ambiguity","need for endgame","deterrence insufficient alone"],
    sources_used:["indian_express"]
  },
  other_narrative:null
},
named_individuals:[
  {name:"AK Bharti",role:"Air Marshal, Indian Air Force",party_or_affiliation:"Indian Armed Forces",procedural_status:"TIER_3_ALLEGED",specific_acts:["Announced casualty and asset figures from Operation Sindoor"],status_evidence:[{fact:"Cited in Hindustan Times press conference reporting",citation:"Hindustan Times (May 7)"}],procedural_barriers:null},
  {name:"Narendra Modi",role:"Prime Minister of India",party_or_affiliation:"BJP",procedural_status:"TIER_3_ALLEGED",specific_acts:["Changed social media display picture; issued statement praising armed forces"],status_evidence:[{fact:"Hindustan Times and Times of India confirmed PM's social media and statement",citation:"Hindustan Times (May 7), Times of India (May 8)"}],procedural_barriers:null}
],
precedents_cited_by_right:[{event:"Pahalgam massacre that preceded Operation Sindoor",year:2025,citing_outlets:["hindustan_times"]}],
precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],
statistics:[
  {claim:"India claims to have destroyed 9 terror camps, 11 airfields, and 13 Pakistani aircraft in Operation Sindoor",value:"9 camps, 11 airfields, 13 aircraft",unit:"military assets",year:2026,source_authority:"Indian Air Force (Air Marshal AK Bharti)",source_url:null,self_confidence:"medium"}
],
common_ground:null,
irreconcilable_disagreements:["India's claimed casualty and asset figures for Operation Sindoor are unverified by independent sources and have not been confirmed or refuted by Pakistan in available reporting.","Whether the operation achieved strategic deterrence or requires a broader endgame approach is debated within Indian strategic commentary."],
model_uncertainty_notes:"All figures (9 camps, 11 airfields, 13 aircraft) originate from a single government press conference. No independent or Pakistani-side verification is available in these articles. This cluster covers the anniversary messaging; the original operation's events are covered in prior synthesized clusters."
}},

// ── 15. Nida Khan Arrested (short version) ────────────────────────────────────
{clusterId:'984fec38537da927',output:{
story_age_band:"breaking",
established_facts:[
  {claim:"Nida Khan was arrested by police from Chhatrapati Sambhajinagar on May 8, 2026 in connection with the TCS Nashik sexual harassment and religious coercion case; her anticipatory bail had been rejected.",tier:1,citations:["Mint: 'Nida Khan, accused in TCS Nashik harassment case, arrested'","Indian Express: 'Nida Khan, key accused in TCS conversion case, arrested'"]}
],
reported_facts:[
  {claim:"The SIT is investigating allegations including sexual harassment, coercion, and religious pressure on TCS employees in Nashik.",tier:2,citations:["Mint"]},
  {claim:"Khan's anticipatory bail was rejected due to her ongoing legal issues; she was produced before a magistrate after arrest.",tier:2,citations:["Mint"]}
],
contested_claims:{
  right_narrative:{summary:"Right-leaning coverage (see also cluster 1cb7b96d) frames the case as 'Corporate Jihad', alleging a deliberate campaign by Khan to coerce Hindu employees into religious conversion. The framing extends the individual criminal case into a broader civilisational narrative.",key_claims:[{claim:"Khan is accused of coercion and religious pressure on TCS employees.",citations:["Mint"]}],framing_devices:["Corporate Jihad framing","religious coercion","Hindu employees targeted"],sources_used:["organiser"]},
  left_narrative:{summary:"Centre and mainstream coverage focuses on the legal process: FIR registered, anticipatory bail rejected, SIT investigation active. These outlets use the phrase 'sexual exploitation and religious coercion' but do not use the 'Corporate Jihad' framing, treating the matter as a criminal case involving specific acts by an accused individual rather than a communal phenomenon.",key_claims:[{claim:"FIR was registered over 40 days before arrest; the delay was due to Khan evading police.",citations:["Indian Express"]}],framing_devices:["criminal proceeding","legal process","individual accused"],sources_used:["the_hindu","indian_express","mint"]},
  other_narrative:null
},
named_individuals:[
  {name:"Nida Khan",role:"Accused in TCS Nashik sexual harassment and religious coercion case",party_or_affiliation:"N/A",procedural_status:"TIER_2_CHARGED",specific_acts:["Sexual exploitation of employees","Religious coercion/conversion pressure on TCS employees"],status_evidence:[{fact:"FIR registered, anticipatory bail rejected, SIT investigation active, arrested",citation:"Mint, Indian Express"}],procedural_barriers:null}
],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["Whether this case represents an individual criminal matter or a broader pattern of religious coercion ('Corporate Jihad') in corporate environments is framed entirely differently by right and mainstream outlets."],
model_uncertainty_notes:"Only two articles in this cluster; the fuller account is in cluster 1cb7b96dd05413d6. The 'Corporate Jihad' framing in the Organiser (covered in the other cluster) is not present in these two articles."
}},

// ── 16. Hantavirus Cruise Ship ────────────────────────────────────────────────
{clusterId:'d4582aa866daa133',output:{
story_age_band:"breaking",
established_facts:[],
reported_facts:[
  {claim:"A deadly hantavirus outbreak occurred on a cruise ship; two Indian crew members were aboard and their status was reported as unknown.",tier:2,citations:["India Today: '2 Indian crew aboard ship with deadly hantavirus outbreak'"]},
  {claim:"Trump expressed hope the outbreak was 'under control' and indicated the administration would issue a report.",tier:2,citations:["Mint: 'Trump Is Hopeful Hantavirus Outbreak on Cruise Ship Under Control'"]}
],
contested_claims:{
  right_narrative:{summary:"Trump administration's framing is reassuring: the situation is 'under control', signalling competent federal response.",key_claims:[{claim:"Trump said he was hopeful the outbreak was under control.",citations:["Mint"]}],framing_devices:["government competence","situation managed"],sources_used:["mint"]},
  left_narrative:{summary:"India Today's framing foregrounds the unknown fate of the two Indian crew members, raising questions about the response speed and whether Indian nationals were adequately informed or assisted.",key_claims:[{claim:"Status of two Indian crew members is unknown.",citations:["India Today"]}],framing_devices:["Indian nationals at risk","opacity of information"],sources_used:["india_today"]},
  other_narrative:null
},
named_individuals:[],
precedents_cited_by_right:[],precedents_cited_by_left:[],precedents_cited_by_other:[],
rhetoric_flags:[],statistics:[],
common_ground:null,
irreconcilable_disagreements:["The status of the two Indian crew members and the true scale of the outbreak are unknown from available reporting."],
model_uncertainty_notes:"Severely limited source material — only two articles with minimal body text. Hantavirus outbreaks are rare on cruise ships; the novelty of this event means limited contextual background is available. Indian MEA response (if any) is not covered in these articles."
}},

];

let done=0,failed=0;
for(const {clusterId,output} of BATCH){
  try{
    const synthId=createHash('sha256').update(clusterId).digest('hex').slice(0,16);
    await sql(`INSERT INTO syntheses(id,cluster_id,output,created_at)VALUES($1,$2,$3,NOW())ON CONFLICT(cluster_id)DO UPDATE SET output=$3,created_at=NOW()`,[synthId,clusterId,JSON.stringify(output)]);
    await sql(`UPDATE clusters SET status='synthesized',updated_at=NOW()WHERE id=$1`,[clusterId]);
    console.log('✓',clusterId,output.story_age_band);
    done++;
  }catch(e){console.error('✗',clusterId,e.message);failed++;}
}
console.log(`\nBatch done: ${done} inserted, ${failed} failed`);
