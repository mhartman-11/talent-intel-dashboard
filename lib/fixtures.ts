/**
 * Netflix Talent Brief fixtures.
 *
 * 20 hand-curated briefs covering Netflix's most frequent and demanding
 * hiring categories. Used to power demo mode at zero API cost.
 *
 * Comp ranges are directional H1 2026 estimates grounded in public market
 * signals (levels.fyi-style benchmarks, Netflix's 90th-percentile-of-market
 * compensation philosophy). Treat as illustrative for demo purposes.
 */

export interface CultureDimension {
  name: string;
  excellent: string;
  interviewQuestion: string;
  redFlag: string;
}

export interface Brief {
  marketIntelligence: {
    talentSupply: string;
    topCompetitors: string[];
    compensation: string;
    talentPools: string;
    diversityPipeline: string;
    timeToFillRisk: { level: 'Low' | 'Medium' | 'High'; rationale: string };
    sourcingAngles: string[];
  };
  cultureCalibration: {
    dimensions: CultureDimension[];
    keeperTest: string;
    debriefPrompts: string[];
    hireSignalSummary: string;
  };
}

export interface Fixture {
  id: string;
  roleTitle: string;
  level: string;
  fn: string;
  aliases: string[];
  brief: Brief;
}

// --- Helpers to keep fixture authoring compact -----------------------------

const dims = (entries: Array<[string, string, string, string]>): CultureDimension[] =>
  entries.map(([name, excellent, interviewQuestion, redFlag]) => ({
    name,
    excellent,
    interviewQuestion,
    redFlag,
  }));

// ---------------------------------------------------------------------------

export const FIXTURES: Fixture[] = [
  // 1. Staff Machine Learning Engineer · IC5 · Engineering
  {
    id: 'staff-ml-eng-ic5',
    roleTitle: 'Staff Machine Learning Engineer',
    level: 'IC5',
    fn: 'Engineering',
    aliases: ['staff ml engineer', 'staff ai engineer', 'staff machine learning', 'ml engineer staff', 'senior staff ml'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Extremely thin. Estimated 1,200–1,800 engineers globally who genuinely operate at IC5 ML scope (own end-to-end ML systems serving production traffic, ship architecture decisions independently). Concentrated in SF Bay Area, Seattle, NYC, London, Toronto, Tel Aviv. Title inflation is rampant — true Staff-caliber ML engineers represent maybe 15–20% of LinkedIn-titled "Staff ML Engineers."',
        topCompetitors: ['Google DeepMind', 'Anthropic', 'OpenAI', 'Meta AI / Reality Labs', 'Anyscale'],
        compensation: 'Total comp $450K–$650K (base $260K–$320K, equity $180K–$320K vested over 4 years, performance bonus 15–25%). Netflix all-cash variant pushes toward $580K–$700K cash equivalent. Frontier labs (OpenAI, Anthropic) currently outpace at $700K–$1.1M with private-company equity premium.',
        talentPools: 'Strongest feeders: Google (Ads, Search, Brain), Meta (Ads, Reels Ranking, FAIR), Pinterest (Home Feed ML), Spotify (Recommendations), DoorDash (Logistics ML), Stripe (Risk ML), Snap (Ranking). Adjacent: ex-Quantopian/Citadel quants who pivoted to ML, AI PhD program graduates (Stanford, CMU, Berkeley, MIT, Toronto, Mila) 5+ years post-grad.',
        diversityPipeline: 'Black in AI, Latinx in AI, Women in Machine Learning (WiML), Queer in AI, /dev/color (Senior+ tier), AnitaB.org Top Company list. Underweighted source: HBCU CS faculty research labs (Howard, Spelman) with NSF-funded ML programs. Underweighted geo: Toronto MILA cohort, Montreal, Lagos AI Saturdays alumni now at FAANG.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Frontier AI labs are vacuuming this pool with non-cash levers (research credit, compute access, IPO upside). Average time-to-fill in this band: 4–7 months. Netflix wins on scope clarity and impact-per-engineer, but loses bidding wars against pre-IPO equity.',
        },
        sourcingAngles: [
          'Target Pinterest Home Feed, Spotify Discovery, DoorDash Logistics — large-scale ML rec systems with similar problem shape to Netflix recommendations, often felt under-leveraged.',
          'Re-engage ex-Netflix ML alumni (especially Recommendations Algorithm team 2018–2022) now at startups looking for the operating scale they miss.',
          'Run a quarterly "Algorithm Engineering" technical talk series — invite-only, conference-quality content. Use as a softer-than-recruiting funnel for senior IC engagement.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when a 0.3% AUC lift is worth shipping vs. when to invest in a re-architecture. Pushes back on PMs asking for "more accuracy" without naming the business decision it changes.', 'Tell me about a time you killed a model that was performing well offline. What told you to stop?', 'Defends a personal architectural preference long after the data has moved against it. Cannot articulate the business loss function their model optimizes.'],
          ['Communication', 'Translates ML system behavior into language a content exec or finance partner can act on. Writes design docs that surface trade-offs, not just decisions.', 'Walk me through the most important ML decision you made in the last year — explain it as you would to a non-technical SVP.', 'Defaults to ML jargon when pressed. Cannot explain why their model failed without a whiteboard.'],
          ['Curiosity', 'Reads adjacent fields — causal inference, RL, info retrieval — and brings their primitives back. Has opinions on the new model architectures shipped in the last 90 days.', 'What\'s a recent paper or system outside your domain that changed how you think about your own work?', 'Has not engaged with any work outside their immediate stack in the last 12 months. Confuses being busy with being deep.'],
          ['Courage', 'Tells leadership when the metric they\'re celebrating is gameable. Pushes back on a director-level request when the experiment design is wrong, with data not opinion.', 'Tell me about a time you stopped a launch your VP wanted. What was the cost of being wrong?', 'Has never overruled a senior leader\'s technical request. "Just executed what was asked" is a tell — not a virtue.'],
          ['Passion', 'Reads experiment results on Saturday because they want to, not because they were paged. Picks ambiguous problems over polished roadmap tickets.', 'What ML problem do you think about when you\'re not at work?', 'Treats ML as a job ladder rather than a craft. Cannot name a problem they\'d work on without compensation.'],
          ['Selflessness', 'Ships infra that makes the next 10 ML engineers faster. Hands off the model they built so they can take the next hard problem.', 'Tell me about a project where you intentionally made yourself unnecessary. How did it land?', 'Hoards model ownership and dashboard access. Frames "irreplaceability" as a strength.'],
          ['Innovation', 'Designs ML systems that nobody else has shipped at this scale, then writes the post-mortem that becomes the team\'s playbook.', 'Describe an ML approach you tried that hadn\'t been done before — including the version that didn\'t work.', 'Only ships variations on patterns the team has shipped before. Risk-aversion dressed as pragmatism.'],
          ['Inclusion', 'Pulls junior ML engineers into design reviews they\'d normally be excluded from. Notices when a teammate from an underrepresented group is being talked over and corrects in real time.', 'Tell me about a time you noticed a teammate was being undervalued in a technical discussion. What did you do?', 'Treats inclusion as HR\'s job. Has a track record of high IC output but zero junior engineers promoted under their mentorship.'],
          ['Integrity', 'Reports honest model performance, including the regression buried on slice 7. Refuses to ship demo-quality eval as production-quality eval.', 'Describe a time you reported a result that hurt your project\'s standing. What happened next?', 'Cherry-picks eval slices in launch reviews. Smooths over offline/online metric divergence with hand-waving.'],
          ['Impact', 'Owns the metric that lands in the quarterly business review, not the model card metric. Connects ML output to engagement, retention, or content ROI without three-step inference.', 'What\'s the biggest business-level outcome an ML system you owned produced? How do you know it was your system?', 'Cannot connect their model work to a business KPI. Optimizes proxy metrics that don\'t roll up.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their architectural taste was shaping how the recommendation team makes decisions a year from now — not just shipping models, but resetting the bar for what "good" looks like across the org.',
        debriefPrompts: [
          'On a scale of 1–10, how much would the ML org regress in the next 12 months if we passed on this candidate? Anything under 7 is a no-hire.',
          'Who on our team will this person actively raise the bar for in their first six months? Name them.',
          'What\'s the specific decision in the next 90 days where their judgment is materially better than the person currently making it?',
        ],
        hireSignalSummary: 'Hire only if: (1) Clear evidence of owning ML systems end-to-end at >100M-user scale, (2) Demonstrated taste in architectural trade-offs under ambiguous business framing, (3) Track record of saying no to leadership requests they couldn\'t justify. No-hire if: relies on team for system design decisions, treats ML as feature delivery, has not made a controversial call in 18+ months.',
      },
    },
  },

  // 2. Senior Software Engineer · IC4 · Engineering
  {
    id: 'senior-swe-ic4',
    roleTitle: 'Senior Software Engineer',
    level: 'IC4',
    fn: 'Engineering',
    aliases: ['senior software engineer', 'senior swe', 'senior backend engineer', 'senior full stack', 'sr software engineer'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Deep pool — estimated 180,000–230,000 engineers globally with 5–8 years of production experience at IC4-equivalent scope. Netflix\'s bar (production ownership at scale, no QA safety net) cuts that to roughly the top 5–8% — call it 12,000–18,000 hireable. Heavily concentrated in US (40%), India (20%), Europe (18%).',
        topCompetitors: ['Stripe', 'Databricks', 'Snowflake', 'Anthropic (eng-adjacent)', 'Roblox'],
        compensation: 'Total comp $280K–$380K (base $200K–$245K, equity $80K–$150K vested over 4 years, bonus 10–15%). Netflix\'s top-of-market cash equivalent typically lands at $340K–$420K. Pre-IPO competitors (Databricks, Stripe) offer comparable base with private equity upside premium.',
        talentPools: 'Strongest feeders: Stripe, Square, Airbnb, Uber, Lyft, DoorDash, Snap, Pinterest, mid-tier FAANG (post-3-year tenure). Top university CS programs (Berkeley, CMU, Waterloo, GaTech, UIUC) 5+ years post-grad. Bootcamp alumni who have outperformed for 4+ years at known-quality engineering orgs.',
        diversityPipeline: 'AnitaB.org Grace Hopper alumni 4+ years out, /dev/color, Out in Tech (Senior tier), Latinas in Tech, NSBE professional chapters, Code2040 alumni network. Underweighted: HBCU CS graduates 5+ years into industry (Howard, Morehouse, Spelman, NCAT alumni network).',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Pool is wide but Netflix\'s no-QA, ownership-heavy culture screens out a large portion of senior engineers used to safety nets. Average time-to-fill: 8–12 weeks. Expect 50%+ of strong-on-paper candidates to fail the freedom-and-responsibility bar.',
        },
        sourcingAngles: [
          'Target engineers at companies that recently introduced restrictive review processes or shifted to QA-gated deploys (Twitter/X, post-acquisition Slack, late-stage IPO companies) — they\'re actively leaving for autonomy.',
          'Lean into Netflix\'s "no PIPs, generous severance" story for engineers 3–4 years into FAANG who are frustrated by stack ranking but afraid of risk.',
          'Run quarterly "Production Engineering at Netflix" technical content (blog posts, talks at Strange Loop / Velocity) showcasing the autonomy-and-ownership story to engineers who self-select for it.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Picks the boring, proven solution when the team needs reliability; picks the novel one when the boring one is the wrong abstraction. Knows the difference.', 'Tell me about a time you intentionally chose the less interesting technical solution. Why?', 'Justifies tech choices by what\'s trendy or résumé-building. Cannot articulate the trade-off they accepted.'],
          ['Communication', 'Writes PR descriptions and design docs that a teammate in a different timezone can review without a sync. Default to async-first.', 'Walk me through your most-read internal doc from the last year. Why did it land?', 'Communicates by Slack DM instead of documents. Decisions are not discoverable after the fact.'],
          ['Curiosity', 'Has dug into one layer below where they normally operate in the last 6 months — kernel, network, compiler, database internals. Brings it back to their day job.', 'What\'s something you learned this year that\'s outside your immediate stack? How did you use it?', 'Has not voluntarily learned anything outside their immediate work in 12+ months.'],
          ['Courage', 'Pushes back on a PM\'s scope creep with data. Tells a peer their PR has a quality issue without softening it to non-actionable.', 'Tell me about feedback you gave a peer that they didn\'t want to hear. How did it land?', 'Performs niceness at the cost of code quality. Lets bad PRs land to avoid conflict.'],
          ['Passion', 'Has a side interest that informs their engineering — open source contribution, hobby system, deep dive into a specific tech. Not "I grind LeetCode."', 'What do you build or read about when nobody is paying you?', 'Treats engineering as 9-to-5 hours of execution. Cannot name a thing they care about in tech.'],
          ['Selflessness', 'Spends Friday afternoons reviewing PRs from juniors, even when their own sprint is behind. Refactors shared utilities for the team\'s benefit.', 'Tell me about a time you put a teammate\'s output ahead of your own deliverable. What did it cost you?', 'PR review queue is stale. Self-promotes in standups while others go unrecognized.'],
          ['Innovation', 'Has shipped at least one thing in the last year that nobody asked them to build, that the team now depends on.', 'What\'s the most impactful thing you shipped that wasn\'t on your roadmap?', 'Only executes assigned tickets. Frames lack of unprompted work as "discipline."'],
          ['Inclusion', 'Surfaces underrepresented teammates\' contributions in design reviews. Notices interrupting patterns and corrects them in the moment.', 'Tell me about a teammate from an underrepresented background whose career you\'ve actively accelerated. How?', 'Has not mentored anyone outside their demographic in their last 3 years.'],
          ['Integrity', 'Reports bugs in their own code in retros, including the embarrassing ones. Refuses to ship features they don\'t believe are correct.', 'Describe the last time you caught yourself about to take a shortcut that would compromise quality. What did you do?', 'Cuts corners under deadline pressure. "We\'ll fix it later" is a refrain.'],
          ['Impact', 'Can name the user-facing or business outcome of their last 3 projects without prompting. Optimizes for landed value, not shipped tickets.', 'What\'s the business impact of your last project? How do you know?', 'Talks about velocity, sprint completion, story points. Cannot connect to user or business outcomes.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if a year from now they\'re the engineer everyone on the team wants their PR reviewed by — not because they\'re fast, but because their review makes the code better in a way nobody else\'s does.',
        debriefPrompts: [
          'Would you trust this person to ship to production at 4pm on a Friday without supervision? If not, why?',
          'What\'s the most senior engineer on our team this person would actively make better? Be specific.',
          'Where is this candidate weaker than the strongest engineer we\'ve hired in the last 12 months at this level?',
        ],
        hireSignalSummary: 'Hire if: clear evidence of production ownership without QA safety net, comfort with autonomy and ambiguity, history of giving and receiving direct feedback. No-hire if: needs explicit acceptance criteria for every task, frames "shipping fast" as risk, has not shipped anything unprompted in 12+ months.',
      },
    },
  },

  // 3. Staff Software Engineer · IC5 · Engineering
  {
    id: 'staff-swe-ic5',
    roleTitle: 'Staff Software Engineer',
    level: 'IC5',
    fn: 'Engineering',
    aliases: ['staff software engineer', 'staff swe', 'staff backend engineer', 'staff engineer', 'principal engineer ic5'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Tight. Estimated 18,000–25,000 engineers globally who genuinely operate at Staff scope (multi-team technical leadership, owning a system\'s long-term technical direction). Title inflation cuts the addressable pool to maybe 30% of LinkedIn-titled "Staff" engineers — call it 6,000–8,000 hireable.',
        topCompetitors: ['Stripe', 'Databricks', 'Snowflake', 'Cloudflare', 'Anthropic / OpenAI (infra)'],
        compensation: 'Total comp $420K–$580K (base $260K–$310K, equity $140K–$240K, bonus 15–20%). Netflix cash equivalent typically $510K–$640K. Pre-IPO competitors offer comparable base + private equity upside.',
        talentPools: 'Strongest feeders: Stripe (Foundations, Platform), Cloudflare (Workers, R2), Datadog (Infra), Snowflake, Databricks, mid-tenure FAANG Staff (especially Google L6, Meta E6). Open source maintainers of widely-used libraries (Kubernetes contributors, Rust compiler team, etc.) are an under-tapped pool.',
        diversityPipeline: '/dev/color Senior tier, AnitaB.org executive cohort, Out in Tech (Senior+ tier), Black in Tech founders network, NSBE National Conference speaker pool, Latinx Tech Summit alumni. Underweighted: senior engineers from non-coastal hubs (Atlanta, Detroit, Pittsburgh, Toronto) who would relocate for the right scope.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Staff engineers in this band rarely interview without a strong personal reason — they\'re passive candidates. Average time-to-fill: 5–8 months. Netflix\'s autonomy-and-impact story resonates, but lack of management track and high-cash/no-equity-upside structure cuts the pool.',
        },
        sourcingAngles: [
          'Target Staff engineers at companies post-IPO whose equity has stagnated (Snowflake, Datadog, Coinbase) — Netflix\'s all-cash story becomes more attractive when paper equity has flattened.',
          'Engage open source maintainers via conference sponsorships (KubeCon, RustConf, USENIX) — many are at FAANG and would move for autonomy.',
          'Run "Office Hours with Netflix Staff Engineers" — invite-only sessions where current Netflix Staff engineers walk through a real architecture decision. High-signal soft funnel.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows which architectural decisions are reversible vs. irreversible and treats them differently. Doesn\'t over-invest in the wrong abstraction at the wrong level.', 'Tell me about an architectural decision you made that you would unmake today. What changed?', 'Treats all decisions as equally weighty. Cannot articulate which of their past decisions were the high-stakes ones.'],
          ['Communication', 'Writes the one design doc that aligns three teams. Makes the technical trade-offs legible to leadership without dumbing them down.', 'Tell me about a time your writing changed the direction of a multi-team initiative.', 'Cannot reach a non-technical exec without a peer translating. Decisions stay in their head.'],
          ['Curiosity', 'Stays current on adjacent infra (databases, distributed systems papers, language runtimes) and brings novel approaches back. Has a take on the last 3 OSDI/SOSP papers.', 'What\'s a piece of systems research from the last 18 months that you think will land in production at scale within 5 years?', 'Has not engaged with academic or industry research outside their immediate stack. Defends their current stack reflexively.'],
          ['Courage', 'Overrules a director\'s technical instinct with data. Tells a peer Staff engineer their design has a flaw — in writing, with witnesses.', 'Tell me about a time you blocked a senior leader\'s technical decision. What was the political cost?', 'Has never overruled someone more senior. Confuses being collaborative with being deferential.'],
          ['Passion', 'Maintains an active connection to the craft — open source, blog, talks. Their public output is consistent over years, not a single resume bullet.', 'What have you built or written in the last year that wasn\'t a work deliverable?', 'Cannot point to any public artifact that demonstrates depth. The work is just the job.'],
          ['Selflessness', 'Spends 20%+ of their time making other engineers more effective — design review, mentorship, infrastructure they don\'t own. Has no per-engineer credit-chasing pattern.', 'Tell me about a project that succeeded entirely because of someone else\'s work. How did you make space for that?', 'Frames every team success in terms of their own contribution. Credit-grabbing is subtle but present in the interview.'],
          ['Innovation', 'Has shipped something at this scale that nobody else has shipped. The post-mortem became a reference doc for other teams.', 'What\'s the most novel system you\'ve built? What made it novel?', 'Best work is well-executed but not novel. Has not shipped something that meaningfully advanced the team\'s technical state.'],
          ['Inclusion', 'Notices when junior or underrepresented engineers are excluded from architectural discussions and pulls them in. Their design review attendees skew more diverse than the team baseline.', 'Tell me about a junior engineer or underrepresented IC whose technical voice you actively amplified. What did you do?', 'Senior engineer network is homogenous. Cannot name an underrepresented IC they\'ve sponsored.'],
          ['Integrity', 'Documents the trade-offs they accepted, including the ugly ones. Will not let a decision live in implicit knowledge.', 'Describe a decision you made under pressure that you wrote a public retrospective for. Why?', 'Decisions live in their head or in private DMs. No paper trail when they leave.'],
          ['Impact', 'The systems they\'ve owned are still load-bearing 3+ years after they shipped them. Other teams cite their architecture in their own design docs.', 'What system you built is still load-bearing today, and why has it lasted?', 'Best work has been replaced or is being deprecated. Cannot point to durable artifacts.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their architectural taste is being copied by other Staff engineers across the org — when peers cite their design as the reference, not just their team.',
        debriefPrompts: [
          'Three years from now, which of our current Staff engineers would this person have meaningfully changed how they think about systems? Name them.',
          'What\'s the specific multi-quarter technical bet we\'re currently miscalibrating that this person would catch?',
          'Where does this candidate fall short of our strongest current Staff engineer? Is the gap closable in 12 months or structural?',
        ],
        hireSignalSummary: 'Hire if: durable artifacts at scale, demonstrated multi-team technical influence, evidence of overruling senior leaders with data. No-hire if: title inflation without scope, work easily replaceable, prefers polished execution to ambiguous problem framing.',
      },
    },
  },

  // 4. Principal Software Engineer · IC6 · Engineering
  {
    id: 'principal-swe-ic6',
    roleTitle: 'Principal Software Engineer',
    level: 'IC6',
    fn: 'Engineering',
    aliases: ['principal engineer', 'principal swe', 'distinguished engineer', 'senior staff engineer ic6'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Extremely thin. Estimated 2,500–4,000 engineers globally at true IC6 scope (org-level technical leadership, sets technical direction across 3+ Staff engineers\' worlds, externally visible). Most "Principal" titles outside FAANG are inflated; addressable pool is closer to 1,500.',
        topCompetitors: ['Stripe (Principal)', 'Databricks (Distinguished)', 'Snowflake (Principal)', 'Anthropic (Member of Technical Staff)', 'OpenAI (Technical Fellow)'],
        compensation: 'Total comp $570K–$780K (base $310K–$370K, equity $220K–$380K, bonus 20–25%). Netflix cash equivalent $700K–$900K. Frontier AI labs currently outpace at $900K–$1.5M with private equity premium and prestige equity grants.',
        talentPools: 'Strongest feeders: Google L7+, Meta E7+, Apple Senior Principal, AWS Principal Engineer, Netflix internal promotion path. Notable external pool: ex-FAANG Principals who founded startups that didn\'t reach scale and are returning to large-company impact. Open source project leads of foundational infra (Linux kernel, Kubernetes core, key Apache projects).',
        diversityPipeline: 'Very thin at this level. Sources: Black is Tech Conference keynote speakers, AnitaB ABIE Award recipients, Out in Tech leadership cohort, Latinx in Tech advisory network, /dev/color exec tier. Underweighted: international Principal engineers in EU/Israel/Toronto who would relocate.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Principal engineers move once every 5–8 years on average. Most successful hires at this level are 12–18 month relationships built before there\'s an open req. Cold sourcing rarely works; warm referrals and conference-circuit relationships do.',
        },
        sourcingAngles: [
          'Build a 12-month relationship via the conference circuit (USENIX, SREcon, QCon, Strange Loop) — Principal hires are talent investments, not requisition fills.',
          'Engage Netflix\'s own ex-Principal alumni network. Many founded startups in 2020–2022 that are looking for graceful exits.',
          'Sponsor or co-author a research paper with a target candidate. Demonstrates the scope and intellectual respect that pulls Principals away from frontier-lab counterfactuals.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows which long-term technical bets the org needs to make, even when the immediate ROI is unclear. Has been right about a multi-year direction at least once.', 'What\'s a technical bet you made 3+ years ago that you\'re still being proven right about? What did you see that others didn\'t?', 'Cannot point to a long-horizon call they made. Pattern-matches to recent industry trends instead of forming independent views.'],
          ['Communication', 'Their writing sets the technical agenda for an org. A memo from this person changes how 50+ engineers prioritize their quarter.', 'Show me a piece of writing that changed the trajectory of an organization. What was the second-order effect?', 'No writing has visibly shifted org direction. Influence is limited to direct collaborators.'],
          ['Curiosity', 'Engages with research at a level most ICs can\'t — collaborates with academic labs, reviews papers, shapes the field.', 'What\'s a research question you\'re currently chasing that doesn\'t have an obvious product application?', 'Has stopped engaging with new ideas. Operates from a fixed worldview formed years ago.'],
          ['Courage', 'Will publicly disagree with the CTO in a town hall when the facts warrant it. Has paid a political cost for being right and would do it again.', 'Tell me about a time you publicly disagreed with the most senior technical leader in your org. What happened?', 'Has built a long career without ever taking a politically costly technical position.'],
          ['Passion', 'Their public-facing work (talks, papers, blog) demonstrates sustained intellectual investment over a decade. The interview gets technically deep fast.', 'What technical problem have you been thinking about for the longest stretch of your career? Why does it persist?', 'Cannot point to a sustained intellectual thread across their career. Each role looks like a fresh start.'],
          ['Selflessness', 'Has actively created the conditions for 3+ engineers to be promoted to Staff/Senior Staff under their sphere of influence. They are visibly on those engineers\' performance docs.', 'Name three engineers whose career you\'ve materially advanced. What was your specific contribution?', 'Career has been a solo flight. Cannot name engineers whose promotions they directly enabled.'],
          ['Innovation', 'Their work has changed how other companies build similar systems. Other engineering orgs cite their architecture as the reference implementation.', 'What\'s something you\'ve built that meaningfully influenced how this problem is solved at other companies? Be specific.', 'Their best work is well-executed but indistinguishable from what other Principals at peer companies have shipped.'],
          ['Inclusion', 'Visibly sponsors underrepresented engineers into Staff/Principal roles. Their direct technical mentorship pool demographics differ from the team baseline.', 'Tell me about an underrepresented engineer whose career path you altered. What was your specific intervention?', 'Influence circle is demographically homogenous. Has not actively used political capital to advance an underrepresented IC.'],
          ['Integrity', 'Will publicly retract a position when proven wrong, including positions they were known for. Their reputation rests on calibration, not consistency.', 'Tell me about a strongly-held technical position you publicly reversed. What did it cost you?', 'Cannot point to a public reversal. Either has never been wrong or has not publicly admitted it.'],
          ['Impact', 'Their work is load-bearing for an industry, not just a company. Open source contribution, foundational paper, system pattern that others have copied.', 'What artifact of yours has the longest half-life? What\'s still load-bearing 5+ years later?', 'Cannot point to externally-visible impact. Influence is purely internal and not durable past their tenure.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if the Netflix engineering org would visibly regress without them — if their absence would show up in our roadmap, not just our headcount.',
        debriefPrompts: [
          'If this person left Netflix in 18 months, what specifically would not get built? Be concrete.',
          'Which currently-disputed multi-year technical direction would this person\'s judgment resolve?',
          'Compared to our last Principal hire, is this person stronger, equivalent, or weaker — and on what dimension specifically?',
        ],
        hireSignalSummary: 'Hire only if: externally-visible body of work, durable artifacts that have shaped industry practice, documented history of being right about long-horizon bets, active sponsorship of underrepresented ICs. No-hire if: scope is title without org-level impact, no public-facing technical thought leadership, career trajectory is sideways at FAANG without distinguishing artifacts.',
      },
    },
  },

  // 5. Senior Machine Learning Engineer · IC4 · Engineering
  {
    id: 'senior-ml-eng-ic4',
    roleTitle: 'Senior Machine Learning Engineer',
    level: 'IC4',
    fn: 'Engineering',
    aliases: ['senior ml engineer', 'sr ml engineer', 'senior ai engineer', 'machine learning engineer ic4'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate but heavily filtered. Estimated 15,000–22,000 engineers globally who can independently own an ML feature end-to-end (data pipeline, training, eval, deployment, monitoring) at production scale. Most "ML Engineer" titles are 70% data engineering — true full-stack ML engineers are scarcer.',
        topCompetitors: ['Pinterest', 'Spotify', 'DoorDash', 'Stripe (Risk ML)', 'Roblox'],
        compensation: 'Total comp $300K–$420K (base $215K–$255K, equity $90K–$165K, bonus 12–18%). Netflix cash equivalent $370K–$460K. Pre-IPO ML-focused startups (Anthropic IC4-equivalent, OpenAI MTS) push to $500K–$650K with private equity premium.',
        talentPools: 'Strongest feeders: Pinterest Ads ML, Spotify Personalization, DoorDash Logistics, Stripe Radar, Snap Ranking, Uber ATG (post-spin), Pinterest Home Feed. Top ML graduate programs (Stanford, CMU, Berkeley, MIT, UW, Toronto) 2–4 years post-graduation. Kaggle Grandmasters with industry experience.',
        diversityPipeline: 'Women in ML (WiML) NeurIPS sponsorship cohort, Black in AI workshop attendees, Latinx in AI, AI4ALL alumni, Howard University ML faculty network. Underweighted: international ML talent at Toronto (Mila), London (DeepMind ecosystem), Tel Aviv.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'ML talent at IC4 is being aggressively recruited by every consumer tech company and every frontier AI lab. Time-to-fill: 3–5 months. Netflix\'s recommendation systems carry historical prestige but no longer represent the frontier of the field, which complicates the pitch.',
        },
        sourcingAngles: [
          'Re-pitch Netflix\'s recommendation system as the most studied production ML system in the industry — for engineers who want to ship at the scale the textbooks are written about, this is still the strongest brand.',
          'Target ML engineers at companies whose ML roadmap has stalled (post-acquisition or post-pivot orgs) — Twitch ML, ex-Spotify Discovery Weekly, etc.',
          'Run a quarterly "Recommendations at Netflix" technical podcast — current ICs interviewing current ICs. Builds the soft funnel.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when to ship the simpler model that\'s easier to debug vs. the complex one with better offline metrics. Has killed their own model when it didn\'t move online metrics.', 'Tell me about a model you trained that you decided not to ship. What was the signal?', 'Optimizes for offline metrics without checking online correlation. Cannot articulate the business decision their model serves.'],
          ['Communication', 'Explains model behavior to a content programmer or PM in their language. Writes experiment readouts that lead to decisions, not just observations.', 'Walk me through the last experiment readout you wrote — what was the decision it produced?', 'Defaults to ML jargon. Experiment readouts are observation-heavy, decision-light.'],
          ['Curiosity', 'Reads outside their immediate domain — causal inference, RL, NLP — and brings primitives back. Has tried a new model architecture in the last 90 days.', 'What\'s a paper or system from outside recommendations that\'s changed how you think about your work?', 'Has not engaged with anything outside their immediate model in 12 months. Defends their current approach reflexively.'],
          ['Courage', 'Pushes back on a PM\'s metric definition when it\'s gameable. Will tell a Staff ML engineer their design is wrong.', 'Tell me about a time you challenged a metric your team was celebrating. What happened?', 'Accepts metric definitions without challenge. Defers to senior ML opinions even when the data contradicts them.'],
          ['Passion', 'Trains side models for fun. Has at least one Kaggle, paper, or personal ML project they\'re actively iterating on.', 'What ML problem do you work on when you\'re not at work?', 'Cannot name a problem they\'d work on without compensation. ML is purely a job ladder.'],
          ['Selflessness', 'Builds eval infrastructure that the next 5 ML engineers will use. Documents their pipeline so it\'s not a single-owner system.', 'Tell me about infrastructure you built that benefited people other than yourself. What was the trade-off?', 'Builds bespoke pipelines that only they can run. Documentation is an afterthought.'],
          ['Innovation', 'Has shipped a model that hadn\'t been tried at their company before. Wrote the post-mortem regardless of outcome.', 'What\'s the most novel thing you\'ve tried in your model work — including the version that failed?', 'Replicates known patterns. Hasn\'t tried anything that didn\'t have an obvious answer.'],
          ['Inclusion', 'Notices when an underrepresented junior is being talked over in model design reviews. Pulls them in deliberately.', 'Tell me about a time you noticed someone was being undervalued in an ML design discussion. What did you do?', 'Treats inclusion as someone else\'s problem. ML team meetings show the same 3 voices dominating.'],
          ['Integrity', 'Reports honest eval numbers including the regression slice. Refuses to ship if online experiment is underpowered.', 'Describe a time you reported a result that hurt your team\'s narrative. What happened?', 'Smooths over bad eval slices. Treats "we\'ll fix it post-launch" as acceptable.'],
          ['Impact', 'Owns the connection between their model and the business metric in the executive review. Doesn\'t hand off the narrative to PMs.', 'What business metric did your last model move, and how do you know it was your model?', 'Cannot connect their work to a business KPI. Optimizes proxies without checking they roll up.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their model has shipped a real engagement lift in their first year, and if other ML engineers on the team are picking up their experimentation patterns.',
        debriefPrompts: [
          'In year one, what experiment do we expect this person to run that no one currently on the team would have proposed?',
          'How does this candidate\'s model intuition compare to our strongest current IC4 ML engineer\'s? Be specific.',
          'What\'s the failure mode where this person plateaus at IC4 instead of growing to IC5 in 2–3 years?',
        ],
        hireSignalSummary: 'Hire if: end-to-end ML ownership in production, demonstrated taste in eval and metric design, evidence of having killed their own work when warranted. No-hire if: ML work has always been gated by Staff+ approval, optimizes purely for offline metrics, cannot articulate business decision their model serves.',
      },
    },
  },

  // 6. Engineering Manager · Manager · Engineering
  {
    id: 'eng-manager',
    roleTitle: 'Engineering Manager',
    level: 'Manager',
    fn: 'Engineering',
    aliases: ['engineering manager', 'eng manager', 'software engineering manager', 'team lead manager', 'em'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Wide but heavily filtered. Estimated 40,000–60,000 engineering managers in the US who have managed teams of 5–10 engineers for 3+ years. Netflix\'s player-coach (no IC-to-manager-only transitions, expect technical depth) cuts the pool sharply — addressable: 8,000–12,000.',
        topCompetitors: ['Stripe', 'Airbnb', 'DoorDash', 'Snowflake', 'Roblox'],
        compensation: 'Total comp $400K–$560K (base $260K–$310K, equity $130K–$230K, bonus 15–20%). Netflix cash equivalent $490K–$610K. Stripe and Databricks comparable in cash + private equity upside.',
        talentPools: 'Strongest feeders: Stripe, Airbnb, Uber, DoorDash, Pinterest, Snap engineering management. Internal promotion path from Netflix\'s own Staff ICs. Notable: ex-FAANG engineering managers (Google L7, Meta M2) who have managed through reorgs and want autonomy.',
        diversityPipeline: '/dev/color Senior+ tier, AnitaB.org Senior Leader cohort, Black Engineering Managers (BEM) network, Latinx Engineering Leaders, Out in Tech Senior tier. Strong underweighted source: engineering managers at non-coastal tech hubs (Atlanta, Pittsburgh, Toronto) who would consider relocation.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Strong-on-paper EMs are plentiful but Netflix\'s "freedom and responsibility" model screens out managers who depend on process. Time-to-fill: 3–5 months. Expect 60%+ of finalists to fail on Keeper Test rigor.',
        },
        sourcingAngles: [
          'Target EMs at companies that recently introduced PIPs or stack ranking (post-restructuring orgs) — Netflix\'s no-PIP-generous-severance story is genuinely differentiating.',
          'Pursue ex-Netflix EMs who left for startup leadership roles and are now looking for Netflix-scale impact again.',
          'Run quarterly "Engineering Management at Netflix" content (podcast, blog) showcasing the player-coach model — strong soft-funnel for candidates who self-select for this culture.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when to escalate a personnel decision vs. when to handle it locally. Doesn\'t over-rotate to consensus when the data is clear.', 'Tell me about a personnel decision you made over a peer manager\'s objection. What was the trade-off?', 'Defers personnel decisions to skip-level. Cannot articulate the framework they use for performance calls.'],
          ['Communication', 'Their 1:1s produce decisions and clarity, not just feedback. Their team knows where they stand without asking.', 'Walk me through how you ran 1:1s in your last role. What was the recurring shape?', '1:1s are status updates. Direct reports don\'t know where they stand on performance.'],
          ['Curiosity', 'Engages with the technical decisions their team is making, not just the process around them. Reviews their team\'s designs critically.', 'When was the last time you pushed back on a technical decision your team was making? What was your specific argument?', 'Has fully delegated technical depth. Reviews their team\'s decisions only at the milestone level.'],
          ['Courage', 'Will fire a high-performing engineer who isn\'t culture-fit. Will hire someone who unsettles the team if they\'re the right call.', 'Tell me about the last time you applied the Keeper Test to a high-performer. What did you decide?', 'Has never managed out a top performer. Has never hired someone who challenged team comfort.'],
          ['Passion', 'Engages with the craft of management as a craft — reads, talks to peers, iterates on their playbook. Has a written management philosophy.', 'What\'s the most recent thing you changed about how you manage? What prompted it?', 'Treats management as a destination, not a craft. Has not changed their approach in 2+ years.'],
          ['Selflessness', 'Builds successors. Their team\'s strongest IC could replace them within 12 months if needed.', 'Who on your last team could have replaced you if you\'d been hit by a bus? How did you make that true?', 'Centralizes information and decisions. No clear successor on their team.'],
          ['Innovation', 'Has built a team operating model that other teams adopted. Their approach to standups, planning, or reviews has spread.', 'What management or team practice have you built that other teams adopted? What was the mechanism?', 'Runs vanilla Scrum/Agile. No team-level innovation in their last 2 years.'],
          ['Inclusion', 'Their team\'s promotion track demographics differ from their hiring demographics — they\'re actively advancing underrepresented engineers.', 'What\'s the demographic shape of the engineers you\'ve promoted in the last 24 months? How does that compare to who you\'ve hired?', 'Promotions skew toward demographic majority. Cannot point to a deliberate inclusion mechanism in their hiring or promotion process.'],
          ['Integrity', 'Tells their team the unvarnished truth about a reorg, a missed quarter, a decision they disagreed with. Doesn\'t corporate-speak hard news.', 'Tell me about the hardest message you ever delivered to your team. What did you say verbatim?', 'Filters hard news. Has a corporate-comms reflex that makes their team distrust their candor.'],
          ['Impact', 'Their team\'s output is measurably better in the dimensions that matter — velocity, quality, retention, growth — at the end of their tenure than the beginning.', 'What metric materially improved during your time leading your last team? How do you know it was you?', 'Cannot point to a specific dimension where their team got measurably better under their leadership.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their team became visibly the strongest engineering team in the org within 18 months — not by hiring stars, but by raising the bar for everyone already there.',
        debriefPrompts: [
          'Would this person\'s arrival lead to a top performer on our current team leaving — and is that the right outcome?',
          'What\'s the specific dysfunction on the team this person is inheriting that they\'re uniquely equipped to fix?',
          'On the Keeper Test: would you fight hard to keep this person 18 months in? What would have to be true?',
        ],
        hireSignalSummary: 'Hire if: technical depth maintained, evidence of managing out underperformers and hiring uncomfortable talent, demonstrated bar-raising on team output. No-hire if: process-heavy management style, no track record of hard personnel calls, technical decisions fully delegated.',
      },
    },
  },

  // 7. Senior Engineering Manager · Senior Manager · Engineering
  {
    id: 'senior-eng-manager',
    roleTitle: 'Senior Engineering Manager',
    level: 'Senior Manager',
    fn: 'Engineering',
    aliases: ['senior engineering manager', 'sr eng manager', 'manager of managers', 'group engineering manager'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Tight. Estimated 8,000–12,000 in the US managing 3+ managers and 25–50 engineers with 5+ years of management depth. Netflix\'s context (deep technical bench, high autonomy, no IC backstop) cuts the addressable pool to maybe 30%.',
        topCompetitors: ['Stripe (Engineering Lead)', 'Airbnb', 'DoorDash', 'Databricks', 'Anthropic (Engineering Manager II)'],
        compensation: 'Total comp $530K–$720K (base $310K–$370K, equity $200K–$340K, bonus 18–22%). Netflix cash equivalent $640K–$800K.',
        talentPools: 'Strongest feeders: Stripe Engineering Leads, Airbnb Senior EMs, DoorDash Senior EMs, FAANG manager-of-managers (Google L7, Meta M2/M3). Internal promotion path from current Netflix EMs.',
        diversityPipeline: 'Black Engineering Leaders Network, AnitaB.org Senior Leader cohort, Out in Tech Executive tier, Latinx in Tech Executive Council. Underweighted: ex-startup-CTO managers who scaled to 50+ engineers and want to return to a top operator role.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'This level of management talent moves rarely and often for a specific business problem they want to own. Time-to-fill: 5–8 months. Most successful hires are 12-month relationships built before there\'s an open req.',
        },
        sourcingAngles: [
          'Pursue Senior EMs at companies undergoing reorganization (recent post-IPO companies, major restructurings) — top management talent leaves these orgs in waves.',
          'Engage ex-startup CTOs/VPs whose companies didn\'t reach scale; they want operator-level impact again at Netflix scale.',
          'Build relationships at QCon, LeadDev, Velocity. This level of hire is a multi-conference-cycle pursuit.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Makes the difficult org-design call that everyone on their level avoided. Knows when to consolidate teams vs. when to split.', 'Tell me about an org design call you made that was politically expensive. What told you it was right?', 'Avoids org design changes. Defers structural decisions to skip-level.'],
          ['Communication', 'Their written communication shapes how the broader engineering org thinks about a problem. They write the memo that lands.', 'Show me a written artifact that changed direction for an org-level initiative. What was the second-order effect?', 'Communications are operational and tactical. Has not shifted strategic direction in writing.'],
          ['Curiosity', 'Engages with the technical decisions across their org, not just their immediate teams. Has informed opinions on adjacent infra they don\'t own.', 'What\'s a technical area outside your org that you\'ve deliberately developed depth in over the last year? Why?', 'Has narrowed scope to operational management. No active intellectual investment in technical depth.'],
          ['Courage', 'Has fired a manager who reported to them. Has promoted someone over the objections of their peer managers when the data warranted.', 'Tell me about a personnel decision involving a manager-level report that was contested. What was your argument?', 'Has never fired a manager. Treats personnel decisions about managers as their peer\'s problem.'],
          ['Passion', 'Treats engineering leadership as a craft. Has a written leadership philosophy that has evolved over years.', 'How has your leadership philosophy changed in the last 5 years? Be specific about what moved you.', 'Static leadership style. Cannot point to a specific belief they\'ve revised.'],
          ['Selflessness', 'Builds the bench. Two of their direct reports could be promoted to Senior Manager in the next 18 months because of how they\'ve been developed.', 'Name the next two leaders ready for promotion under you. What\'s the specific work you\'ve done to make them ready?', 'No clear next-tier leaders ready. Has not actively developed successors.'],
          ['Innovation', 'Has redesigned how a multi-team initiative runs in a way that other parts of the org adopted. Operating models, planning structures, decision rights — they\'ve built something durable.', 'What\'s an operating model or process you\'ve built that scaled beyond your org? What was the mechanism?', 'Inherited and ran existing operating models. No durable artifacts that scaled past their immediate reports.'],
          ['Inclusion', 'Their org\'s promotion velocity for underrepresented engineers exceeds the company baseline. They can name the mechanism.', 'What\'s the demographic breakdown of promotions in your org over the last 24 months? How does that compare to your hiring intake?', 'Cannot speak to specific demographics or the mechanisms they use. Treats inclusion as HR\'s responsibility.'],
          ['Integrity', 'Has refused to execute on a leadership directive they disagreed with — and either changed it or accepted the consequence. Doesn\'t passive-aggressively comply.', 'Tell me about a directive from your VP or above that you pushed back on hard. What happened?', 'Executes whatever leadership decides. Cannot point to a leadership-level disagreement they actively engaged with.'],
          ['Impact', 'Their org shipped something materially different under their leadership than it would have under a status-quo manager. They can name what.', 'What did your org ship under your leadership that wouldn\'t have happened with a different leader? Be specific.', 'Cannot articulate a counterfactual. Improvements are incremental and hard to attribute.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their org became the model other engineering leaders in the company copy from — where Senior Managers across functions reach out to ask how they\'re running their teams.',
        debriefPrompts: [
          'Which currently-stuck multi-team initiative would unblock with this leader at the helm?',
          'What\'s the specific failure mode where this person regresses to the old org\'s playbook instead of building Netflix-native operating models?',
          'Compared to our strongest current Senior EM, where is this candidate stronger and weaker?',
        ],
        hireSignalSummary: 'Hire if: track record of hard personnel calls at the manager level, demonstrated org design judgment, evidence of building durable operating models. No-hire if: manages by inherited process, no public artifacts of leadership thinking, has not actively developed manager-level successors.',
      },
    },
  },

  // 8. Senior Data Scientist · IC5 · Data Science
  {
    id: 'senior-data-scientist-ic5',
    roleTitle: 'Senior Data Scientist',
    level: 'IC5',
    fn: 'Data Science',
    aliases: ['senior data scientist', 'staff data scientist', 'sr data scientist', 'lead data scientist', 'principal data scientist ic5'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate but heavily varied. Estimated 12,000–18,000 senior data scientists globally with strong causal inference + experimentation chops at consumer tech scale. The Netflix bar (own experimentation strategy for a product area, not just analyze experiments others designed) cuts the pool to roughly 25%.',
        topCompetitors: ['Spotify', 'Airbnb', 'DoorDash', 'Pinterest', 'Snap'],
        compensation: 'Total comp $380K–$510K (base $230K–$280K, equity $120K–$190K, bonus 12–18%). Netflix cash equivalent $460K–$580K.',
        talentPools: 'Strongest feeders: Spotify Experimentation, Airbnb Data Science (Marketplace), DoorDash Experimentation, Pinterest Growth DS, Microsoft Experimentation Platform, ex-Google Ads DS. PhD programs in econometrics, statistics, computational social science (Stanford, Berkeley, MIT Sloan, Wharton) 3–5 years post-PhD.',
        diversityPipeline: 'Women in Data Science (WiDS) Stanford alumni, Data Science for Social Good (DSSG) fellowship alumni, AnitaB.org data leadership tier, Black in Data, Latinas in Data, R-Ladies senior cohort. Underweighted: senior DS at policy/economics labs (Federal Reserve research, OpenAI Policy, RAND) who would consider a product DS role.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Pool exists but Netflix\'s experimentation rigor (own the analysis design end-to-end, no separate analytics team) screens out a large portion of senior DS who depend on data engineering or research engineering support. Time-to-fill: 3–5 months.',
        },
        sourcingAngles: [
          'Target experimentation-focused DS at companies whose experiment volume has declined (post-growth-stage companies pulling back) — they\'re hungry to be at scale again.',
          'Engage senior DS in non-tech domains (healthcare, fintech) with strong causal inference backgrounds — Netflix\'s problem shape is more like applied econometrics than ML.',
          'Sponsor or host CODE@MIT, ACIC (American Causal Inference Conference) — high-density signal for the specific archetype Netflix needs.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when an experiment is worth running vs. when the cost of the experiment exceeds the value of the answer. Has killed proposed experiments based on power analysis alone.', 'Tell me about an experiment you talked your team out of running. What was the calculation?', 'Runs every experiment that\'s proposed. Cannot articulate when an experiment is not worth its opportunity cost.'],
          ['Communication', 'Their experiment readouts produce decisions. PMs and execs cite their analysis as the basis for product changes.', 'Walk me through the last experiment readout that changed a product decision. What was the framing that landed?', 'Readouts are statistics-heavy and decision-light. Stakeholders consistently ask "so what?" after reading.'],
          ['Curiosity', 'Reads outside their immediate domain — econometrics journals, behavioral economics, RL literature. Brings novel methods back to product problems.', 'What\'s a method from outside your domain that you\'ve applied to a Netflix-like problem? What did you learn?', 'Uses the same statistical toolbox they learned in grad school. Has not adopted a new method in 2+ years.'],
          ['Courage', 'Tells a VP their pet metric is gameable, with the math to back it. Refuses to run an underpowered experiment to placate leadership.', 'Describe a time you blocked a senior leader\'s preferred experiment. What was the math?', 'Capitulates to leadership pressure. Has not refused an analysis request in their last 2 years.'],
          ['Passion', 'Engages with causal inference and experimentation as a craft. Has published, presented, or maintained an active learning practice.', 'What\'s the most recent thing you taught yourself about experimentation that wasn\'t job-mandated?', 'Has stopped learning. Cannot name a methodological development in the last 18 months they engaged with.'],
          ['Selflessness', 'Builds analysis infrastructure that the next 5 DSs use. Documents their methods so the analysis isn\'t single-owner.', 'Tell me about analysis infrastructure you built that benefited the team beyond your projects. What was the trade-off?', 'Bespoke notebooks. Analysis lives in their head and their personal scripts.'],
          ['Innovation', 'Has applied a novel statistical method to a Netflix-like problem before. Wrote the post-mortem regardless of outcome.', 'What\'s a methodological choice you made that the team hadn\'t made before? What was the rationale?', 'Default methods only. Has not introduced a new technique to their team.'],
          ['Inclusion', 'Notices when underrepresented DS team members are being passed over in design reviews. Builds review structures that surface their voices.', 'Tell me about an underrepresented DS whose work you actively elevated. What was your specific contribution?', 'DS team discussion is dominated by the same 3 voices. Has not actively addressed the pattern.'],
          ['Integrity', 'Reports honest results including the inconvenient slices. Refuses to call something statistically significant when it isn\'t.', 'Describe a time you reported an experiment result that hurt your team\'s narrative. What happened?', 'Smooths over inconvenient slices. Treats "statistical significance" loosely under pressure.'],
          ['Impact', 'Their analyses move product roadmap, not just observation. Can name the specific product decisions their experiments produced in the last year.', 'What product decisions in the last year happened because of your analysis? Be specific.', 'Cannot connect their analysis to product decisions. Outputs land in slide decks and don\'t move forward.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their experimentation rigor was visibly raising the bar across product teams — when other Senior DSs are quoting their methodology in their own readouts.',
        debriefPrompts: [
          'What specific experiment have we been running suboptimally that this person would have re-designed?',
          'Where is this candidate stronger than our current strongest Senior DS in the same product area?',
          'What\'s the failure mode where this person plateaus at IC5 instead of growing to Staff in 2–3 years?',
        ],
        hireSignalSummary: 'Hire if: end-to-end experimentation ownership, demonstrated rigor in causal inference, history of producing analyses that moved product. No-hire if: dependent on data engineers or research engineers for analysis design, treats experimentation as ticket execution, cannot point to product decisions their analysis produced.',
      },
    },
  },

  // 9. Staff Research Scientist · IC6 · Data Science
  {
    id: 'staff-research-scientist-ic6',
    roleTitle: 'Staff Research Scientist',
    level: 'IC6',
    fn: 'Data Science',
    aliases: ['staff research scientist', 'senior research scientist', 'principal research scientist', 'applied research scientist'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Thin. Estimated 3,000–5,000 globally at this level (PhD + 6–10 years of applied research with production impact). The Netflix bar (research that ships in production within 6 months, not pure paper output) is sharper than academic-track research scientist roles.',
        topCompetitors: ['Google Research', 'Meta FAIR', 'Microsoft Research', 'Anthropic', 'OpenAI'],
        compensation: 'Total comp $510K–$720K (base $300K–$360K, equity $190K–$330K, bonus 18–25%). Netflix cash equivalent $620K–$800K. Frontier AI labs outpace at $700K–$1.4M with private equity premium.',
        talentPools: 'Strongest feeders: Google Research Brain alumni, Meta FAIR, MSR, top university faculty considering industry (Stanford, CMU, MIT, Berkeley, Toronto, Princeton). Adjacent: ex-quant researchers from Two Sigma, Citadel, Renaissance who want consumer impact.',
        diversityPipeline: 'Women in Machine Learning leadership, Black in AI Senior tier, Latinx in AI faculty network, AI4ALL advisory board. Underweighted: senior research scientists at international labs (Mila Montreal, DeepMind London, Inria France, ETH Zurich) who would relocate.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Research scientists at IC6 are heavily recruited by frontier AI labs. Time-to-fill: 6–12 months. Netflix\'s pitch (applied research with real-world deployment at scale) resonates with researchers tired of pure paper output, but loses to frontier-lab equity premium.',
        },
        sourcingAngles: [
          'Target research scientists 7+ years out of PhD who are noticing their work is no longer landing in production. Netflix\'s "research ships in 6 months or it doesn\'t exist" framing is genuinely differentiating.',
          'Engage senior researchers at frontier labs whose IPO timeline keeps slipping — Netflix\'s liquid comp story matters when paper equity feels distant.',
          'Sponsor RecSys, KDD, NeurIPS application track sessions where Netflix is intellectually visible. Recruit at the after-parties, not the booth.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Picks research problems whose answers materially change product decisions. Doesn\'t chase publishable results that don\'t ship.', 'Tell me about a research question you decided not to pursue, even though it was publishable. What was the calculus?', 'Pursues research for citation potential. Cannot connect research output to product decisions.'],
          ['Communication', 'Translates research findings into product-actionable language. Their research memos drive engineering and product roadmap discussions.', 'Show me a research memo that changed a product roadmap. What was the framing?', 'Writes for academic audience. Findings don\'t translate to product or engineering decisions.'],
          ['Curiosity', 'Engages across subfields — RL, causal inference, info retrieval, computational social science. Reviews papers from outside their direct focus area.', 'What\'s a subfield outside your direct expertise that you\'ve developed depth in over the last 18 months? Why?', 'Has narrowed to a single subfield. Cannot speak technically about adjacent areas.'],
          ['Courage', 'Publishes negative results when they matter. Tells a director that a research direction isn\'t worth pursuing, even when the director is invested.', 'Tell me about a research direction you ended over leadership objection. What was the basis?', 'Pursues research directions to please leadership. Has not killed a project despite weak signal.'],
          ['Passion', 'Demonstrated through sustained intellectual investment over a decade — papers, talks, blog. The work isn\'t a career rung.', 'What research question have you been thinking about for the longest stretch of your career? Why does it persist?', 'Career is a sequence of unrelated projects. No sustained intellectual thread.'],
          ['Selflessness', 'Mentors junior researchers across teams. Has authored at least one paper with an underrepresented junior researcher as first author.', 'Name a junior researcher whose career you materially shaped. What was your specific contribution?', 'First-authors all important papers. Cannot point to mentees whose careers visibly advanced.'],
          ['Innovation', 'Their work has changed how a research community frames a problem. Other research scientists cite their work as the reference.', 'What\'s a research contribution of yours that meaningfully changed how the field frames a problem? Be specific.', 'Solid publication record but no genre-shifting contributions. Work is incremental on established lines.'],
          ['Inclusion', 'Reviews papers from underrepresented authors with the same rigor as peers. Actively brings underrepresented voices into research program decisions.', 'Tell me about an underrepresented researcher whose work you elevated within your organization. How?', 'Research circle is demographically homogenous. Cannot name an underrepresented researcher they\'ve actively sponsored.'],
          ['Integrity', 'Reports honest research findings including reproducibility failures. Has publicly retracted or corrected work when warranted.', 'Tell me about a research finding you publicly corrected. What did it cost you reputationally?', 'No public corrections. Either has never been wrong or has not publicly acknowledged errors.'],
          ['Impact', 'Their research has shipped in production at scale. They can point to specific production systems that incorporate their findings.', 'What\'s the most impactful research you\'ve done that\'s currently in production at scale? How do you know it\'s yours?', 'Research has not consistently shipped. Findings live in papers and slide decks but don\'t move to production.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their research is actively shaping how three or more product teams at Netflix make decisions — when their memos are referenced in roadmap planning, not just published.',
        debriefPrompts: [
          'What specific product decision in the next year would this person\'s research materially improve?',
          'Compared to our strongest current Research Scientist, where is this candidate stronger and weaker?',
          'What\'s the failure mode where this person reverts to academic incentives instead of Netflix product impact?',
        ],
        hireSignalSummary: 'Hire if: research consistently ships in production, demonstrated taste in problem selection, evidence of cross-team intellectual influence. No-hire if: optimizes for publications over deployed impact, research is in pure paper output with no production link, no track record of advancing underrepresented researchers.',
      },
    },
  },

  // 10. Senior Product Manager · IC5 · Product
  {
    id: 'senior-product-manager-ic5',
    roleTitle: 'Senior Product Manager',
    level: 'IC5',
    fn: 'Product',
    aliases: ['senior product manager', 'sr product manager', 'staff product manager', 'lead product manager', 'spm'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Wide pool but the Netflix bar (zero-decision-authority-by-default, must earn influence) screens out most. Estimated 20,000–28,000 Senior PMs in consumer tech globally; addressable for Netflix is roughly 15%.',
        topCompetitors: ['Spotify', 'Airbnb', 'DoorDash', 'Pinterest', 'Snap'],
        compensation: 'Total comp $360K–$490K (base $235K–$280K, equity $100K–$170K, bonus 15–20%). Netflix cash equivalent $440K–$560K.',
        talentPools: 'Strongest feeders: Spotify Product, Airbnb Product, DoorDash Consumer Product, Pinterest Growth, Snap Discover, ex-Stripe consumer-facing PMs. Notable: ex-FAANG PMs (Google L6, Meta IC6) who left during reorganizations and want autonomy.',
        diversityPipeline: 'Black Product Managers Network, Latinx Pros (Latinx PMs), Women In Product Senior cohort, Out in Product, Reboot Representation alumni. Underweighted: PMs at adjacent industries (gaming, streaming audio, telehealth) with similar consumer subscription problem shape.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Strong PMs are plentiful but Netflix\'s "no Jira tickets, no PRDs, write strategy memos" culture screens out most who depend on process. Time-to-fill: 3–5 months. Expect 60%+ of finalists to fail on writing samples.',
        },
        sourcingAngles: [
          'Target PMs at companies that recently introduced heavy product process (post-acquisition, late-stage IPO companies) — Netflix\'s memo culture is differentiating.',
          'Engage ex-Netflix PMs who left for startup roles and want Netflix-scale impact again.',
          'Run a quarterly "How Netflix PMs Think" content series — long-form writing from current PMs. Strong soft funnel for self-selecting candidates.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when a feature is worth A/B testing vs. when the team should just ship and learn. Doesn\'t default to "let\'s run a test" for every decision.', 'Tell me about a decision you made without running a test, when the test would have been the default. What was your reasoning?', 'Defaults to experimentation for decisions that don\'t merit it. Cannot articulate when a test\'s cost exceeds its information value.'],
          ['Communication', 'Their strategy memos move engineering and design teams without needing meetings. Writing is dense, specific, and decision-forcing.', 'Show me a memo or document you wrote that aligned multiple teams without a kickoff meeting. What made it land?', 'Communicates via meetings and slides. Cannot point to a written artifact that drove alignment.'],
          ['Curiosity', 'Reads outside product — economics, behavioral science, design theory, recommendation systems. Brings cross-domain frameworks back to product problems.', 'What\'s a concept from outside product management that\'s changed how you frame product decisions? Be specific.', 'Reads product blogs and product books only. Has not absorbed a non-PM framework in 12+ months.'],
          ['Courage', 'Tells engineering their estimate is wrong. Tells design their approach won\'t test well. Pushes back on a VP\'s product instinct when the data says otherwise.', 'Tell me about a time you blocked a VP-level product decision. What was the data and what was the cost?', 'Has never overruled a senior leader. Confuses being collaborative with being deferential.'],
          ['Passion', 'Engages with the product they work on as a user, not just a PM. Notices things about the user experience that nobody else noticed.', 'What\'s the most recent thing you noticed about your own product that the team had missed? How did you spot it?', 'Cannot speak to specific UX details of their own product. Treats it as a deliverable, not a craft.'],
          ['Selflessness', 'Lets engineers and designers take credit for the product calls they actually made. Their team\'s wins are visibly distributed.', 'Tell me about a launch where the credit went mostly to engineering or design. How did you make that happen?', 'Centralizes credit. Their LinkedIn and resume show "I shipped X" for every team win.'],
          ['Innovation', 'Has shipped a feature that the team would not have shipped under a status-quo PM. Can articulate what their unique contribution was.', 'What\'s a feature your team shipped that wouldn\'t have existed without you specifically? What\'s the counterfactual?', 'Cannot point to a feature where they were the load-bearing PM. Shipped features look like the team would have shipped them anyway.'],
          ['Inclusion', 'Notices when junior or underrepresented engineers and designers are being excluded from product decisions. Builds review structures that surface their voices.', 'Tell me about an underrepresented IC whose product judgment you actively elevated. How?', 'Product reviews are dominated by senior voices. Has not actively addressed the pattern.'],
          ['Integrity', 'Reports honest launch results including the regressions. Refuses to spin a flat launch as a win.', 'Tell me about the most honest post-launch readout you wrote. What was the political cost?', 'Spins launches. Has not written a post-launch document that acknowledged a significant failure.'],
          ['Impact', 'Their product work has moved a top-line business metric, not just a feature metric. Can name the metric and their specific contribution.', 'What business metric has your work moved? How do you know it was your work specifically?', 'Talks about feature launches and adoption. Cannot connect to a top-line business metric.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their product judgment was actively reshaping how the broader product org makes decisions — when other Senior PMs are referencing their frameworks in their own memos.',
        debriefPrompts: [
          'Which currently-stuck product debate would this person\'s judgment resolve?',
          'What\'s the specific area where this candidate is materially stronger than our strongest current Senior PM?',
          'Where does this person\'s background show a gap — and is the gap closable in 12 months or structural?',
        ],
        hireSignalSummary: 'Hire if: writing samples demonstrate dense decision-forcing communication, evidence of overruling senior product instincts with data, history of moving top-line business metrics. No-hire if: process-heavy PM style, no public writing samples, cannot articulate the counterfactual on their feature launches.',
      },
    },
  },

  // 11. Director of Product · Director · Product
  {
    id: 'director-product',
    roleTitle: 'Director of Product',
    level: 'Director',
    fn: 'Product',
    aliases: ['director of product', 'director product management', 'head of product', 'group product manager', 'gpm'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Tight. Estimated 5,000–8,000 globally with 8+ years of product leadership and a track record of leading 4+ PMs on a major consumer subscription product. Netflix-quality (no PRD culture, memo-based, strategy-by-writing) cuts addressable pool to roughly 25%.',
        topCompetitors: ['Spotify (Senior Director Product)', 'Airbnb (Group Product Manager)', 'DoorDash (Director Product)', 'Disney+ (Director Product)', 'Hulu (Director Product)'],
        compensation: 'Total comp $620K–$850K (base $340K–$400K, equity $250K–$420K, bonus 20–25%). Netflix cash equivalent $750K–$950K.',
        talentPools: 'Strongest feeders: Spotify Product Leadership, Airbnb Senior Product, DoorDash Product Leadership, Pinterest Product Leadership, ex-Apple Services product directors. Notable: ex-startup CPOs whose companies didn\'t scale and want Netflix-scale impact.',
        diversityPipeline: 'Black Product Leaders network, Latinx Pros executive tier, Women In Product Director cohort, Out in Product executive tier. Underweighted: senior product leaders at international streaming services (Reliance Jio, Rakuten) who would relocate.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Director-of-Product talent moves every 3–5 years on average and only for a problem they specifically want to own. Time-to-fill: 5–8 months. Most successful hires are 12+ month relationships built before the open req.',
        },
        sourcingAngles: [
          'Pursue Product Directors at streaming/subscription competitors whose strategic direction has been muddled (post-merger, post-CEO-change orgs).',
          'Engage ex-startup CPOs whose companies pivoted away from their original consumer vision — they\'re looking for clarity-of-mission roles.',
          'Run an invite-only "Subscription Product Leadership at Netflix" annual dinner. High-trust pipeline build for the level.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Makes the strategic call about which product bets are worth multi-year investment vs. which are quarterly. Doesn\'t treat every bet as equally weighty.', 'Tell me about a multi-year product bet you made over the objection of other leaders. What told you it was right?', 'Treats all product bets equivalently. Cannot articulate which decisions in their career were the load-bearing ones.'],
          ['Communication', 'Their strategy memos shape the company\'s direction, not just their org\'s. Their writing is referenced in board-level discussions.', 'Show me a memo of yours that influenced a decision at a level above your formal authority. What was the mechanism?', 'Writing influences only their direct org. Cannot point to artifacts that influenced above their level.'],
          ['Curiosity', 'Engages with adjacent industries, regulatory landscape, content economics, technology trends. Their strategy is informed by sources their peers haven\'t read.', 'What\'s a domain outside product that you\'ve developed real depth in over the last 18 months? Why?', 'Strategy is informed by product literature and peer companies only. No broader intellectual sourcing.'],
          ['Courage', 'Has killed a product line, deprecated a feature, or sunset a partnership when the data warranted, despite political cost. Has stood behind that call publicly.', 'Tell me about a product or feature you killed over the objection of leadership. What was the political cost?', 'Has never killed a major initiative. Sunset decisions are deferred to skip-level.'],
          ['Passion', 'Engages with their product\'s domain at the level of a domain expert, not a product manager. Knows the industry economics, the historical context.', 'Tell me about your product\'s domain economics. What\'s the structural constraint nobody outside the industry sees?', 'Product domain knowledge is shallow. Cannot speak to the structural economics of the industry.'],
          ['Selflessness', 'Has built a product leadership bench. Two of their direct reports are ready for Director-level promotion in 18 months.', 'Name the two PMs ready for promotion under you. What\'s the specific work you\'ve done to make them ready?', 'No PM ready for promotion under them. Has not actively developed next-tier leaders.'],
          ['Innovation', 'Has launched a product or feature at meaningful scale that the company would not have launched without their specific advocacy. Can articulate the counterfactual.', 'What\'s a product or feature you championed that wouldn\'t have happened without you? What was the resistance?', 'Cannot point to a major product they specifically championed. Achievements look like the org would have done them anyway.'],
          ['Inclusion', 'Their org\'s promotion rates for underrepresented PMs exceed the company baseline. They can name the specific mechanism that produces it.', 'What\'s the demographic shape of your org\'s promotions over the last 24 months? What\'s the mechanism that produced it?', 'Promotions reflect demographic majority. Cannot point to a deliberate inclusion mechanism.'],
          ['Integrity', 'Has refused to launch a feature they didn\'t believe was right for users, despite revenue pressure. Has the receipts.', 'Tell me about a feature you blocked over revenue or growth team pressure. What was the basis?', 'Has not pushed back on a revenue-positive initiative they had concerns about. Treats user-best-interest as an abstraction.'],
          ['Impact', 'Their product work has materially shifted a top-line business metric in a measurable way. Their LinkedIn isn\'t the only place where that impact is acknowledged.', 'What top-line metric has your work materially moved? How do you know it was yours, and where is the public evidence?', 'Impact claims are unverifiable. Cannot point to public evidence (filings, press, analyst reports) of the impact they claim.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their strategic instincts were reshaping the company\'s product roadmap — not just their org\'s — within 18 months.',
        debriefPrompts: [
          'What\'s the specific multi-year product bet currently being miscalibrated that this person would catch?',
          'Compared to our strongest current Director of Product, where is this candidate materially stronger?',
          'What\'s the failure mode where this person executes on the wrong vision well, instead of catching that the vision is wrong?',
        ],
        hireSignalSummary: 'Hire if: documented influence beyond their formal authority, track record of killing major initiatives, evidence of developing director-level successors. No-hire if: strategy is execution-focused without independent direction setting, no public artifacts of strategic thinking, has not made hard portfolio decisions.',
      },
    },
  },

  // 12. Senior Product Designer · IC5 · Design
  {
    id: 'senior-product-designer-ic5',
    roleTitle: 'Senior Product Designer',
    level: 'IC5',
    fn: 'Design',
    aliases: ['senior product designer', 'staff product designer', 'sr product designer', 'lead product designer', 'sr ux designer'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate. Estimated 18,000–25,000 globally with 6–9 years of consumer product design experience at scale. The Netflix bar (own a product surface end-to-end, including research, IA, interaction, visual, and partnership with engineering) cuts the addressable pool to roughly 20%.',
        topCompetitors: ['Airbnb', 'Spotify', 'Stripe', 'Figma', 'Apple (Services Design)'],
        compensation: 'Total comp $310K–$430K (base $215K–$255K, equity $80K–$140K, bonus 12–17%). Netflix cash equivalent $370K–$490K.',
        talentPools: 'Strongest feeders: Airbnb Design, Spotify Design, Stripe Design (Brand/Product), Figma Design, ex-Apple Services Design, Square Design. Top design programs (RISD, ArtCenter, SVA, CMU HCI) 4+ years post-grad.',
        diversityPipeline: 'Where Are The Black Designers (WATBD) Senior tier, Latinx in Design, Hexagon UX (women+nb in UX), AIGA Diversity & Inclusion cohort, Designing in Color network. Underweighted: senior designers from non-tech industries (game studios, film/TV production, editorial) with strong narrative-design intuition.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Strong product designers exist but Netflix\'s end-to-end ownership (no separate UX research team, no design ops backstop) screens out most. Time-to-fill: 3–5 months. Expect 50%+ of strong portfolios to fail on the practical work sample.',
        },
        sourcingAngles: [
          'Target designers at companies whose design org was recently restructured or downsized — strong designers leave reorgs in waves.',
          'Engage designers in film/TV/games industries with strong narrative chops; Netflix\'s problem space (browsing, anticipation, taste-matching) is closer to entertainment design than enterprise software.',
          'Sponsor Config (Figma\'s conference), AIGA Y Conference; recruit at the after-parties for senior IC engagement.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when to defend a design decision vs. when the data has moved against it. Doesn\'t conflate aesthetic preference with user benefit.', 'Tell me about a design decision you abandoned despite still liking it. What told you to drop it?', 'Defends design choices on craft grounds when user data contradicts them. Cannot separate aesthetic from outcome.'],
          ['Communication', 'Their design memos and presentations frame trade-offs in language engineers and PMs can act on. Doesn\'t hide behind craft jargon.', 'Walk me through a design presentation that aligned engineering on a specific trade-off. What was the framing?', 'Communicates in design jargon. Engineering and product leave their reviews unsure what was decided.'],
          ['Curiosity', 'Engages with adjacent design domains — game design, film editing, editorial design, motion. Brings primitives back to product surfaces.', 'What design tradition or domain outside product design has influenced your last year of work? How specifically?', 'Design vocabulary is purely consumer-tech-product. Has not absorbed an outside tradition.'],
          ['Courage', 'Pushes back on a PM\'s solution when it\'s the wrong shape. Tells engineering that the implementation has compromised the design in a way that matters.', 'Tell me about a time you blocked an engineering implementation that compromised your design. What was the cost?', 'Capitulates on implementation compromises. Has not blocked an engineering or product call in their last year.'],
          ['Passion', 'Maintains a personal practice — illustration, photography, type design, game design, side projects. Their craft extends beyond work output.', 'What design practice do you maintain that has nothing to do with your day job?', 'Design is purely a job. Cannot point to a sustained personal craft.'],
          ['Selflessness', 'Builds design systems and patterns that the next 5 designers use. Spends real time mentoring juniors.', 'Tell me about a design system or pattern you built that benefited the team beyond your projects. What was the trade-off?', 'Builds bespoke designs for their projects. No durable artifacts that scaled past their direct work.'],
          ['Innovation', 'Has shipped a UI pattern or design approach that the team hadn\'t shipped before. Other designers are referencing it.', 'What\'s a design pattern or approach you introduced that\'s become a reference for others on your team?', 'Default patterns only. Has not introduced a novel approach.'],
          ['Inclusion', 'Notices when an underrepresented designer\'s craft is undervalued. Actively elevates their voice in design reviews.', 'Tell me about a designer from an underrepresented background whose career you actively shaped. What was your specific contribution?', 'Design team discussion is dominated by the same voices. Has not actively addressed the pattern.'],
          ['Integrity', 'Reports honest research findings, including the ones that contradict their preferred direction. Refuses to ship a design they don\'t believe in.', 'Tell me about research findings that contradicted your design and what you did. Be specific.', 'Smooths over inconvenient research. Has not visibly reversed a direction based on research.'],
          ['Impact', 'Their design work has moved a measurable user outcome — engagement, completion rate, retention. Can connect aesthetic and IA decisions to outcome metrics.', 'What user metric has your design work moved? How do you know it was your specific design?', 'Talks about design quality and craft only. Cannot connect to user outcome metrics.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their design craft was visibly raising the bar across the design org — when other Senior Designers are referencing their patterns and asking how they framed a problem.',
        debriefPrompts: [
          'Which currently-stuck design debate would this person\'s judgment resolve?',
          'Where is this candidate stronger than our strongest current Senior Product Designer? Where weaker?',
          'What\'s the failure mode where this person\'s craft is excellent but they don\'t scale their impact past their immediate surface?',
        ],
        hireSignalSummary: 'Hire if: end-to-end ownership of a product surface in their portfolio, demonstrated craft depth, evidence of moving user metrics through design choices. No-hire if: dependent on UX research team or design ops, portfolio is decoration-focused without underlying systems thinking, cannot connect craft to outcomes.',
      },
    },
  },

  // 13. Staff Content Designer · IC5 · Design
  {
    id: 'staff-content-designer-ic5',
    roleTitle: 'Staff Content Designer',
    level: 'IC5',
    fn: 'Design',
    aliases: ['staff content designer', 'senior content designer', 'staff ux writer', 'content strategist', 'principal content designer'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Thin. Estimated 4,000–7,000 globally at Staff level with both editorial chops and product-surface ownership. Content design as a discipline at Staff level is relatively new; the talent pool is sharply limited and largely concentrated in 8–10 companies.',
        topCompetitors: ['Airbnb', 'Stripe', 'Atlassian', 'Shopify', 'Spotify'],
        compensation: 'Total comp $300K–$410K (base $210K–$250K, equity $75K–$135K, bonus 12–17%). Netflix cash equivalent $360K–$470K.',
        talentPools: 'Strongest feeders: Airbnb Content Design, Stripe Brand/Content, Atlassian Content Design, Shopify Content Strategy, Spotify Content Design, Mailchimp (pre-Intuit). Adjacent: senior editorial talent from publishing (The New Yorker, The Atlantic, McSweeney\'s, The New York Times) who pivoted to product.',
        diversityPipeline: 'Where Are The Black Designers Content Strategy chapter, Latinx in Design content track, AIGA Content Strategy section, Content & UX writing collectives (Button Conference speaker pool). Underweighted: editorial writers from independent literary magazines and Pulitzer-track journalists who would consider product roles.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Staff-level content design talent is extremely thin and turnover is low. Time-to-fill: 5–8 months. Netflix\'s editorial sensibility resonates but the role requires both narrative craft and product-systems thinking.',
        },
        sourcingAngles: [
          'Engage senior editorial writers at independent magazines and prestige publications who have side projects in product. Many are open to a craft-respecting product role.',
          'Sponsor Button Conference (the primary content design event) and recruit at after-parties.',
          'Run "Writing for the Netflix Experience" annual essay contest with strong editorial framing — high-signal soft funnel.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when a product needs more copy vs. less. Pushes back on PMs asking for "more guidance" when the better answer is a cleaner flow.', 'Tell me about copy you deleted entirely from a product flow. What told you to remove it?', 'Adds copy reflexively to every empty state and tooltip. Cannot articulate when less is more.'],
          ['Communication', 'Their content design rationale documents land for engineers, PMs, and designers alike. Writes about writing in language that doesn\'t alienate non-writers.', 'Show me a document explaining your content design choices to a cross-functional audience. What\'s the framing?', 'Defaults to writing-craft jargon. Cross-functional partners leave reviews unsure what was decided.'],
          ['Curiosity', 'Reads outside product writing — literary fiction, longform journalism, screenwriting, advertising history. Their reading influences their craft visibly.', 'What\'s a piece of writing outside product that\'s changed how you approach a product problem? Be specific.', 'Reading is limited to UX-writing blogs. No engagement with broader literary tradition.'],
          ['Courage', 'Tells leadership when corporate-comms language is leaking into product. Refuses to ship marketing-flavored copy that doesn\'t serve the user.', 'Tell me about copy you refused to ship over marketing or executive pressure. What happened?', 'Capitulates to marketing or executive copy pressure. Has not blocked a launch over content concerns.'],
          ['Passion', 'Has a personal writing practice — newsletter, essays, fiction, criticism. The craft is alive outside their job.', 'What writing do you do that has nothing to do with product?', 'Writing is purely a job. No personal writing practice.'],
          ['Selflessness', 'Builds content systems — voice guides, terminology databases, decision frameworks — that scale beyond their direct projects. Mentors junior content designers.', 'Tell me about a content system you built that benefited writers beyond yourself. What was the trade-off?', 'Bespoke writing for every project. No durable artifacts that scaled.'],
          ['Innovation', 'Has invented a content pattern or approach that other content designers reference. Their work has changed how a team writes.', 'What content design pattern did you introduce that\'s now a reference for your team?', 'Default patterns only. Has not introduced something that shifted team practice.'],
          ['Inclusion', 'Their content design choices consider audiences beyond the default user. Has actively flagged language that excludes or alienates.', 'Tell me about content you changed because it failed an inclusion test. Be specific about the test and the change.', 'Has not addressed inclusion in their content design choices in any specific, documented way.'],
          ['Integrity', 'Reports honestly when copy isn\'t landing — including their own. Has reversed direction on writing they personally championed when user data warranted.', 'Tell me about copy you championed that you publicly reversed when user data came in. What was the cost?', 'Defends their writing past the point user data supports. Has not reversed a content direction publicly.'],
          ['Impact', 'Their content design changes have moved a measurable user outcome — completion rate, satisfaction, error rate. They can name the metric.', 'What user metric has your content design moved? How do you know it was your writing?', 'Talks about craft and voice only. Cannot connect content design to user outcomes.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their voice was visibly shaping the Netflix product\'s tone across surfaces — when other writers across the company are pulling from their patterns and other PMs are reaching out for their judgment.',
        debriefPrompts: [
          'What specific Netflix product surface is currently weakest from a content perspective, and would this person fix it?',
          'Compared to our strongest current Staff Content Designer, where is this candidate materially stronger?',
          'What\'s the failure mode where this person\'s craft is excellent but their influence doesn\'t scale past their direct projects?',
        ],
        hireSignalSummary: 'Hire if: portfolio shows systems-level content thinking, evidence of moving user metrics through content choices, strong personal writing practice outside work. No-hire if: writing samples are decorative without systems thinking, no engagement with broader literary tradition, dependent on PMs to define scope.',
      },
    },
  },

  // 14. Director of Original Series · Director · Content
  {
    id: 'director-original-series',
    roleTitle: 'Director of Original Series',
    level: 'Director',
    fn: 'Content',
    aliases: ['director of original series', 'director original content', 'vp original series', 'head of scripted', 'director of scripted content'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Thin and idiosyncratic. Estimated 800–1,500 globally at the level of running development for a streaming-scale scripted slate. Most concentrated in LA, NYC, London. Background is split: ~60% from studio/network development, ~25% from streaming peers, ~15% from production company/lit agency lateral moves.',
        topCompetitors: ['Amazon MGM Studios', 'Apple TV+', 'HBO/Max', 'Disney+/Hulu', 'Paramount+'],
        compensation: 'Total comp $580K–$820K (base $360K–$430K, equity $150K–$300K, bonus 25–35%, plus deal-tied back-end participation on select titles). Top-of-market with show profit participation can push effective comp $1M+ in strong years.',
        talentPools: 'Strongest feeders: Amazon MGM Original Series, Apple TV+ Programming, HBO/Max Original Series, Disney+ Original Series, Hulu Originals. Notable lateral pool: senior creative executives at major lit agencies (CAA, WME, UTA) and production companies (Plan B, A24, Bad Robot, MRC) considering streamer transitions.',
        diversityPipeline: 'ColorCreative network, NALIP (National Association of Latino Independent Producers), Ghetto Film School alumni now in development executive roles, Sundance Producers Lab fellows, Time\'s Up Entertainment, Geena Davis Institute network. Underweighted: senior development talent at international production companies (UK, Korea, India) who would relocate.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Senior development talent moves rarely and often around specific creative relationships. Time-to-fill: 6–9 months. Most successful hires are 12+ month relationships in the development community.',
        },
        sourcingAngles: [
          'Engage senior development executives at competitor streamers whose strategic direction shifted (post-merger, post-executive-change orgs) — Apple TV+ leadership transitions, Max post-Discovery merger, etc.',
          'Pursue senior production company executives (A24, Plan B, MRC, Bad Robot) considering a streamer transition for stability and scale.',
          'Build the relationship via the festival circuit (Sundance, Toronto, Cannes) — this is where development relationships are built and signaled.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Greenlights stories the algorithm can\'t predict will land. Knows when a showrunner\'s vision is worth defending vs. when it\'s draining budget without artistic return.', 'Tell me about a show you championed that the data said wouldn\'t work. What were you seeing?', 'Greenlights to spec — only what the data predicts. Cannot articulate a creative call that contradicted internal signal.'],
          ['Communication', 'Their notes to showrunners and writers are specific, respectful, and creatively additive. Writers cite them as the best note-giver they\'ve worked with.', 'Walk me through a single set of notes you gave on a script that materially changed the show. What was your framing?', 'Notes are vague, defensive, or markets-language-translated. Writers describe them as a notes-bottleneck.'],
          ['Curiosity', 'Engages broadly with culture — film, theater, longform journalism, international TV, criticism. Their slate reflects sources their peers haven\'t engaged with.', 'What\'s a piece of culture from outside scripted TV that\'s influenced something in your last year of work? Be specific.', 'Slate reflects mainstream taste. Has not engaged with international TV, theater, or longform criticism.'],
          ['Courage', 'Has championed a show that internal data and executive opinion opposed, and stood behind it through development. Has also killed a show with a big-name attached when the script wasn\'t there.', 'Tell me about a show you killed despite a major name attached. What was the basis?', 'Has not killed a major-name project. Defers to attachments rather than evaluating material.'],
          ['Passion', 'Engaged with the craft of television as a discipline, not a job. Talks about writers\' rooms, directors, structure with the depth of someone who genuinely loves the form.', 'Who\'s a writer you\'ve worked with whose career arc you can describe in detail? Why does their work matter to you?', 'Speaks about shows in commercial terms only. Cannot articulate what makes a writer\'s voice specifically distinctive.'],
          ['Selflessness', 'Has built the development bench. Two of their current development executives are ready for senior promotions. Credit on shows is visibly distributed.', 'Name two development executives whose careers you\'ve materially shaped. What was your specific contribution?', 'Credit on shows concentrates around them. Has not actively developed next-tier development executives.'],
          ['Innovation', 'Has championed a format, structure, or distribution approach that the industry hadn\'t tried before, and made it work. Their slate has visible structural innovation, not just genre coverage.', 'What\'s a format or structural choice you championed that hadn\'t been tried at scale? What was the resistance?', 'Slate is structurally conventional. Has not championed something genuinely new in format.'],
          ['Inclusion', 'Their slate reflects voices the industry typically underweights. Their development relationships skew more diverse than the industry baseline.', 'What\'s the demographic shape of the writers and creators you\'ve developed deals with over the last 24 months? How does that compare to industry baseline?', 'Slate reflects industry-baseline demographics. Cannot point to deliberate inclusion mechanisms in their development practice.'],
          ['Integrity', 'Reports honest creative assessments to creators, including the hard ones. Doesn\'t soften "this isn\'t working" into "let\'s explore further."', 'Tell me about a hard creative conversation you had with a major showrunner. What did you say verbatim?', 'Softens hard creative feedback. Showrunners describe them as "supportive but unclear."'],
          ['Impact', 'Their slate has produced shows that materially shifted subscription, retention, or cultural conversation. They can point to specific titles.', 'What show on your slate has materially moved the business? How do you know it was the development choice you made?', 'Cannot point to a specific show their development judgment produced. Slate looks like the org would have made the same choices.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their taste was visibly shaping what Netflix originals look like — when their development picks become the cultural reference for what Netflix scripted programming is.',
        debriefPrompts: [
          'What\'s the specific show currently in development that this person would have killed or redirected, and would that be right?',
          'Whose creative relationships does this person bring that we can\'t access today?',
          'What\'s the failure mode where this person executes on commercial slate without the creative distinctiveness Netflix needs?',
        ],
        hireSignalSummary: 'Hire if: track record of championing creatively distinctive shows, deep relationships in the writer/showrunner community, evidence of developing diverse creative voices. No-hire if: slate is commercially-defensible without creative distinctiveness, no track record of greenlighting against internal signal, no record of developing underrepresented creators.',
      },
    },
  },

  // 15. Manager of Content Acquisition · Manager · Content
  {
    id: 'manager-content-acquisition',
    roleTitle: 'Manager of Content Acquisition',
    level: 'Manager',
    fn: 'Content',
    aliases: ['manager content acquisition', 'manager content licensing', 'content acquisition lead', 'manager content deals', 'manager programming acquisitions'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate. Estimated 3,000–5,000 globally with 5+ years of streaming-scale content acquisition experience. Most concentrated in LA, NYC, London, with significant emerging pools in Mumbai, Seoul, and Mexico City for non-English language content.',
        topCompetitors: ['Amazon Prime Video Acquisitions', 'Apple TV+ Acquisitions', 'Disney+ Licensing', 'Paramount+ Acquisitions', 'Max Acquisitions'],
        compensation: 'Total comp $310K–$420K (base $200K–$245K, equity $70K–$130K, bonus 18–25%). Netflix cash equivalent $370K–$480K.',
        talentPools: 'Strongest feeders: Amazon Prime Video Acquisitions, Apple TV+ Programming Strategy, Disney/Hulu Acquisitions, Max Acquisitions, Paramount+ Acquisitions, ex-studio film acquisition executives (Sony, Lionsgate). Adjacent: senior business affairs executives at lit agencies moving in-house.',
        diversityPipeline: 'NALIP Latinx in Acquisitions, Black Entertainment & Sports Lawyers Association (BESLA), Asian American Federation Entertainment chapter, ColorCreative business affairs network. Underweighted: senior acquisition executives at international streamers (Reliance Jio, JioHotstar, Rakuten Viki) who would relocate.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Acquisition talent is mobile but Netflix\'s data-driven acquisition discipline (every deal modeled to subscriber LTV) screens out executives accustomed to relationship-driven dealmaking. Time-to-fill: 3–5 months.',
        },
        sourcingAngles: [
          'Target acquisition executives at competitor streamers whose content budgets recently contracted (post-merger, post-restructuring orgs).',
          'Engage senior business affairs talent at major lit agencies (CAA, WME, UTA, Endeavor) looking for an in-house transition.',
          'Build relationships at MIPCOM, NATPE, AFM — international content market presence is the strongest filter for hireable talent in this role.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when a license deal is worth its premium vs. when the same dollars would build subscriber LTV through originals. Doesn\'t default to "more content is better."', 'Tell me about an acquisition deal you walked away from despite internal support. What was the math?', 'Defaults to closing every deal that has internal support. Cannot articulate a deal they killed for portfolio reasons.'],
          ['Communication', 'Their deal memos and acquisition proposals are model-rigorous and decision-forcing. Finance partners cite their analysis as best-in-class.', 'Show me a deal memo of yours that influenced a portfolio-level decision. What was the framing?', 'Deal memos are descriptive rather than decision-forcing. Finance partners describe their analysis as "fine but unclear."'],
          ['Curiosity', 'Reads beyond their acquisition lane — content economics literature, international markets, viewer behavior research. Brings frameworks that peers don\'t use.', 'What\'s a framework or piece of analysis from outside content acquisition that\'s changed how you evaluate deals?', 'Uses standard industry frameworks only. Has not absorbed an outside analytical tradition.'],
          ['Courage', 'Refuses to close deals leadership wants when the model doesn\'t support them. Has killed major deals despite pressure.', 'Tell me about a deal you blocked despite senior leadership pressure. What was the cost?', 'Closes deals leadership wants regardless of the model. Has not pushed back on a senior-driven acquisition.'],
          ['Passion', 'Engages with content as a viewer, not just a buyer. Their understanding of why content lands is specific, not abstract.', 'Tell me about a recent acquisition that worked unexpectedly well. What did you see in it that the model missed?', 'Treats content as fungible product. Cannot articulate why specific content lands with specific audiences.'],
          ['Selflessness', 'Has built the next tier of acquisition talent on their team. Two of their direct reports are ready for senior promotion.', 'Name two acquisition executives whose careers you\'ve actively advanced. What was your specific work?', 'Centralizes deal relationships. Direct reports execute without developing their own pipeline.'],
          ['Innovation', 'Has structured a deal in a way the industry hadn\'t — novel rights split, novel back-end structure, novel territorial arrangement. Has the receipts.', 'What\'s a deal structure you\'ve championed that the industry hadn\'t tried? What was the resistance?', 'Deal structures are conventional. Has not pushed for novel arrangements.'],
          ['Inclusion', 'Their acquisition slate reflects voices the industry typically underweights. Has actively built relationships with underrepresented producers and rights holders.', 'What\'s the demographic shape of the producers and rights holders you\'ve closed with over the last 24 months?', 'Slate reflects industry-baseline demographics. No deliberate inclusion mechanism in their acquisition practice.'],
          ['Integrity', 'Reports honest deal outcomes — including the ones that underperformed. Refuses to spin underperforming acquisitions.', 'Tell me about an acquisition you closed that underperformed. What was the post-mortem?', 'Avoids post-mortems on underperforming deals. Has not written a candid acquisition retrospective.'],
          ['Impact', 'The titles they\'ve acquired have measurably moved subscription, retention, or engagement. They can point to specific deals.', 'What acquisition of yours has materially moved the business? How do you know?', 'Cannot point to a specific acquisition with measurable business impact. Achievements are deal-volume-based.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their acquisitions were visibly shaping Netflix\'s competitive position — when their deal calls become the reference for what good acquisition judgment looks like across the org.',
        debriefPrompts: [
          'What\'s the deal currently on the table they would have killed or restructured?',
          'Whose acquisition relationships does this person bring that we can\'t access today?',
          'What\'s the failure mode where this person closes deals well but misses the portfolio-level call?',
        ],
        hireSignalSummary: 'Hire if: track record of model-driven acquisition decisions, evidence of walking away from senior-supported deals, history of structurally innovative deals. No-hire if: acquisition strategy is volume-driven, no record of killing deals over portfolio fit, no deliberate inclusion mechanism in deal pipeline.',
      },
    },
  },

  // 16. Senior Games Engineer · IC5 · Games
  {
    id: 'senior-games-engineer-ic5',
    roleTitle: 'Senior Games Engineer',
    level: 'IC5',
    fn: 'Games',
    aliases: ['senior games engineer', 'staff games engineer', 'senior game developer', 'lead game engineer', 'sr mobile games engineer'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate but specialized. Estimated 25,000–35,000 senior games engineers globally with 6–9 years of shipped-game experience. Netflix\'s focus (mobile + cloud-streamed games at consumer subscription scale) narrows to a thinner pool of cross-platform engineers — call it 6,000–9,000.',
        topCompetitors: ['Riot Games', 'Roblox', 'Supercell', 'Epic Games', 'King (Activision Blizzard)'],
        compensation: 'Total comp $340K–$460K (base $230K–$275K, equity $90K–$155K, bonus 12–18%). Netflix cash equivalent $410K–$520K. Note: Netflix Games\' compensation is on the high end of games-industry comp, which has historically lagged broader tech.',
        talentPools: 'Strongest feeders: Riot Games, Roblox, Supercell, Epic Games (Fortnite engineering), King, Niantic, ex-Zynga senior engineers. Adjacent: senior game engineers at AAA studios (Naughty Dog, Insomniac, Bungie) interested in mobile/cloud transition. Underweighted: international games studios (Mihoyo, NetEase, NCSoft) at senior IC levels.',
        diversityPipeline: 'Game Devs of Color Expo (GDC Expo speakers and attendees), Women in Games International senior cohort, Black Girls Code games track alumni now senior, Latinx in Gaming senior network, IGDA Diversity Special Interest Group. Underweighted: senior game engineers from non-Western studios who would relocate.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Games engineering talent is mobile but Netflix Games\' strategic direction has been publicly debated (free-with-subscription model, no in-game monetization), which complicates the pitch to engineers used to traditional games economics. Time-to-fill: 3–5 months.',
        },
        sourcingAngles: [
          'Target senior engineers at companies whose monetization shifted aggressively to predatory mechanics — engineers leave these orgs and are open to Netflix\'s no-microtransactions story.',
          'Engage senior AAA console/PC engineers looking for mobile/cloud transition with creative scope.',
          'Sponsor GDC and recruit at the after-parties — games-industry hiring is overwhelmingly relationship-driven.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when to optimize game performance for low-end devices vs. when to ship the better experience for higher-end users. Doesn\'t default to lowest-common-denominator.', 'Tell me about a performance trade-off you made that excluded a segment of users. How did you frame the decision?', 'Defaults to lowest-common-denominator targeting. Cannot articulate trade-off framing.'],
          ['Communication', 'Their technical design docs reach engineering, design, and product audiences. Translates engine-level constraints into product-actionable language.', 'Walk me through a design doc you wrote that aligned engineering and game design on a constraint. What was the framing?', 'Communicates in engine jargon. Cross-functional partners describe their docs as inaccessible.'],
          ['Curiosity', 'Engages with adjacent fields — graphics research, networked systems, behavior science, game design theory. Their engineering reflects broader sources.', 'What\'s a domain outside games engineering that\'s influenced your last year of work? Be specific.', 'Has narrowed to a single engine and stack. Cannot speak to broader sources of influence.'],
          ['Courage', 'Pushes back on a producer\'s scope when it endangers performance. Tells a game designer that their proposed mechanic won\'t work at scale.', 'Tell me about a time you blocked a feature for performance or scalability reasons. What was the cost?', 'Capitulates to scope pressure. Has not blocked a feature on technical grounds in their last year.'],
          ['Passion', 'Has a personal games practice — game jams, side projects, technical research, modding community participation. The craft extends beyond work output.', 'What game-related work do you do that has nothing to do with your job?', 'Games engineering is purely a job. No personal craft.'],
          ['Selflessness', 'Builds engine improvements and tooling that the next 5 game engineers will use. Documents and mentors.', 'Tell me about engine work or tooling you built that benefited the team beyond your project. What was the trade-off?', 'Builds bespoke code for their project only. No durable engine artifacts.'],
          ['Innovation', 'Has shipped a technical approach to a games problem that hadn\'t been done at this scale. Other engineers reference their work.', 'What\'s a technical approach you shipped that wasn\'t in the standard games engineering playbook?', 'Replicates known patterns. Has not introduced a novel technical approach.'],
          ['Inclusion', 'Notices when underrepresented junior engineers are being passed over in technical reviews. Actively elevates their voice.', 'Tell me about an underrepresented junior engineer whose career you\'ve materially advanced. What was your specific contribution?', 'Games engineering team is dominated by the same voices. Has not addressed the pattern.'],
          ['Integrity', 'Reports honest technical performance results — including the regressions on low-end devices nobody is testing. Refuses to ship when quality bar isn\'t met.', 'Tell me about a launch you delayed for quality reasons over producer pressure. What happened?', 'Ships under pressure even when quality bar isn\'t met. Has not delayed a launch on quality.'],
          ['Impact', 'Their engineering choices have moved game performance, retention, or shipping velocity in measurable ways. Can connect technical work to player outcomes.', 'What player or business metric has your engineering work moved? How do you know?', 'Talks about technical achievements only. Cannot connect to player or business outcomes.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their technical taste was visibly raising the bar across Netflix Games engineering — when other Senior Engineers are citing their patterns and asking them to weigh in on cross-team architecture.',
        debriefPrompts: [
          'What specific technical decision currently being made on our games platform would this person have made differently?',
          'Compared to our strongest current Senior Games Engineer, where is this candidate stronger?',
          'What\'s the failure mode where this person\'s craft is excellent but they don\'t scale impact past their immediate game?',
        ],
        hireSignalSummary: 'Hire if: shipped-game ownership at scale, demonstrated taste in performance/scope trade-offs, evidence of engine-level contributions. No-hire if: dependent on senior engineers for architecture decisions, has not shipped a game end-to-end, cannot connect technical work to player outcomes.',
      },
    },
  },

  // 17. Director of Games Production · Director · Games
  {
    id: 'director-games-production',
    roleTitle: 'Director of Games Production',
    level: 'Director',
    fn: 'Games',
    aliases: ['director games production', 'director of games', 'head of games production', 'executive producer games', 'vp games production'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Thin. Estimated 1,500–2,500 globally with 10+ years of games production and a track record of shipping at scale across mobile/console/cloud. Netflix Games\' free-with-subscription model is unique and screens for executives who can think in subscription economics rather than F2P or premium economics.',
        topCompetitors: ['Riot Games (Studio Head/Executive Producer)', 'Roblox (Director Games)', 'Epic Games (Executive Producer)', 'Apple Arcade (Games Lead)', 'Supercell (Studio Head)'],
        compensation: 'Total comp $480K–$680K (base $310K–$370K, equity $130K–$240K, bonus 22–28%). Netflix cash equivalent $590K–$770K.',
        talentPools: 'Strongest feeders: Riot Games studio heads, Apple Arcade leadership, ex-EA Mobile leadership, ex-King leadership, Epic Games production leadership. Adjacent: senior production executives from major AAA studios (Naughty Dog, Insomniac, Sucker Punch) interested in subscription transition.',
        diversityPipeline: 'Game Devs of Color Expo Director track, Women in Games International executive cohort, Latinx in Gaming executive network, IGDA Diversity SIG. Underweighted: senior production executives from international games markets (Asia particularly) who would relocate to LA.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Director-level games production talent moves rarely (every 4–6 years) and Netflix Games\' strategic direction is unusual. Time-to-fill: 6–10 months.',
        },
        sourcingAngles: [
          'Engage senior games producers at Apple Arcade (similar subscription model) who are looking for more strategic scope.',
          'Pursue games studio heads whose studios were recently acquired or restructured — Embracer Group fallout, Microsoft-Activision integration, Sony first-party reshuffling.',
          'Build relationships in the games-industry-leadership conference circuit (DICE Summit, Game Developers Conference Executive Track) — Director-level hires are multi-year relationships.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when to ship a game vs. when to kill it. Has killed games in production when the gameplay wasn\'t there, despite sunk cost.', 'Tell me about a game you killed in production. What was the basis?', 'Has not killed a major project in production. Defers cancellation decisions to skip-level.'],
          ['Communication', 'Their production memos shape how cross-functional teams (engineering, design, art, audio, narrative) align. Their writing transcends discipline silos.', 'Show me a production memo that aligned multiple disciplines around a hard constraint. What was the framing?', 'Communicates in production-management jargon. Disciplines describe their writing as inaccessible.'],
          ['Curiosity', 'Engages with games culture, gaming economics, adjacent entertainment (film, TV, music). Their understanding of why games land is multidimensional.', 'What\'s a piece of culture from outside games that influenced your last shipped game? How specifically?', 'Games-industry-insider perspective only. Has not engaged with adjacent entertainment seriously.'],
          ['Courage', 'Has fired senior production talent when warranted. Has stood behind unpopular creative calls when they were the right call.', 'Tell me about a senior production-team firing you made. What was the basis?', 'Has not made senior personnel decisions. Defers to skip-level on hard production calls.'],
          ['Passion', 'Plays games — and not just the games they\'re producing. Their understanding of player taste is current and broad.', 'What\'s the last game you played for 20+ hours that has nothing to do with your work? What did it teach you?', 'Cannot speak about contemporary games with specificity. Treats games as work product only.'],
          ['Selflessness', 'Has built the games production bench. Two of their direct reports are ready for senior promotion. Credit on games is visibly distributed.', 'Name two production executives whose careers you\'ve materially shaped. What was your contribution?', 'Centralizes credit. Has not actively developed next-tier production leaders.'],
          ['Innovation', 'Has championed a production approach, business model, or game design choice that the industry hadn\'t tried at scale. Can articulate the resistance.', 'What\'s a production or business approach you championed that wasn\'t standard practice? What was the resistance?', 'Production approach is conventional. Has not championed something genuinely new.'],
          ['Inclusion', 'Their shipped games reflect creators the industry typically underweights. Their production teams\' demographics differ from industry baseline.', 'What\'s the demographic shape of the creative leads on games you\'ve shipped over the last 36 months? How does that compare to industry baseline?', 'Shipped games reflect industry-baseline demographics. No deliberate inclusion mechanism in production hiring.'],
          ['Integrity', 'Reports honest production assessments to leadership, including the games that are in trouble. Doesn\'t soften "this isn\'t working" until it\'s too late.', 'Tell me about a hard truth about a game in production that you delivered to leadership. What was the timing and what was the cost?', 'Smooths over production troubles. Leadership describes their updates as overly optimistic.'],
          ['Impact', 'Their shipped games have moved measurable business outcomes — subscription, retention, brand. They can point to specific titles and their specific decisions.', 'What shipped game has materially moved the business? How do you know it was your production judgment?', 'Cannot point to a specific game where their production judgment produced a measurable business outcome.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their production judgment was visibly raising the bar across Netflix Games — when their picks become the cultural reference for what Netflix games are.',
        debriefPrompts: [
          'What\'s the specific game currently in production that this person would have redirected or killed, and would that be right?',
          'Whose creative relationships in the games industry does this person bring that we can\'t access today?',
          'What\'s the failure mode where this person executes well on the wrong slate, instead of catching that the slate is wrong?',
        ],
        hireSignalSummary: 'Hire if: track record of shipping games at scale, evidence of killing major projects, demonstrated production-team building. No-hire if: production track record is execution-only without creative judgment, no record of developing diverse creative leads, has not shipped under subscription economics.',
      },
    },
  },

  // 18. Senior Talent Partner · IC5 · People/HR
  {
    id: 'senior-talent-partner-ic5',
    roleTitle: 'Senior Talent Partner',
    level: 'IC5',
    fn: 'People/HR',
    aliases: ['senior talent partner', 'senior recruiter', 'staff recruiter', 'lead talent partner', 'senior tech recruiter'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Wide pool but heavily filtered. Estimated 30,000–40,000 senior recruiters in US tech. The Netflix bar (closing senior IC and Staff+ candidates against frontier-lab counterfactuals, partnering with hiring managers as a peer not service-provider) cuts addressable pool to roughly 10%.',
        topCompetitors: ['Stripe', 'Databricks', 'Snowflake', 'Anthropic', 'Roblox'],
        compensation: 'Total comp $200K–$280K (base $150K–$185K, equity $35K–$70K, bonus 10–15%). Netflix cash equivalent $240K–$310K — significantly above broader recruiting industry comp.',
        talentPools: 'Strongest feeders: Stripe Talent Partners, Anthropic recruiting (senior tier), Databricks (Engineering Recruiting), ex-FAANG senior recruiters with executive-search experience. Adjacent: senior agency recruiters from Riviera Partners, True Search, Daversa Partners moving in-house.',
        diversityPipeline: 'AHRMA (Associate of Human Resource Management Affinity), NSHMBA (National Society of Hispanic MBAs) recruiting community, NABA (National Association of Black Accountants) talent acquisition network, NAAAP (National Association of Asian American Professionals) HR community. Underweighted: senior recruiters at executive search firms (Egon Zehnder, Spencer Stuart) considering in-house transition.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Senior talent partners exist but Netflix\'s closing rate against frontier-lab counterfactuals demands an unusual combination of consultative selling, deep technical fluency, and comfort operating without a senior recruiter safety net. Time-to-fill: 3–4 months.',
        },
        sourcingAngles: [
          'Pursue ex-FAANG senior recruiters who have done executive search agency stints — the combo of in-house and external sales chops is rare and high-value.',
          'Engage senior recruiters at retained executive search firms looking for in-house transition for retention/equity reasons.',
          'Build relationships at the ERE Recruiting Conference and Recruitment Innovation events — senior talent partner hiring is community-driven.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows which candidates to push to onsite vs. which to filter out at screen. Has a specific framework for assessing Keeper Test signal early.', 'Walk me through how you assess Keeper Test signal in a 30-minute screen. What\'s your specific framework?', 'Defaults to passing strong-on-paper candidates through. Cannot articulate Keeper Test signal at screen stage.'],
          ['Communication', 'Their candidate engagement is high-context and personalized. Candidates describe them as the best recruiter they\'ve interacted with — even when they don\'t get the offer.', 'Tell me about a candidate you didn\'t hire who became a long-term referral source. What did you do differently?', 'Templated outreach. Candidates describe the experience as standard or impersonal.'],
          ['Curiosity', 'Reads broadly on talent markets, compensation trends, hiring science. Brings non-obvious frameworks to hiring partner conversations.', 'What\'s a framework or piece of research about talent or hiring that\'s changed your practice in the last year? Be specific.', 'Talks about recruiting in industry-standard terms only. Has not absorbed an outside framework.'],
          ['Courage', 'Tells a hiring manager their bar is wrong — too high or too low. Pushes back on a partner who is mid-screen and the candidate is clearly outside the band.', 'Tell me about a hiring manager you actively pushed back on. What was the basis and what happened?', 'Capitulates to hiring manager preferences. Has not blocked a hiring manager call in the last year.'],
          ['Passion', 'Treats recruiting as a craft. Their personal practice — newsletter, podcast, peer learning circle, conference contribution — extends beyond their day job.', 'What recruiting craft do you maintain outside your job? How does it inform your work?', 'Recruiting is purely a job. No personal craft.'],
          ['Selflessness', 'Builds team-level intelligence — calibration sessions, decision archives, hiring playbooks — that the next 5 recruiters use. Mentors junior partners.', 'Tell me about hiring infrastructure you built that benefited the team. What was the trade-off?', 'Builds for their own efficiency only. No durable team-level artifacts.'],
          ['Innovation', 'Has introduced a recruiting practice or sourcing channel that became a team-wide reference. Can articulate the rollout.', 'What recruiting practice did you introduce that became a team standard?', 'Defaults to existing playbooks. Has not introduced a novel practice.'],
          ['Inclusion', 'Their candidate slate consistently exceeds the company\'s diversity baseline. They can point to specific sourcing mechanisms that produce it.', 'What\'s the demographic shape of your candidate slates over the last 24 months? What\'s the mechanism that produces it?', 'Slates reflect the same channels everyone uses. No deliberate inclusion mechanism.'],
          ['Integrity', 'Tells candidates honest feedback after they don\'t get the offer, even when it\'s uncomfortable. Refuses to ghost.', 'Tell me about hard feedback you gave a rejected candidate. What did you say verbatim?', 'Defaults to anodyne rejections. Candidates describe the closure as opaque.'],
          ['Impact', 'Their hires have measurably improved team performance — through Keeper Test ratings 12 months in, through specific business outcomes their hires produced.', 'Tell me about the highest-impact hire of your career. How do you know they were the right call?', 'Talks about volume of hires only. Cannot connect specific hires to team outcomes.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their hires were measurably raising the bar across the org — when their candidate calibration is being copied by other Senior Talent Partners and hiring managers across the company.',
        debriefPrompts: [
          'Would this person\'s arrival surface a specific hiring weakness on our team they\'re uniquely equipped to fix?',
          'Compared to our strongest current Senior Talent Partner, where is this candidate materially stronger?',
          'What\'s the failure mode where this person closes candidates well but doesn\'t calibrate the long-term hiring bar?',
        ],
        hireSignalSummary: 'Hire if: track record of closing candidates against frontier-lab counterfactuals, evidence of pushing back on hiring managers, deliberate diversity sourcing mechanisms. No-hire if: hiring manager-pleaser pattern, no candidates from non-standard channels, cannot articulate Keeper Test signal at screen stage.',
      },
    },
  },

  // 19. Senior Manager FP&A · Senior Manager · Finance
  {
    id: 'senior-manager-fpa',
    roleTitle: 'Senior Manager FP&A',
    level: 'Senior Manager',
    fn: 'Finance',
    aliases: ['senior manager fpa', 'senior manager fp&a', 'senior finance manager', 'sr manager financial planning', 'finance lead'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate. Estimated 6,000–10,000 Senior Manager-level FP&A talent in US tech with 7+ years experience and a track record of partnering with engineering or content business leaders. Netflix-quality (calls out unit economics the C-suite hasn\'t asked about yet, owns long-range planning) cuts addressable pool to roughly 25%.',
        topCompetitors: ['Disney+ (Senior Manager FP&A)', 'Apple Services (Senior Finance Manager)', 'Spotify (Senior Manager FP&A)', 'Stripe (Senior Finance Manager)', 'Roblox (Senior Manager Finance)'],
        compensation: 'Total comp $290K–$380K (base $195K–$235K, equity $70K–$120K, bonus 15–20%). Netflix cash equivalent $340K–$430K.',
        talentPools: 'Strongest feeders: Disney+ Finance, Apple Services Finance, Spotify Finance, Stripe Finance, Roblox Finance. Adjacent: ex-investment-banking VPs (TMT coverage at Goldman, MS, JPM) who transitioned to corporate finance. Top MBA programs (Stanford GSB, Wharton, HBS) 3–5 years post-MBA.',
        diversityPipeline: 'NABA (National Association of Black Accountants), ALPFA (Association of Latino Professionals For America), Ascend Pan-Asian Leaders, Out & Equal finance affinity. Underweighted: senior FP&A talent at international subscription businesses (Spotify Europe, Reliance Jio finance) who would relocate.',
        timeToFillRisk: {
          level: 'Medium',
          rationale: 'Strong FP&A talent exists but Netflix\'s peer-to-business-leader expectation (not service-function-providing-decks) screens out most. Time-to-fill: 3–5 months.',
        },
        sourcingAngles: [
          'Target Senior Manager FP&A at competitor streaming services whose business has been restructured — Disney+ finance post-Bob Iger, Max post-Discovery merger.',
          'Engage ex-TMT investment banking VPs at boutique banks (Allen & Co, LionTree) who have been advising on streaming deals — they understand the business deeply and are open to in-house transitions.',
          'Build relationships at the Streaming Media Finance Conference and TMT-specific finance forums.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Calls out unit economics the C-suite hasn\'t asked about yet. Knows when to push back on Finance leadership\'s forecast vs. when to align.', 'Tell me about a unit economic concern you surfaced before your CFO asked about it. What did you see?', 'Defaults to producing the deck that was requested. Cannot point to an unprompted analytical contribution.'],
          ['Communication', 'Their financial memos and forecasts are read by business leaders, not just by Finance. Their writing makes financial trade-offs legible to non-finance audiences.', 'Show me a financial memo of yours that influenced a business decision outside Finance. What was the framing?', 'Communicates in Finance jargon. Business partners describe their analysis as inaccessible.'],
          ['Curiosity', 'Engages with the business beyond their P&L lane — content economics, technology trends, regulatory shifts. Their forecasts reflect sources their peers haven\'t read.', 'What\'s a domain outside Finance that you\'ve developed real depth in over the last 18 months? Why?', 'Finance literature only. Has not engaged with broader business sources.'],
          ['Courage', 'Pushes back on a VP\'s forecast assumption when the data doesn\'t support it. Tells a business partner that their project ROI math is wrong.', 'Tell me about a forecast assumption you pushed back on with senior leadership. What was the cost?', 'Validates whatever assumptions are given. Has not pushed back on a senior leader\'s number.'],
          ['Passion', 'Engages with the underlying business at a level of detail most Finance partners don\'t — knows the content slate, knows the engineering roadmap, knows the user behavior.', 'Tell me about a non-Finance area of our business you\'ve developed real depth in. How did you develop it?', 'Business knowledge is shallow. Cannot speak to specifics outside their P&L lane.'],
          ['Selflessness', 'Has built tooling, analytical frameworks, or processes that the broader Finance team uses. Has actively mentored junior Finance team members.', 'Tell me about Finance infrastructure or frameworks you\'ve built that benefited the broader team. What was the trade-off?', 'Bespoke analysis for their projects only. No durable team-level artifacts.'],
          ['Innovation', 'Has introduced an analytical approach, forecasting method, or business framework that the Finance team adopted. Can articulate the rollout.', 'What analytical approach did you introduce that became a Finance team standard?', 'Defaults to standard FP&A methods. Has not introduced something novel.'],
          ['Inclusion', 'Has actively elevated the careers of underrepresented Finance team members. Their direct reports\' demographics differ from the function\'s baseline.', 'Name an underrepresented Finance team member whose career you\'ve actively shaped. What was your contribution?', 'Direct reports reflect function baseline. No deliberate inclusion mechanism in their team-building.'],
          ['Integrity', 'Reports honest financial reality including the inconvenient truths. Refuses to massage forecasts to match the narrative leadership wants.', 'Tell me about a time you delivered an unwelcome financial message to senior leadership. What did you say verbatim?', 'Smooths over inconvenient financial truths. Has not delivered a hard financial message to leadership.'],
          ['Impact', 'Their analyses have led to specific business decisions — content investment redirects, headcount restructuring, business-model adjustments. They can name the decisions.', 'What specific business decisions in the last year happened because of your analysis?', 'Analyses produce decks but not decisions. Cannot point to specific business actions traced to their work.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their financial judgment was visibly shaping business decisions across the company — when business leaders are asking for them by name instead of asking Finance generically.',
        debriefPrompts: [
          'What\'s the specific business decision currently being made on incomplete financial analysis that this person would catch?',
          'Compared to our strongest current Senior Manager FP&A, where is this candidate materially stronger?',
          'What\'s the failure mode where this person produces excellent decks that don\'t move decisions?',
        ],
        hireSignalSummary: 'Hire if: track record of unprompted analytical contributions, evidence of pushing back on senior leadership assumptions, history of analyses producing specific business decisions. No-hire if: service-function pattern, no track record of independent analytical direction, cannot name business decisions their work produced.',
      },
    },
  },

  // 20. Director of Brand Marketing · Director · Marketing
  {
    id: 'director-brand-marketing',
    roleTitle: 'Director of Brand Marketing',
    level: 'Director',
    fn: 'Marketing',
    aliases: ['director brand marketing', 'director of brand', 'head of brand', 'brand marketing director', 'director consumer marketing'],
    brief: {
      marketIntelligence: {
        talentSupply: 'Moderate. Estimated 3,500–5,500 globally with 10+ years of consumer brand marketing leadership at scale and a track record of moving brand metrics (consideration, preference, perceived quality) measurably. Netflix-quality (works at the intersection of content strategy and consumer culture, no agency-dependent brand work) cuts the addressable pool to roughly 20%.',
        topCompetitors: ['Apple (Brand Marketing)', 'Nike (Brand)', 'Disney+ (Marketing)', 'Spotify (Brand Marketing)', 'Airbnb (Brand)'],
        compensation: 'Total comp $440K–$620K (base $290K–$345K, equity $100K–$200K, bonus 20–25%). Netflix cash equivalent $520K–$700K.',
        talentPools: 'Strongest feeders: Apple Brand Marketing, Nike Brand, Disney/Disney+ Marketing, Spotify Brand, Airbnb Brand. Adjacent: senior creative directors at top brand agencies (Wieden+Kennedy, R/GA, Mother) considering in-house transition. Ex-CMO talent from DTC brands (Allbirds, Glossier, Casper) at the right scale stage.',
        diversityPipeline: 'AAF Mosaic Council (American Advertising Federation), Multicultural Marketing Forum, NABJ (National Association of Black Journalists) marketing track, ColorComm marketing executive network. Underweighted: senior brand marketers from non-US markets (UK, Brazil, India, Mexico) with cross-cultural brand expertise.',
        timeToFillRisk: {
          level: 'High',
          rationale: 'Director-level brand marketing talent moves rarely (every 3–5 years) and Netflix\'s brand-as-content-and-product approach (not brand-as-advertising) screens out classical brand executives. Time-to-fill: 6–9 months.',
        },
        sourcingAngles: [
          'Engage senior brand marketing leaders at competitor streamers whose brand direction has shifted (post-merger, post-CMO-change orgs).',
          'Pursue creative directors at top agencies who have done significant work on Netflix-adjacent brands and want operator-level scope.',
          'Build relationships at Cannes Lions and SXSW Brand sessions — Director-level brand hires are multi-year relationships.',
        ],
      },
      cultureCalibration: {
        dimensions: dims([
          ['Judgment', 'Knows when a brand campaign should be paid-media-driven vs. earned-media-driven vs. product-experience-driven. Doesn\'t default to "let\'s buy media."', 'Tell me about a brand moment you championed that didn\'t involve traditional paid media. What were you optimizing for?', 'Defaults to paid media for every brand initiative. Cannot articulate when paid is the wrong choice.'],
          ['Communication', 'Their brand strategy memos move cross-functional partners — product, content, comms — without needing kickoff meetings. Writes brand as a business strategy, not a creative brief.', 'Show me a brand strategy memo that aligned product and content teams. What was the framing?', 'Communicates in brand-agency-deck format. Cross-functional partners describe the work as creative-side without business clarity.'],
          ['Curiosity', 'Engages broadly with culture — film, fashion, internet subcultures, sports, music. Their brand strategy reflects sources their peers haven\'t engaged with.', 'What\'s a piece of culture from outside marketing that\'s shaped your last year of brand work? Be specific.', 'Marketing literature only. Has not engaged with broader culture sources.'],
          ['Courage', 'Has killed a campaign in development when it wasn\'t right, despite sunk cost. Has pushed back on a CMO\'s preferred direction with data.', 'Tell me about a campaign you killed despite executive support. What was the basis?', 'Has not killed a campaign over executive direction. Defers strategic calls to skip-level.'],
          ['Passion', 'Engages with brand as a craft and culture as a passion. Has a deep, articulate view of why specific brands resonate beyond commercial framing.', 'Walk me through a brand outside Netflix\'s competitive set whose strategy you find most interesting. Why specifically?', 'Cannot articulate why specific brands work beyond surface-level. Treats brand as paid-media output.'],
          ['Selflessness', 'Has built the brand marketing bench. Two of their direct reports are ready for promotion. Credit on campaigns is visibly distributed.', 'Name two brand marketers whose careers you\'ve actively shaped. What was your specific contribution?', 'Centralizes credit on campaigns. Has not actively developed next-tier brand leaders.'],
          ['Innovation', 'Has launched a brand approach, channel, or campaign format that became a reference for the industry or for Netflix. Can articulate the resistance they overcame.', 'What brand approach did you champion that wasn\'t standard practice? What was the resistance?', 'Default brand approaches only. Has not championed something genuinely new.'],
          ['Inclusion', 'Their brand work reflects audiences and creators the industry typically underweights. Their agency and creative partner relationships skew more diverse than industry baseline.', 'What\'s the demographic shape of the creative partners and agencies you\'ve worked with over the last 36 months? How does that compare to industry baseline?', 'Agency partnerships reflect industry baseline. No deliberate inclusion mechanism in their creative partner relationships.'],
          ['Integrity', 'Reports honest campaign results — including the ones that didn\'t move brand metrics. Refuses to spin campaigns post-launch.', 'Tell me about a brand campaign you wrote a candid post-mortem on. What did you say?', 'Spins campaign post-mortems toward positive narrative. Has not written a candid retrospective on a flat campaign.'],
          ['Impact', 'Their brand work has moved measurable brand metrics — consideration, preference, perceived quality, brand-driven subscriber acquisition. They can point to specific campaigns.', 'What\'s a brand campaign of yours that materially moved brand metrics? How do you know it was your campaign?', 'Talks about creative quality or awards. Cannot connect to brand metric movement.'],
        ]),
        keeperTest: 'I would fight hard to keep this person if their brand instincts were visibly shaping how the company shows up culturally — when their work becomes the cultural reference for what the Netflix brand means.',
        debriefPrompts: [
          'What\'s the specific brand opportunity currently being underplayed that this person would capitalize on?',
          'Compared to our strongest current Director of Brand Marketing, where is this candidate materially stronger?',
          'What\'s the failure mode where this person produces creatively impressive work that doesn\'t move brand metrics?',
        ],
        hireSignalSummary: 'Hire if: track record of moving brand metrics, evidence of killing campaigns over executive direction, history of culturally-resonant brand work beyond paid media. No-hire if: brand work is agency-dependent, no record of moving brand metrics, cannot connect creative output to measurable brand outcomes.',
      },
    },
  },
];
