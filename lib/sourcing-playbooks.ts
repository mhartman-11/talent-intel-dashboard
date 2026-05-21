/**
 * Sourcing playbooks per fixture.
 *
 * Each entry contains 3 Boolean / X-Ray search strings (LinkedIn, Google X-Ray,
 * and a role-specific third platform) plus a curated list of sourcing sites with
 * "why this site for this talent" rationale.
 *
 * Boolean strings are written for direct paste into LinkedIn Recruiter or Google.
 * Operators: ALL CAPS booleans on LinkedIn ("AND", "OR", "NOT"); standard Google
 * operators on Google X-Ray (site:, intitle:, -exclusion).
 */

export interface BooleanString {
  platform: string;
  query: string;
  rationale: string;
}

export interface SourcingSite {
  name: string;
  why: string;
}

export interface SourcingPlaybook {
  booleanStrings: BooleanString[];
  sourcingSites: SourcingSite[];
}

export const SOURCING_PLAYBOOKS: Record<string, SourcingPlaybook> = {
  'staff-ml-eng-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Staff Machine Learning Engineer" OR "Staff ML Engineer" OR "Senior Staff ML" OR "Principal ML Engineer") AND ("recommendation*" OR "ranking" OR "personalization" OR "search relevance") AND (TensorFlow OR PyTorch OR JAX) NOT ("intern" OR "junior")',
        rationale: 'Targets true Staff-scope ML with production rec-systems experience. Title constraint plus framework signal excludes title-inflated juniors.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in ("Staff ML" OR "Principal ML") (recommendations OR personalization OR ranking) (Pinterest OR Spotify OR DoorDash OR Stripe OR Snap) -intitle:"profiles"',
        rationale: 'Bypasses LinkedIn Recruiter to find senior ML at high-signal feeder companies. Useful when LIR seat is exhausted.',
      },
      {
        platform: 'GitHub',
        query: 'location:"San Francisco" OR location:"Seattle" OR location:"New York" language:Python "machine learning" followers:>200',
        rationale: 'Surfaces senior ML engineers with public open-source signal. Followers >200 filters for community-influential ICs the algorithm misses.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Primary channel for Staff+ ML titles and current-company filtering.' },
      { name: 'GitHub', why: 'Public ML repos and contribution graphs reveal depth and adjacent expertise — followers count is your quality filter.' },
      { name: 'arXiv + Papers with Code', why: 'Recent applied-research publications signal cutting-edge engineers worth a personalized reach-out.' },
      { name: 'Kaggle (Grandmaster tier)', why: 'Kaggle Grandmasters with 4+ years industry tenure are an under-tapped Staff-level pool.' },
      { name: 'NeurIPS / ICML / RecSys attendee directories', why: 'Workshop presenters and tutorial speakers self-select for the depth Netflix wants.' },
      { name: 'Ex-Netflix ML alumni network', why: 'Highest-conversion source for IC5+ ML. Mine Netflix Tech Blog authors 2018–2022.' },
    ],
  },

  'senior-swe-ic4': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Software Engineer" OR "Senior SWE" OR "Senior Backend Engineer" OR "Senior Full Stack") AND ("distributed systems" OR "microservices" OR "high scale") AND (Java OR Go OR Python OR Kotlin) NOT ("intern" OR "junior" OR "associate")',
        rationale: 'Captures generalist senior engineers with production-scale experience. Excludes title-inflated mid-level via the explicit NOT.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior software engineer" "distributed systems" (Stripe OR Airbnb OR DoorDash OR Snap) -intitle:"junior"',
        rationale: 'Surfaces senior engineers at known-quality feeder companies. The negative title filter avoids early-career mis-tags.',
      },
      {
        platform: 'GitHub',
        query: 'location:USA language:Go OR language:Rust OR language:Python repos:>5 followers:>50 -type:org',
        rationale: 'Filters for active contributors with reputational capital. Use commit-graph density as a craft signal that LinkedIn cannot show.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Largest IC4 pool with the cleanest title filters.' },
      { name: 'GitHub', why: 'Commit frequency and code quality on public repos are stronger signal than résumé bullet points for this level.' },
      { name: 'Stack Overflow Careers / Developer Story', why: 'Long-tail engineers who maintain SO presence often hate LinkedIn outreach but respond on this channel.' },
      { name: 'Hacker News "Who is hiring" / "Who wants to be hired"', why: 'Self-identified engineers actively considering moves. Monthly cadence.' },
      { name: 'Read.cv', why: 'Modern résumé site with strong design + engineering crossover. Lower-noise than LinkedIn.' },
      { name: 'Conference speaker rolls (Strange Loop, USENIX, QCon)', why: 'Speakers self-select for the autonomy/depth Netflix\'s no-QA culture demands.' },
    ],
  },

  'staff-swe-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Staff Software Engineer" OR "Staff Engineer" OR "Staff SWE" OR "Senior Staff Engineer") AND ("technical leadership" OR "architecture" OR "tech lead") AND (Java OR Go OR Rust OR Kotlin) NOT ("intern" OR "manager")',
        rationale: 'Filters for true Staff scope (multi-team technical leadership). NOT manager keeps the list IC-only.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "staff engineer" (Stripe OR Cloudflare OR Datadog OR Snowflake OR Databricks) "design doc" OR "RFC"',
        rationale: 'Surfaces Staff ICs at premier infra companies whose self-descriptions reference written technical leadership artifacts.',
      },
      {
        platform: 'GitHub',
        query: 'org:kubernetes OR org:rust-lang OR org:apache repos:>10 followers:>500',
        rationale: 'Maintainers of foundational OSS projects. Direct outreach via GitHub itself converts higher than cold LinkedIn for this archetype.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Use sparingly — Staff engineers ignore generic InMail. Personalize every message with a specific technical reference.' },
      { name: 'GitHub (OSS maintainer search)', why: 'The OSS commit history is the résumé. Outreach via GitHub direct messaging or referenced issues converts.' },
      { name: 'USENIX / SREcon / QCon speaker archives', why: 'Talk rolls 2020-present are a curated Staff-engineer database.' },
      { name: 'Tech blog authors (own sites + Substack)', why: 'Engineers who write publicly self-select for the writing-heavy culture Netflix runs.' },
      { name: 'Conference Slack archives (Gophers, Rustaceans, K8s)', why: 'Active technical community participation is high-signal for taste and current expertise.' },
      { name: 'Ex-Netflix engineering alumni', why: 'Many founded startups 2020-2023 — re-engage 18+ months post-founding for graceful returns.' },
    ],
  },

  'principal-swe-ic6': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Principal Software Engineer" OR "Principal Engineer" OR "Distinguished Engineer" OR "Senior Staff Engineer") AND ("technical strategy" OR "org-level" OR "set technical direction") NOT ("manager" OR "director")',
        rationale: 'Captures IC6-scope ICs with self-described org-level scope. Manager exclusion is critical at this level.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in ("Principal Engineer" OR "Distinguished Engineer") (Google OR AWS OR Apple OR Stripe OR Anthropic) "conference" OR "keynote"',
        rationale: 'Surfaces Principal-level ICs with externally-visible body of work. Public talk history is the differentiating signal at this tier.',
      },
      {
        platform: 'Google Scholar + Conference Proceedings',
        query: 'site:scholar.google.com OR site:dl.acm.org "principal engineer" industry-track OR applied-track',
        rationale: 'Principals at this level often co-author industry-track papers at SIGMOD, OSDI, SOSP, USENIX. Search the proceedings.',
      },
    ],
    sourcingSites: [
      { name: 'USENIX / SOSP / OSDI / SIGMOD industry-track papers', why: 'Co-authoring or keynoting these is the externally-visible body of work that distinguishes IC6 from inflated IC5.' },
      { name: 'Personal technical blogs + Mastodon/Twitter', why: 'Principals who write publicly are far more sourcable. Mine their network for warm intros.' },
      { name: 'IETF / W3C standards working groups', why: 'Active participation in standards bodies is a near-uniquely IC6 signal.' },
      { name: 'Patent records (Google Patents)', why: 'Filed-but-public patents reveal long-horizon technical bets they\'ve made.' },
      { name: 'Ex-FAANG executive search firms (Riviera, True)', why: 'Some agencies maintain a 200-person Principal-engineer roster. Worth a paid retainer for this single hire.' },
      { name: 'Conference circuit relationship-building', why: 'Most successful IC6 hires are 12-18 month relationships built before there\'s an open req.' },
    ],
  },

  'senior-ml-eng-ic4': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Machine Learning Engineer" OR "Senior ML Engineer" OR "Senior AI Engineer") AND ("end-to-end" OR "production ML" OR "model deployment") AND (TensorFlow OR PyTorch) NOT ("intern" OR "junior" OR "data analyst")',
        rationale: 'Filters for full-stack ML ICs (training + deployment + monitoring). Data-analyst exclusion is critical — most "ML Engineer" titles are 70% analytics work.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior ML engineer" (Pinterest OR Spotify OR DoorDash OR Stripe OR Snap) "shipped" OR "production"',
        rationale: 'Surfaces ML engineers at the highest-signal feeder companies who describe their work in production terms.',
      },
      {
        platform: 'Kaggle + GitHub',
        query: 'Kaggle Grandmaster OR Kaggle Master with 3+ years industry tenure, language:Python ML repos:>3',
        rationale: 'Kagglers who transitioned to industry and stuck are 3x more likely to clear Netflix\'s end-to-end ownership bar.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Use with strict feeder-company filters — most "ML Engineer" titles outside top 20 companies do not clear the bar.' },
      { name: 'Kaggle competition leaderboards', why: 'Recent top-50 finishers at relevant competitions (recommendations, time-series, ranking) are direct-pitch candidates.' },
      { name: 'GitHub ML repos', why: 'Quality of inference code, eval harnesses, and reproducibility infra is the craft signal LinkedIn cannot show.' },
      { name: 'Papers with Code', why: 'Authors with implementations of their own papers in production-quality code self-select for end-to-end ownership.' },
      { name: 'RecSys / KDD attendee + author lists', why: 'For recommendations-shaped roles specifically, these conferences are the densest single source.' },
      { name: 'Twitter ML community (Andrew Mao, Lex Fridman network)', why: 'Strong engineers actively discuss craft on Twitter. Use list-engagement, not cold DMs.' },
    ],
  },

  'eng-manager': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Engineering Manager" OR "Software Engineering Manager" OR "Tech Lead Manager") AND ("hired" OR "grew the team" OR "managed 6" OR "managed 7" OR "managed 8") NOT ("intern" OR "associate")',
        rationale: 'Team-size signal in the keyword is what separates real EMs from people-leads. The "hired" / "grew" verbs filter for active recruiters not just maintainers.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "engineering manager" (Stripe OR Airbnb OR DoorDash OR Snowflake) "no PIP" OR "performance culture" OR "freedom and responsibility"',
        rationale: 'Surfaces EMs at companies that recently introduced restrictive performance management — they actively leave for Netflix-style autonomy.',
      },
      {
        platform: 'LeadDev / Engineering Leader newsletters',
        query: 'LeadDev attendee archives 2022-present; Lara Hogan / Will Larson / Camille Fournier readership lists',
        rationale: 'EMs who attend LeadDev or follow named engineering-leader authors self-select for the craft-of-management mindset.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Wide pool, but heavy filter required — most EM titles are inflated team-lead roles without true personnel ownership.' },
      { name: 'LeadDev attendee / speaker archives', why: 'EMs who invest in their craft via this community are 4x more likely to clear Netflix\'s bar.' },
      { name: 'Engineering-leader Substacks (Lenny\'s Newsletter, Refactoring, The Pragmatic Engineer)', why: 'Subscriber overlap = EMs who think about management as a discipline.' },
      { name: 'Conference speaker rolls (QCon, GOTO, Mind the Product)', why: 'Speaking on management topics is a strong proxy for written management philosophy.' },
      { name: 'Internal Staff IC referrals', why: 'Highest-conversion source — your current Staff engineers know who they\'d want as their manager.' },
      { name: 'Ex-startup CTO network', why: 'Founders whose startups didn\'t scale and want to return to operator roles at Netflix scale.' },
    ],
  },

  'senior-eng-manager': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Engineering Manager" OR "Group Engineering Manager" OR "Manager of Managers") AND ("manager development" OR "org design" OR "25 engineers" OR "30 engineers" OR "40 engineers")',
        rationale: 'Numeric team-size keywords are how Senior EMs differentiate themselves. The "org design" phrase filters for the structural-thinking archetype.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior engineering manager" "managers reporting" OR "leadership" (Stripe OR Airbnb OR DoorDash OR Databricks)',
        rationale: 'Surfaces Senior EMs whose self-descriptions emphasize the manager-of-managers scope rather than IC scope.',
      },
      {
        platform: 'LeadDev / DDIA / Staff Plus communities',
        query: 'Speakers and panelists at LeadDev StaffPlus / StaffEng Slack 2022-present',
        rationale: 'Senior management talent in the engineering leadership conference circuit is the densest pool — 12+ month relationship build.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Use with company-tenure filter (3+ years current role) — Senior EMs who recently joined are not moving.' },
      { name: 'LeadDev StaffPlus + Lara Hogan readership', why: 'The two most engaged Senior EM communities in tech. Sponsorship pays off as soft funnel.' },
      { name: 'Engineering leader Twitter/Mastodon (Camille Fournier, Will Larson, Charity Majors)', why: 'Network overlap with these voices is high-signal for the senior management archetype.' },
      { name: 'Ex-startup CTO/VP-Eng network', why: 'Founders/early-leaders whose orgs scaled to 50+ engineers and want a top-operator return.' },
      { name: 'Executive search firms (Riviera Partners, Daversa)', why: 'Senior EM rolls are kept current by these firms. Retained search may be warranted.' },
      { name: 'Internal EM referrals', why: 'Current EMs know which Senior EMs they\'d want as their leader. Highest-trust source.' },
    ],
  },

  'senior-data-scientist-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Data Scientist" OR "Staff Data Scientist" OR "Lead Data Scientist") AND ("causal inference" OR "experimentation" OR "A/B testing" OR "quasi-experiment") NOT ("intern" OR "junior" OR "analyst")',
        rationale: 'Causal-inference keyword is the strongest filter — separates Netflix-bar DSs from dashboard-and-SQL analyst roles.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior data scientist" "experimentation" (Airbnb OR Spotify OR DoorDash OR Pinterest OR Microsoft) "causal" OR "instrumental variable"',
        rationale: 'Filters for DSs at high-signal feeder companies with self-described causal-inference fluency.',
      },
      {
        platform: 'Google Scholar + ACIC',
        query: 'site:scholar.google.com "applied causal inference" OR "experimentation at scale" industry author affiliation',
        rationale: 'Industry-affiliated authors at causal-inference venues (ACIC, KDD applied track) are an under-tapped pool.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Largest pool but requires the causal-inference keyword filter — most DS titles are analytics, not Netflix-grade experimentation.' },
      { name: 'ACIC (American Causal Inference Conference) speaker rolls', why: 'The densest single source for the specific DS archetype Netflix needs.' },
      { name: 'CODE@MIT / KDD applied track authors', why: 'Industry researchers publishing in applied causal venues self-select for Netflix\'s problem shape.' },
      { name: 'Twitter DS community (Andrew Gelman network, statmodeling.stat.columbia.edu)', why: 'Public engagement with statistical rigor is a craft signal that survey-style résumés don\'t capture.' },
      { name: 'Adjacent industries (healthcare, fintech, policy think tanks)', why: 'Senior DSs at RAND, FDA, Federal Reserve research often pivot to product DS — under-tapped pool.' },
      { name: 'Women in Data Science (WiDS) Stanford alumni', why: 'Senior cohort 5+ years out is a high-signal diversity-aligned source.' },
    ],
  },

  'staff-research-scientist-ic6': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Staff Research Scientist" OR "Senior Research Scientist" OR "Principal Research Scientist") AND ("applied research" OR "production" OR "shipped to") NOT ("intern" OR "PhD candidate")',
        rationale: 'Applied-research + shipped language filters out pure-academic researchers who don\'t deploy. Netflix\'s 6-month-or-it-doesn\'t-exist culture demands this.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "research scientist" (Google Brain OR FAIR OR DeepMind OR MSR OR Apple ML) "production" OR "deployed"',
        rationale: 'Surfaces lab researchers with explicit deployment language — distinguishes them from publication-only colleagues.',
      },
      {
        platform: 'arXiv + Google Scholar',
        query: 'site:arxiv.org applied ML "in production at scale" OR "serving traffic" industry author affiliation 2023-present',
        rationale: 'Recent papers with production-deployment framing identify researchers Netflix can actually convert.',
      },
    ],
    sourcingSites: [
      { name: 'arXiv (applied / industry track)', why: 'Paper authors with production-deployment language are the primary pool. Mine 2022-present.' },
      { name: 'NeurIPS / ICML / KDD industry-track presenters', why: 'Industry-track talks are explicitly applied — speaker rolls are a curated source.' },
      { name: 'Top university research-lab alumni (Stanford SAIL, CMU MLD, MIT CSAIL, Berkeley BAIR)', why: '5-8 year post-PhD alumni who haven\'t founded labs of their own are the sweet spot.' },
      { name: 'Personal research blogs + Twitter', why: 'Researchers who write publicly about deployment trade-offs self-select for the Netflix culture.' },
      { name: 'Ex-frontier-lab alumni (Brain, FAIR, DeepMind 2018-2022)', why: 'Many left during reorganizations — re-engage 18 months later for graceful next moves.' },
      { name: 'International labs (Mila Montreal, Inria, ETH, Tel Aviv)', why: 'Under-recruited geo for IC6-grade research talent. Relocation is the friction, not the talent.' },
    ],
  },

  'senior-product-manager-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Product Manager" OR "Staff Product Manager" OR "Lead Product Manager") AND ("0 to 1" OR "shipped" OR "consumer product" OR "subscription") NOT ("associate" OR "junior")',
        rationale: 'Shipping language + product-shape filters separate Senior PMs from PM coordinators. The subscription keyword targets Netflix-adjacent problem shape.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior product manager" (Spotify OR Airbnb OR DoorDash OR Pinterest OR Snap) "wrote" OR "memo" OR "strategy doc"',
        rationale: 'Self-described writing-heavy PMs at feeder companies — the strongest signal for Netflix\'s memo culture.',
      },
      {
        platform: 'Substack + Twitter',
        query: 'Substack subscribers to Lenny\'s Newsletter, Reforge, First Round Review — cross-reference with active PM Twitter accounts',
        rationale: 'PMs who write publicly are 4x more likely to clear Netflix\'s writing bar than PMs found via title search alone.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Strong pool but Netflix bar disqualifies 60%+ — heavy emphasis needed on writing samples in screening.' },
      { name: 'Lenny\'s Newsletter / Reforge community', why: 'Active engagement here = PMs who think about craft. Sponsorship is a high-ROI soft funnel.' },
      { name: 'Personal product blogs + Medium', why: 'Long-form public product writing is the single best filter for Netflix\'s writing-first culture.' },
      { name: 'Twitter product community (Shreyas Doshi, Lenny Rachitsky, etc.)', why: 'PMs engaged in public craft discussion self-select for the writing-heavy mindset.' },
      { name: 'Read.cv', why: 'Modern PM résumé platform — typically lower-noise than LinkedIn for senior IC PMs.' },
      { name: 'Adjacent industries (gaming, streaming audio, fitness subscriptions)', why: 'PMs with subscription-economics depth are under-recruited from non-streaming verticals.' },
    ],
  },

  'director-product': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Director of Product" OR "Director Product Management" OR "Head of Product" OR "Group Product Manager") AND ("leading" OR "managing PMs" OR "PM team") AND ("subscription" OR "consumer" OR "streaming")',
        rationale: 'Director-scope keywords plus subscription-economics framing targets Netflix-shaped product leaders specifically.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "director of product" (Spotify OR Disney OR Hulu OR Paramount) "shipped" OR "launched"',
        rationale: 'Surfaces Director-level Product talent at direct streaming competitors. High-conversion if their role recently shifted.',
      },
      {
        platform: 'Industry Press + Podcast Archives',
        query: 'Podcast guest archives (Lenny\'s Podcast, Decoder, Product Thinking) 2022-present; Cannes Lions Innovation Track speaker rolls',
        rationale: 'Public-facing Directors who do podcast / conference work signal externally-visible product taste.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter (executive search seat)', why: 'Use Sales Navigator + Insights for tenure tracking. Most successful hires are 6+ month relationships.' },
      { name: 'Lenny\'s Podcast / Decoder / Product Thinking guest archives', why: 'Public-facing Directors are easier to evaluate and more responsive to non-cold outreach.' },
      { name: 'Reforge Senior Product community', why: 'Senior PM/Director-track community — sponsorship + speaker engagement is the soft funnel.' },
      { name: 'Personal product Substacks (Lenny, Shreyas, Julie Zhuo)', why: 'Director-level subscribers and engaged commenters self-select for craft.' },
      { name: 'Executive search retained firms (Daversa, True, Heidrick)', why: 'Director-of-Product searches commonly run through retained agencies. Warm-intro path.' },
      { name: 'Internal CPO/VP-Product referrals', why: 'Current Netflix product leadership knows the Director community by name. Highest-trust source.' },
    ],
  },

  'senior-product-designer-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Product Designer" OR "Staff Product Designer" OR "Lead Product Designer") AND ("end-to-end" OR "shipped" OR "research" OR "interaction") NOT ("intern" OR "junior" OR "visual designer")',
        rationale: 'End-to-end + research keywords filter for Netflix-bar designers (own surface from research through interaction). Excludes pure-visual designers.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior product designer" (Airbnb OR Stripe OR Figma OR Apple) "case study" OR "portfolio"',
        rationale: 'Surfaces designers at premier brand-quality companies with documented portfolio depth — the strongest external signal.',
      },
      {
        platform: 'Dribbble + Read.cv + Personal sites',
        query: 'Dribbble Pro members + Read.cv "Senior Designer" filter + personal-domain portfolio search',
        rationale: 'Direct portfolio inspection is far higher signal than LinkedIn title scanning for senior design hires.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Use with case-study / portfolio keyword filters — title alone is insufficient signal at the senior level.' },
      { name: 'Personal portfolio sites (custom domains)', why: 'Designers with maintained portfolios on their own domains self-select for craft pride.' },
      { name: 'Dribbble (Pro tier) + Behance', why: 'Visual + interaction portfolios. Quality signal that LinkedIn does not surface.' },
      { name: 'Read.cv', why: 'Designer-heavy modern résumé platform — lower-noise senior IC pool than LinkedIn.' },
      { name: 'Config (Figma conference) speaker / attendee rolls', why: 'Speakers especially are pre-filtered for craft + influence. Networking-driven hiring channel.' },
      { name: 'Adjacent industries (games, film/TV graphics, editorial design)', why: 'Designers with narrative-craft backgrounds map well to Netflix\'s anticipation-and-taste design problems.' },
    ],
  },

  'staff-content-designer-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Staff Content Designer" OR "Senior Content Designer" OR "Staff UX Writer" OR "Principal Content Designer") AND ("voice" OR "tone" OR "content strategy" OR "content systems")',
        rationale: 'Staff-tier title filter plus systems-thinking language separates this archetype from copywriters.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "content designer" (Airbnb OR Stripe OR Atlassian OR Shopify) "wrote" OR "essay" OR "newsletter"',
        rationale: 'Content designers with personal writing practice are 5x more likely to clear Netflix\'s editorial-craft bar.',
      },
      {
        platform: 'Substack + Personal sites',
        query: 'Substack writers crossing editorial + UX backgrounds; Button Conference speaker archives',
        rationale: 'Content designers with active personal writing identify the archetype Netflix needs — craft, not just product writing.',
      },
    ],
    sourcingSites: [
      { name: 'Button Conference speaker + attendee archives', why: 'The single densest source for senior content design talent. Sponsorship is high-ROI.' },
      { name: 'Personal Substacks (UX writing + editorial crossover)', why: 'Writers maintaining personal newsletters self-select for the craft Netflix needs.' },
      { name: 'LinkedIn Recruiter (heavy keyword filter)', why: 'Title is unreliable — use the writing-craft keywords ("voice", "tone", "essay") aggressively.' },
      { name: 'Independent literary magazines + longform journalism', why: 'Senior editors at McSweeney\'s, The Atlantic, Pulitzer-track journalists open to product transitions.' },
      { name: 'Where Are The Black Designers content strategy chapter', why: 'High-signal diversity-aligned source for senior content design.' },
      { name: 'X-Ray Search of UX Writing Hub authors', why: 'UXWritingHub.com author rolls are a curated content-design community.' },
    ],
  },

  'director-original-series': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Director, Original Series" OR "VP, Original Programming" OR "Head of Scripted" OR "SVP, Original Series") AND ("development" OR "greenlight" OR "showrunner") AND (streaming OR HBO OR Amazon OR Apple OR Hulu)',
        rationale: 'Streaming-tagged title pool. Greenlight/showrunner keywords filter for development executives vs production-only roles.',
      },
      {
        platform: 'Deadline / Variety / IMDB Pro',
        query: 'IMDB Pro "Development" credit search for streaming originals 2022-present; Deadline staff move archive',
        rationale: 'Industry trade publications track development executive moves more accurately than LinkedIn. Deadline staffing reports are gold.',
      },
      {
        platform: 'Festival + Industry Database X-Ray',
        query: 'Sundance Producers Lab fellow archives; CAA / WME / UTA TV literary agent rolls; Time\'s Up Entertainment member directory',
        rationale: 'Festival fellows + agency executives who pivot to streamers are an established talent pipeline.',
      },
    ],
    sourcingSites: [
      { name: 'IMDB Pro', why: 'Development executive credits with dates and projects. Far more accurate than LinkedIn for content roles.' },
      { name: 'Deadline / Variety / Hollywood Reporter executive-moves coverage', why: 'Trade publications are the primary signal channel for Director-level scripted talent.' },
      { name: 'Sundance Producers Lab + Sundance Episodic Lab fellow rolls', why: 'Curated by Sundance — high signal for the development archetype with creative chops.' },
      { name: 'Major lit agency rosters (CAA, WME, UTA, Endeavor)', why: 'Senior agency executives moving in-house are a known talent pipeline.' },
      { name: 'NALIP / ColorCreative / Ghetto Film School executive networks', why: 'Underrepresented development talent communities — the strongest diversity-aligned source.' },
      { name: 'Festival circuit relationship building (Sundance, Toronto, Cannes)', why: 'Director-level scripted hires are 12+ month relationships built at festivals, not on LinkedIn.' },
    ],
  },

  'manager-content-acquisition': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Manager Content Acquisition" OR "Content Licensing Manager" OR "Manager, Acquisitions" OR "Programming Acquisitions") AND (streaming OR rights OR licensing) AND ("deal" OR "negotiation" OR "modeled")',
        rationale: 'Deal-language plus streaming-tag filter targets the model-rigorous archetype Netflix\'s acquisition discipline requires.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "content acquisitions" (Amazon OR Apple OR Disney OR Paramount) "LTV" OR "subscriber" OR "modeled"',
        rationale: 'Surfaces acquisition executives at competitor streamers with explicit financial-modeling language.',
      },
      {
        platform: 'Industry Markets + Agency Rolls',
        query: 'MIPCOM / NATPE / AFM attendee + speaker archives; senior business affairs at CAA / WME / UTA',
        rationale: 'International content markets are the primary networking venue. Agency BA executives in-housing is a known pipeline.',
      },
    ],
    sourcingSites: [
      { name: 'MIPCOM / NATPE / AFM attendee databases', why: 'International content markets are the densest single source for the acquisition archetype.' },
      { name: 'IMDB Pro (Acquisition executive credits)', why: 'Track which executives have closed which titles — far more accurate than LinkedIn.' },
      { name: 'Senior agency business affairs (CAA, WME, UTA, Endeavor)', why: 'Senior BA execs lateraling in-house are a known talent pipeline.' },
      { name: 'Deadline / Variety executive-moves archive', why: 'Trade press tracks acquisition executive moves accurately.' },
      { name: 'International streamer acquisition teams (Reliance Jio, Rakuten Viki)', why: 'Underweighted geographic pool for non-English-language acquisition expertise.' },
      { name: 'NALIP + BESLA business affairs networks', why: 'Strongest diversity-aligned sources for acquisition leadership.' },
    ],
  },

  'senior-games-engineer-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Games Engineer" OR "Staff Games Engineer" OR "Senior Game Developer" OR "Lead Game Engineer") AND ("shipped" OR "Unity" OR "Unreal" OR "C++") AND (mobile OR cloud OR streaming)',
        rationale: 'Shipped-game language plus mobile/cloud filter targets Netflix Games\' specific platform shape.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior games engineer" (Riot OR Roblox OR Supercell OR Epic OR King) "shipped" OR "live operations"',
        rationale: 'Surfaces engineers at premier mobile/live-ops studios — Netflix Games\' competitive set specifically.',
      },
      {
        platform: 'GitHub + itch.io',
        query: 'GitHub: language:C++ OR language:C# game-related repos:>3 followers:>100; itch.io game developer profiles',
        rationale: 'Game engineers with personal game-jam or indie projects on GitHub/itch.io self-select for craft beyond day-job.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Useful but the games industry is heavily relationship-driven — direct outreach converts less than referrals.' },
      { name: 'GitHub (game engine + tooling repos)', why: 'Engine-level contributions on Unity Asset Store, Unreal plugins, OSS engines reveal depth.' },
      { name: 'itch.io developer profiles', why: 'Personal indie projects show ownership and craft passion. Particularly valuable for senior IC sourcing.' },
      { name: 'GDC speaker + attendee archives', why: 'GDC presence is the primary networking venue. Talk archives are a curated senior-engineer pool.' },
      { name: 'IGDA (International Game Developers Association) member directory', why: 'Active members signal community engagement.' },
      { name: 'Game Devs of Color Expo speaker rolls', why: 'Highest-signal diversity-aligned source for senior games engineering.' },
    ],
  },

  'director-games-production': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Director Games Production" OR "Executive Producer Games" OR "Studio Head" OR "Head of Production" Games) AND ("shipped" OR "live ops" OR "released") AND (mobile OR cloud OR subscription)',
        rationale: 'Production-leadership scope plus subscription/mobile platform-shape filter targets Netflix Games\' specific need.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "director of production" games (Riot OR Apple Arcade OR Roblox OR EA Mobile OR King) "shipped" OR "live"',
        rationale: 'Surfaces production directors at studios whose business shape (subscription, mobile, live-ops) matches Netflix Games.',
      },
      {
        platform: 'GDC + DICE Summit Executive Track',
        query: 'GDC Production track speakers + DICE Summit attendee rolls 2022-present',
        rationale: 'Industry conferences are the primary networking venue for production leadership. Speaker rolls are curated.',
      },
    ],
    sourcingSites: [
      { name: 'GDC Executive Track / DICE Summit', why: 'Director-level production talent is overwhelmingly relationship-built at these annual gatherings.' },
      { name: 'IMDB Pro (game credits)', why: 'Production credits track shipped games + roles accurately, including international studios.' },
      { name: 'LinkedIn Recruiter (executive search seat)', why: 'Use with company-tenure filter — Director-level games leaders move every 4-6 years.' },
      { name: 'Apple Arcade leadership network', why: 'Closest analog to Netflix Games\' subscription model — direct competitive pool.' },
      { name: 'Ex-studio leadership of recently-acquired studios', why: 'Embracer Group fallout, Microsoft-Activision integration, Sony first-party reshuffling = available talent.' },
      { name: 'Executive search firms with games specialization (Wilkinson Search)', why: 'Some retained search firms specialize in games-industry executives. Warm-intro path.' },
    ],
  },

  'senior-talent-partner-ic5': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Talent Partner" OR "Senior Recruiter" OR "Staff Recruiter" OR "Lead Talent Partner") AND ("Staff" OR "Principal" OR "executive search") AND (closed OR placed) NOT ("intern" OR "junior")',
        rationale: 'Staff/Principal closing language separates senior tech recruiters who hire at the level Netflix needs from coordinator-tier recruiters.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior talent partner" (Stripe OR Anthropic OR Databricks OR Roblox) "Staff" OR "Principal" "closed"',
        rationale: 'Surfaces senior recruiters at competitor companies who have closed at the level Netflix demands.',
      },
      {
        platform: 'ERE / SourceCon / Recruiting Community',
        query: 'ERE Recruiting Conference speaker rolls 2022-present; SourceCon attendee archive; Hung Lee\'s Recruiting Brainfood subscriber data',
        rationale: 'Senior recruiters engaged in their own craft community are 3x more likely to clear Netflix\'s bar than passive title-holders.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Primary tool, but bar requires evidence of closing Staff/Principal candidates against frontier-lab counterfactuals.' },
      { name: 'ERE Recruiting Conference + SourceCon archives', why: 'Speaker / attendee history is a curated senior-recruiter pool engaged in craft.' },
      { name: 'Hung Lee\'s Recruiting Brainfood newsletter', why: 'The active senior-recruiter community signal. Engagement here = craft mindset.' },
      { name: 'Executive search firms (Riviera, True, Daversa)', why: 'Senior agency recruiters moving in-house are an established pipeline.' },
      { name: 'Twitter/LinkedIn recruiting influencer network (Glen Cathey, etc.)', why: 'Public-facing senior recruiters self-select for the strategic-partner mindset.' },
      { name: 'AHRMA + NAAAP HR/recruiting affinity networks', why: 'Strongest diversity-aligned sources for senior recruiting leadership.' },
    ],
  },

  'senior-manager-fpa': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Senior Manager FP&A" OR "Senior Finance Manager" OR "Senior Manager Financial Planning") AND (streaming OR media OR content OR subscription) AND ("partner" OR "business partner" OR "strategic")',
        rationale: 'Streaming/subscription industry filter plus business-partner language targets the unit-economics-fluent archetype Netflix needs.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "senior manager FP&A" (Disney OR Apple OR Spotify OR Stripe OR Roblox) "unit economics" OR "subscriber"',
        rationale: 'Surfaces senior FP&A at companies with subscription-economics depth and explicit unit-economics framing.',
      },
      {
        platform: 'WSO + CFA Member Search',
        query: 'WSO Senior FP&A community + CFA Institute member directory with media/TMT designations',
        rationale: 'Wall Street Oasis senior FP&A community + CFA media-coverage analysts are an under-tapped pool of finance-rigor talent.',
      },
    ],
    sourcingSites: [
      { name: 'LinkedIn Recruiter', why: 'Strong pool, but use the business-partner keyword filter aggressively — most FP&A titles are service-function-flavored.' },
      { name: 'WSO (Wall Street Oasis) senior FP&A community', why: 'Active engagement here = FP&A talent that thinks about business beyond producing decks.' },
      { name: 'Streaming/media TMT investment banking VPs (Allen & Co, LionTree, GS TMT)', why: 'Bankers covering streaming who want in-house transitions. Deep business understanding.' },
      { name: 'Top MBA programs (Stanford GSB, Wharton, HBS) 3-5 years post-MBA', why: 'Strong feeder for senior FP&A with subscription-economics sophistication.' },
      { name: 'CFA Institute media/TMT analyst network', why: 'Securities-side analysts who pivot to corporate finance roles.' },
      { name: 'NABA + ALPFA + Ascend finance affinity', why: 'Strongest diversity-aligned senior FP&A communities.' },
    ],
  },

  'director-brand-marketing': {
    booleanStrings: [
      {
        platform: 'LinkedIn Recruiter',
        query: '("Director of Brand" OR "Director Brand Marketing" OR "Head of Brand" OR "Senior Director Brand") AND ("consumer" OR "subscription" OR "DTC") AND ("brand metrics" OR "brand health" OR "moved")',
        rationale: 'Brand-metrics language separates Directors who actually move measurable brand from agency-output-managers.',
      },
      {
        platform: 'Google X-Ray',
        query: 'site:linkedin.com/in "director of brand" (Apple OR Nike OR Disney OR Spotify OR Airbnb) "shifted" OR "moved" OR "metrics"',
        rationale: 'Surfaces Directors at premier brands with explicit metric-moving language in their LinkedIn experience descriptions.',
      },
      {
        platform: 'Cannes Lions + Adweek',
        query: 'Cannes Lions winner archives 2022-present; Adweek Brand Genius / 40 Under 40 archives',
        rationale: 'Award-recognized brand work + industry recognition lists are curated databases of Director-level talent.',
      },
    ],
    sourcingSites: [
      { name: 'Cannes Lions winner / juror archives', why: 'The single densest source for award-recognized senior brand leadership.' },
      { name: 'Adweek + AdAge industry recognition lists', why: 'Brand Genius, 40 Under 40, Marketers of the Year — curated Director-level talent rolls.' },
      { name: 'LinkedIn Recruiter (executive search seat)', why: 'Use Sales Navigator for tenure tracking. Director-level brand hires move every 3-5 years.' },
      { name: 'SXSW Brand + Cannes Lions speaker rolls', why: 'Speakers self-select for externally-facing strategic depth.' },
      { name: 'Top brand agency executives (W+K, R/GA, Mother)', why: 'Creative directors at top agencies lateraling in-house are an established pipeline.' },
      { name: 'AAF Mosaic Council + Multicultural Marketing Forum', why: 'Strongest diversity-aligned senior brand marketing communities.' },
    ],
  },
};

export function getSourcingPlaybook(fixtureId: string): SourcingPlaybook | null {
  return SOURCING_PLAYBOOKS[fixtureId] || null;
}
