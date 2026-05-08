export type SourceLean = 'right_heavy' | 'right_lean' | 'centre' | 'left_lean' | 'left_heavy' | 'wire';
export type Factuality = 'high' | 'mostly' | 'mixed' | 'low';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'ml' | 'kn' | 'gu' | 'pa';

export type Source = {
  id: string;
  name: string;
  homepage: string;
  rss: string[];
  lean: SourceLean;
  language: Language;
  factuality: Factuality;
  notes: string;
};

export const SOURCES: Source[] = [
  // RIGHT HEAVY
  {
    id: 'opindia',
    name: 'OpIndia',
    homepage: 'https://www.opindia.com',
    rss: ['https://www.opindia.com/feed/'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'low',
    notes:
      'Rejected by IFCN (International Fact-Checking Network) for failing to meet basic standards of transparency and non-partisanship. Blacklisted as a reliable source by English Wikipedia. Known for amplifying anti-Muslim narratives and defending Hindu nationalist positions. Frequently cited by BJP-aligned social media. Stories require independent corroboration before treating as factual.',
  },
  {
    id: 'swarajya',
    name: 'Swarajya',
    homepage: 'https://swarajyamag.com',
    rss: ['https://swarajyamag.com/feed'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'mixed',
    notes:
      'Explicitly ideologically aligned with Hindu nationalist and economic right positions. Launched with stated mission to counter left-liberal media. Opinion and analysis quality varies significantly by writer. News reporting is selectively curated to fit editorial line. Strong on economic policy commentary from market-right perspective.',
  },
  {
    id: 'organiser',
    name: 'Organiser',
    homepage: 'https://organiser.org',
    rss: ['https://organiser.org/feed/'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'mixed',
    notes:
      'Official publication of the RSS (Rashtriya Swayamsevak Sangh). Editorial positions directly reflect RSS ideology. Not an independent journalistic outlet. Valuable for understanding RSS/Sangh Parivar framing of events, not for independent news verification.',
  },
  {
    id: 'tfipost',
    name: 'TFI Post',
    homepage: 'https://tfipost.com',
    rss: ['https://tfipost.com/feed/'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'low',
    notes:
      'Openly pro-BJP opinion site that presents commentary as news. Frequent target of fact-checkers for misleading headlines and selective context. Founded as a counter to left-liberal media. High volume, low verification standards. Treat all factual claims as requiring independent confirmation.',
  },
  {
    id: 'republic_world',
    name: 'Republic World',
    homepage: 'https://www.republicworld.com',
    rss: ['https://www.republicworld.com/rss/india-news.xml'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'mixed',
    notes:
      'Founded by Arnab Goswami after leaving Times Now. Known for high-decibel pro-government coverage and aggressive anti-opposition framing. Has faced multiple complaints to NBSA and BARC. The channel\'s rating manipulation controversy (2020 BARC probe) is public record. Breaking news is often accurate on bare facts but contextualised tendentiously.',
  },
  {
    id: 'zee_news',
    name: 'Zee News',
    homepage: 'https://zeenews.india.com',
    rss: ['https://zeenews.india.com/rss/india.xml'],
    lean: 'right_heavy',
    language: 'hi',
    factuality: 'mixed',
    notes:
      'Part of Zee Media group, which shifted editorially toward BJP alignment particularly after 2014. Hindi-language reach is enormous, covering tier-2 and tier-3 India. Coverage of Muslim communities and opposition parties is frequently adversarial. Breaking wire news is usually accurate; framing and headline writing is partisan.',
  },
  {
    id: 'india_tv',
    name: 'India TV',
    homepage: 'https://www.indiatvnews.com',
    rss: ['https://www.indiatvnews.com/rssfeed/news.xml'],
    lean: 'right_heavy',
    language: 'hi',
    factuality: 'mixed',
    notes:
      'Rajat Sharma-owned, with close personal ties to BJP leadership documented in public record. Large Hindi-speaking audience. Extensive fact-checking gap on claims that favor the ruling party. Strong on astrology, soft entertainment, and populist crime coverage alongside political news.',
  },
  {
    id: 'hindu_post',
    name: 'Hindu Post',
    homepage: 'https://hindupost.in',
    rss: ['https://hindupost.in/feed/'],
    lean: 'right_heavy',
    language: 'en',
    factuality: 'low',
    notes:
      'Explicitly Hindu nationalist editorial stance. Focuses almost exclusively on stories framed as threats to Hindus or Hindu interests. Minimal journalistic infrastructure. Frequently republishes and amplifies viral WhatsApp-origin claims. Require full independent verification for all factual claims.',
  },
  {
    id: 'daily_pioneer',
    name: 'Daily Pioneer',
    homepage: 'https://www.dailypioneer.com',
    rss: ['https://www.dailypioneer.com/rss/top-stories.xml'],
    lean: 'right_lean',
    language: 'en',
    factuality: 'mostly',
    notes:
      'One of India\'s oldest English newspapers, with long BJP alignment history. Editorial line is consistently right-of-centre and nationalist. News desk maintains higher standards than opinion pages. Used by RSS/BJP leadership for preferred placement of specific stories.',
  },

  // LEFT HEAVY
  {
    id: 'the_wire',
    name: 'The Wire',
    homepage: 'https://thewire.in',
    rss: ['https://thewire.in/rss'],
    lean: 'left_heavy',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Editorially left-liberal, strongly critical of BJP government. Produced serious investigative journalism on Pegasus surveillance, electoral bonds, and judicial independence. In 2017 published and then retracted a story claiming BJP president Amit Shah\'s son Jay Shah had benefited from policy changes; the retraction is public record and represents a significant journalistic failure. Generally high standards on other investigations. Treat as credible with normal fact-check discipline.',
  },
  {
    id: 'scroll',
    name: 'Scroll.in',
    homepage: 'https://scroll.in',
    rss: ['https://scroll.in/feed'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Digital-native outlet with liberal-secular editorial orientation. Strong on civil liberties, minority rights, and environment coverage. Broadly anti-BJP in framing without the same ideological rigidity as The Wire. Good factual accuracy with selective story emphasis that reflects editorial values.',
  },
  {
    id: 'the_quint',
    name: 'The Quint',
    homepage: 'https://www.thequint.com',
    rss: ['https://www.thequint.com/rss'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'mostly',
    notes:
      'WebQoof fact-checking desk is one of the better Indian fact-checking operations. Editorial line is broadly liberal. Owned by Raghav Bahl (Quintillion Media). Video-first format. Covers gender, youth, and identity politics with more depth than legacy outlets. Reliable on breaking news with reasonable accuracy.',
  },
  {
    id: 'newslaundry',
    name: 'Newslaundry',
    homepage: 'https://www.newslaundry.com',
    rss: ['https://www.newslaundry.com/feed'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'high',
    notes:
      'Subscription-funded, editorially independent from advertisers. Strongest media criticism operation in Indian journalism. Left-liberal on editorial values but willing to criticise outlets across the spectrum. Has broken stories on media ownership conflicts that other outlets would not touch. Paywall limits reach.',
  },
  {
    id: 'the_caravan',
    name: 'The Caravan',
    homepage: 'https://caravanmagazine.in',
    rss: ['https://caravanmagazine.in/feed'],
    lean: 'left_heavy',
    language: 'en',
    factuality: 'high',
    notes:
      'Long-form magazine with the deepest investigative reporting in Indian English journalism. Has faced SLAPP suits from BJP-affiliated individuals for its reporting, including threats against its journalists. Left-liberal framing is consistent and explicit but factual standards are high and sourcing is documented. The Pegasus investigation, adivasi rights reporting, and judiciary accountability reporting are industry benchmarks.',
  },
  {
    id: 'the_news_minute',
    name: 'The News Minute',
    homepage: 'https://www.thenewsminute.com',
    rss: ['https://www.thenewsminute.com/rss'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'mostly',
    notes:
      'South India-focused digital outlet with particular depth in Tamil Nadu, Kerala, Karnataka, and Andhra/Telangana politics. Editorial line is liberal with strong feminist and Dalit rights coverage. Important counter-weight to Hindi-belt centrism in national coverage. Stories on regional politics are often first and most detailed.',
  },
  {
    id: 'frontline',
    name: 'Frontline',
    homepage: 'https://frontline.thehindu.com',
    rss: ['https://frontline.thehindu.com/rss'],
    lean: 'left_heavy',
    language: 'en',
    factuality: 'high',
    notes:
      'The Hindu group magazine with explicitly Marxist and left-liberal heritage. Long history of serious journalism on caste, labour, and civil liberties. Not a breaking news outlet. Analytical depth is strong; ideological framing is consistent and declared. P Sainath\'s rural coverage remains a reference standard.',
  },

  // CENTRE / SHIFTING
  {
    id: 'the_hindu',
    name: 'The Hindu',
    homepage: 'https://www.thehindu.com',
    rss: ['https://www.thehindu.com/feeder/default.rss'],
    lean: 'centre',
    language: 'en',
    factuality: 'high',
    notes:
      'Historically the most authoritative English-language newspaper for policy, judiciary, and international coverage. Left-of-centre on social issues, economically centrist. The N. Ram era (editor until 2011) was explicitly more left; subsequent editors have moderated. Strong on Supreme Court coverage, diplomatic affairs, and South India. Internal editorial disputes in the Kasturi family have occasionally surfaced publicly.',
  },
  {
    id: 'indian_express',
    name: 'Indian Express',
    homepage: 'https://indianexpress.com',
    rss: ['https://indianexpress.com/feed/'],
    lean: 'centre',
    language: 'en',
    factuality: 'high',
    notes:
      'Consistently high factual standards. Strong investigative unit (broke Pegasus India angle, Rafale offset partners, demonetisation data). Perceived as centre-left but has published strong investigations critical of both BJP and Congress governments. Editor Raj Kamal Jha maintains editorial independence under Viveck Goenka ownership. One of the more reliable outlets for court reporting.',
  },
  {
    id: 'hindustan_times',
    name: 'Hindustan Times',
    homepage: 'https://www.hindustantimes.com',
    rss: ['https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Owned by KK Birla group (Shobhana Bhartia). Broadly centrist but has softened coverage of the ruling establishment since 2014, according to multiple internal and external critiques. Breaking news accuracy is good. The Live Mint sister publication has stronger business journalism. Editorial courage on specific stories has been inconsistent.',
  },
  {
    id: 'times_of_india',
    name: 'Times of India',
    homepage: 'https://timesofindia.indiatimes.com',
    rss: ['https://timesofindia.indiatimes.com/rssfeedstopstories.cms'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Largest English-language newspaper by circulation. Bennett Coleman ownership is commercially driven; editorial line follows advertiser and government relationships more than consistent ideology. Known for Medianet (paid content passed as journalism, disclosed only in fine print). Breaking news is usually accurate on basic facts; depth and follow-through are inconsistent. Strong city-level bureaus.',
  },
  {
    id: 'ndtv',
    name: 'NDTV',
    homepage: 'https://www.ndtv.com',
    rss: ['https://feeds.feedburner.com/ndtvnews-india-news'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Acquired by Adani Group (Gautam Adani) in 2022-23 from the Prannoy Roy/Radhika Roy founders. Editorial independence under Adani ownership is an open and unresolved question as of 2025; multiple senior journalists departed post-acquisition. Pre-acquisition NDTV was the closest Indian TV equivalent to a public broadcaster in terms of election coverage quality. Current editorial posture is being watched by press freedom organisations.',
  },
  {
    id: 'the_print',
    name: 'The Print',
    homepage: 'https://theprint.in',
    rss: ['https://theprint.in/feed/'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes:
      'Founded by Shekhar Gupta. Explicitly centrist-to-national-security-hawk positioning. Strong on defence, foreign policy, and BJP internal politics (Gupta has sources across the political spectrum). Known for the National Interest and Off the Cuff series. Occasionally publishes BJP government positions more sympathetically than centre-left outlets. Good factual accuracy; framing varies by writer.',
  },
  {
    id: 'india_today',
    name: 'India Today',
    homepage: 'https://www.indiatoday.in',
    rss: ['https://www.indiatoday.in/rss/home'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes:
      'TV and magazine group (Living Media / Aroon Purie). Among the most popular news brands in India. Magazine has a long history of serious political journalism; TV channel is more sensationalist. Mood of the Nation polls are frequently cited by political analysts. Centre-right tilt post-2014 but not as pronounced as Republic or Zee.',
  },
  {
    id: 'mint',
    name: 'Mint',
    homepage: 'https://www.livemint.com',
    rss: ['https://www.livemint.com/rss/news'],
    lean: 'centre',
    language: 'en',
    factuality: 'high',
    notes:
      'HT Media business newspaper, sister to Hindustan Times. Among the best in India for economic data reporting, budget analysis, and corporate news. Pro-market editorial line. Weak on political accountability journalism but strong on economic policy. Cites primary data sources more consistently than most Indian outlets.',
  },

  // RIGHT LEAN — additional
  {
    id: 'economictimes',
    name: 'Economic Times',
    homepage: 'https://economictimes.indiatimes.com',
    rss: ['https://economictimes.indiatimes.com/rssfeedsdefault.cms'],
    lean: 'right_lean',
    language: 'en',
    factuality: 'mostly',
    notes: 'Business-focused outlet under Bennett Coleman (Times Group). Pro-market editorial line. Strong on corporate, policy, and financial data. Breaking news accuracy is high; framing tilts toward business interests.',
  },
  {
    id: 'news18',
    name: 'News18',
    homepage: 'https://www.news18.com',
    rss: ['https://www.news18.com/commonfeeds/v1/eng/rss/india.xml'],
    lean: 'right_lean',
    language: 'en',
    factuality: 'mixed',
    notes: 'Reliance/Network18 group. Closely aligned with ruling establishment since Reliance acquisition. Large audience across Hindi belt. Breaking news is fast but framing consistently favours government.',
  },
  {
    id: 'firstpost',
    name: 'Firstpost',
    homepage: 'https://www.firstpost.com',
    rss: ['https://www.firstpost.com/commonfeeds/v1/eng/rss/india.xml'],
    lean: 'right_lean',
    language: 'en',
    factuality: 'mixed',
    notes: 'Network18/Reliance group digital outlet. Opinion-heavy; original reporting is thin but covers breaking news. Editorial line aligns with Network18 corporate positioning.',
  },
  {
    id: 'wion',
    name: 'WION',
    homepage: 'https://www.wionews.com',
    rss: ['https://www.wionews.com/feeds/india.xml'],
    lean: 'right_lean',
    language: 'en',
    factuality: 'mixed',
    notes: 'Zee Media international news channel. Nationalist framing on India stories. Reliable for breaking India-related international news; geopolitical analysis skews toward Indian government positions.',
  },

  // CENTRE — additional
  {
    id: 'business_standard',
    name: 'Business Standard',
    homepage: 'https://www.business-standard.com',
    rss: ['https://www.business-standard.com/rss/latest.rss'],
    lean: 'centre',
    language: 'en',
    factuality: 'high',
    notes: 'Independent business newspaper. Strong on RBI, finance ministry, and corporate coverage. One of the most reliable outlets for economic data. Editorial independence is well-maintained.',
  },
  {
    id: 'financial_express',
    name: 'Financial Express',
    homepage: 'https://www.financialexpress.com',
    rss: ['https://www.financialexpress.com/feed/'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Indian Express group business publication. Good economic and policy reporting. Pro-market but maintains editorial standards. Shares resources with Indian Express investigative team.',
  },
  {
    id: 'deccan_herald',
    name: 'Deccan Herald',
    homepage: 'https://www.deccanherald.com',
    rss: ['https://www.deccanherald.com/rss-feed/national'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Bengaluru-based English daily. Centre-liberal editorial position. Strong on Karnataka and South India coverage. Reliable on national policy stories with regional perspective.',
  },
  {
    id: 'new_indian_express',
    name: 'New Indian Express',
    homepage: 'https://www.newindianexpress.com',
    rss: ['https://www.newindianexpress.com/rss/feeds/news.xml'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Successor to Indian Express in South India after split. Strong regional coverage in Tamil Nadu, Kerala, Karnataka, Andhra. Centrist editorial position with occasional right-of-centre framing.',
  },
  {
    id: 'dna_india',
    name: 'DNA India',
    homepage: 'https://www.dnaindia.com',
    rss: ['https://www.dnaindia.com/feeds/news.xml'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Diligent Media Corporation outlet. Primarily Mumbai-centric. Centre editorial line. Good on Maharashtra politics and Bollywood alongside national coverage.',
  },
  {
    id: 'moneycontrol',
    name: 'Moneycontrol',
    homepage: 'https://www.moneycontrol.com',
    rss: ['https://www.moneycontrol.com/rss/latestnews.xml'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Network18 business and markets platform. Leading source for stock market, mutual fund, and personal finance news. Breaking market news is fast and generally accurate.',
  },
  {
    id: 'tribune_india',
    name: 'Tribune India',
    homepage: 'https://www.tribuneindia.com',
    rss: ['https://www.tribuneindia.com/rss/india.xml'],
    lean: 'centre',
    language: 'en',
    factuality: 'mostly',
    notes: 'Chandigarh-based with strong Punjab, Haryana, and Himachal Pradesh coverage. Centrist, trusted in North India. Historically independent; good on agricultural and administrative reporting.',
  },

  // LEFT LEAN — additional
  {
    id: 'newsclick',
    name: 'Newsclick',
    homepage: 'https://www.newsclick.in',
    rss: ['https://www.newsclick.in/rss.xml'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'mostly',
    notes: 'Independent left-wing digital outlet. Strong on labour, workers rights, and farmers movements. Faced sedition charges from Modi government in 2023; journalists arrested. Important counter-narrative source.',
  },
  {
    id: 'the_citizen',
    name: 'The Citizen',
    homepage: 'https://www.thecitizen.in',
    rss: ['https://www.thecitizen.in/rss/news'],
    lean: 'left_lean',
    language: 'en',
    factuality: 'mostly',
    notes: 'Independent digital outlet with consistent civil liberties and minority rights focus. Strong on Northeast India, Kashmir, and Adivasi issues. Left-liberal with high ethical standards.',
  },

  // WIRE
  {
    id: 'ani',
    name: 'ANI',
    homepage: 'https://aninews.in',
    rss: ['https://aninews.in/rss/'],
    lean: 'wire',
    language: 'en',
    factuality: 'mixed',
    notes:
      'Asian News International: India\'s dominant wire service, syndicated by nearly all Indian outlets including those critical of it. "Wire service" does NOT mean neutral. Multiple credible investigations and public critiques (The Wire, The Hoot, Reuters Institute) have documented that ANI routinely carries government press releases as independent reporting, gives ruling party statements disproportionate placement, and rarely sources opposition or civil society voices with equivalent weight. Government officials and BJP ministers are among its primary news sources. Treat ANI reports on government actions as official positioning, not independent verification.',
  },
];

export const SOURCE_MAP = new Map<string, Source>(SOURCES.map((s) => [s.id, s]));

export function getSourcesByLean(lean: SourceLean): Source[] {
  return SOURCES.filter((s) => s.lean === lean);
}
