import React, { useState, useEffect, useRef, useMemo } from 'react';
import { findBestMatch } from '@/lib/match';
import { FIXTURES } from '@/lib/fixtures';
import { getSourcingPlaybook } from '@/lib/sourcing-playbooks';

/**
 * Netflix Talent Brief
 * A Claude-powered Talent Intelligence + Culture Calibration prototype.
 *
 * Runs in two modes:
 *   - Demo (default): serves curated fixtures via fuzzy matching. Zero API cost.
 *   - Live: calls the Anthropic Messages API with the web_search tool.
 *
 * Demo mode preserves the full loading UX so the experience is visually
 * identical to a live API call. Mode is toggled from the header.
 */

const NETFLIX_RED = '#E50914';

const FUNCTIONS = [
  'Engineering',
  'Product',
  'Design',
  'Content',
  'Finance',
  'Legal',
  'People/HR',
  'Marketing',
  'Operations',
  'Data Science',
  'Games',
];

const LEVELS = ['IC4', 'IC5', 'IC6', 'Manager', 'Senior Manager', 'Director'];

const CULTURE_DIMENSIONS = [
  'Judgment',
  'Communication',
  'Curiosity',
  'Courage',
  'Passion',
  'Selflessness',
  'Innovation',
  'Inclusion',
  'Integrity',
  'Impact',
];

const LOADING_MESSAGES = [
  'Searching live market data...',
  'Synthesizing intelligence...',
  'Calibrating to Netflix culture...',
];

const SYSTEM_PROMPT =
  "You are a Senior Talent Intelligence Analyst at Netflix with deep expertise in Netflix's talent philosophy, culture values, and hiring practices. Netflix hires only 'dream team' players — exceptional performers who raise the bar for everyone around them. You have access to web search and should use it to pull current, live market data before generating any intelligence. Never fabricate statistics. If live data is unavailable for a data point, say so and provide a directional estimate with clear reasoning. Your output should be immediately usable by a Netflix recruiter or hiring manager walking into a role kickoff meeting. Be specific, concrete, and ruthlessly practical — no generic advice.";

function buildUserPrompt({ roleTitle, level, fn }) {
  return `Generate a Netflix Talent Brief for the following role:

Role Title: ${roleTitle}
Level: ${level}
Function: ${fn}

Step 1: Use the web_search tool to pull current, live market data for this role — compensation benchmarks, active competitor hiring, talent pool depth, and feeder companies. Cite directional sources in your reasoning where helpful.

Step 2: Return your full brief as a single JSON object inside ONE \`\`\`json code block. No commentary outside the code block. The JSON must match this schema exactly (all keys required):

{
  "marketIntelligence": {
    "talentSupply": "How deep is this pool nationally and globally, with concrete numbers where possible.",
    "topCompetitors": ["company1", "company2", "company3", "company4", "company5"],
    "compensation": "Estimated market total comp range in USD at this level, with reasoning.",
    "talentPools": "Key feeder companies and where these people typically come from.",
    "diversityPipeline": "Concrete underrepresented talent sources, communities, and orgs for this role.",
    "timeToFillRisk": { "level": "Low | Medium | High", "rationale": "One or two sentence rationale." },
    "sourcingAngles": ["specific angle 1", "specific angle 2", "specific angle 3"]
  },
  "cultureCalibration": {
    "dimensions": [
      ${CULTURE_DIMENSIONS.map(
        (d) =>
          `{ "name": "${d}", "excellent": "What excellent ${d} looks like in THIS specific role.", "interviewQuestion": "One behavioral interview question tied to ${d}.", "redFlag": "One brilliant-jerk disqualifying pattern for ${d}." }`
      ).join(',\n      ')}
    ],
    "keeperTest": "Complete the sentence: 'I would fight hard to keep this person if...' — role-specific and concrete.",
    "debriefPrompts": ["prompt 1", "prompt 2", "prompt 3"],
    "hireSignalSummary": "Concise hire / no-hire signal summary specific to this role."
  }
}

Be specific to a ${level} ${roleTitle} in ${fn}. Every line should be useful to a Netflix hiring manager walking into a kickoff. No generic advice. No filler.`;
}

function detectEnvKey() {
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      return (
        process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ||
        process.env.REACT_APP_ANTHROPIC_API_KEY ||
        ''
      );
    }
  } catch (_) {}
  return '';
}

async function callClaude({ roleTitle, level, fn, apiKey }) {
  const userPrompt = buildUserPrompt({ roleTitle, level, fn });
  const messages = [{ role: 'user', content: userPrompt }];
  const allTextBlocks = [];
  const MAX_TURNS = 5;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages,
      }),
    });

    if (!response.ok) {
      let detail = '';
      try {
        detail = await response.text();
      } catch (_) {}
      throw new Error(
        `Anthropic API returned ${response.status}. ${detail.slice(0, 400)}`
      );
    }

    const data = await response.json();
    const content = Array.isArray(data.content) ? data.content : [];
    for (const block of content) {
      if (block && block.type === 'text' && typeof block.text === 'string') {
        allTextBlocks.push(block.text);
      }
    }

    if (data.stop_reason === 'pause_turn') {
      messages.push({ role: 'assistant', content });
      continue;
    }
    break;
  }

  return allTextBlocks.join('\n\n').trim();
}

function parseBrief(text) {
  if (!text) return null;
  const fence = text.match(/```json\s*([\s\S]*?)```/i);
  const candidates = [];
  if (fence) candidates.push(fence[1]);
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    candidates.push(text.slice(start, end + 1));
  }
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (parsed && parsed.marketIntelligence && parsed.cultureCalibration) {
        return parsed;
      }
    } catch (_) {}
  }
  return null;
}

function briefToPlainText(brief, meta, playbook) {
  const mi = brief.marketIntelligence || {};
  const cc = brief.cultureCalibration || {};
  const ttf = mi.timeToFillRisk || {};
  const lines = [];
  lines.push('NETFLIX TALENT BRIEF');
  lines.push(`${meta.roleTitle} · ${meta.level} · ${meta.fn}`);
  lines.push('');
  lines.push('==============================================');
  lines.push('SECTION A — TALENT MARKET INTELLIGENCE');
  lines.push('==============================================');
  lines.push('');
  lines.push('TALENT SUPPLY');
  lines.push(mi.talentSupply || '—');
  lines.push('');
  lines.push('TOP 5 COMPETITORS');
  (mi.topCompetitors || []).forEach((c, i) => lines.push(`${i + 1}. ${c}`));
  lines.push('');
  lines.push('COMPENSATION SIGNAL');
  lines.push(mi.compensation || '—');
  lines.push('');
  lines.push('TALENT POOLS / FEEDER COMPANIES');
  lines.push(mi.talentPools || '—');
  lines.push('');
  lines.push('DIVERSITY PIPELINE');
  lines.push(mi.diversityPipeline || '—');
  lines.push('');
  lines.push(`TIME-TO-FILL RISK: ${ttf.level || '—'}`);
  lines.push(ttf.rationale || '');
  lines.push('');
  lines.push('SOURCING ANGLES');
  (mi.sourcingAngles || []).forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  if (playbook) {
    lines.push('==============================================');
    lines.push('SECTION B — SOURCING PLAYBOOK');
    lines.push('==============================================');
    lines.push('');
    (playbook.booleanStrings || []).forEach((s) => {
      lines.push(`--- ${s.platform.toUpperCase()} ---`);
      lines.push(s.query);
      lines.push(`Why: ${s.rationale}`);
      lines.push('');
    });
    lines.push('WHERE TO SOURCE THIS TALENT');
    (playbook.sourcingSites || []).forEach((site, i) => {
      lines.push(`${i + 1}. ${site.name} — ${site.why}`);
    });
    lines.push('');
  }
  lines.push('==============================================');
  lines.push('SECTION C — TAILORED INTERVIEW GUIDE');
  lines.push('==============================================');
  lines.push('');
  (cc.dimensions || []).forEach((d) => {
    lines.push(`--- ${String(d.name || '').toUpperCase()} ---`);
    lines.push(`Excellent looks like: ${d.excellent || '—'}`);
    lines.push(`Interview question: ${d.interviewQuestion || '—'}`);
    lines.push(`Red flag: ${d.redFlag || '—'}`);
    lines.push('');
  });
  lines.push('KEEPER TEST');
  lines.push(cc.keeperTest || '—');
  lines.push('');
  lines.push('DEBRIEF PROMPTS');
  (cc.debriefPrompts || []).forEach((p, i) => lines.push(`${i + 1}. ${p}`));
  lines.push('');
  lines.push('HIRE / NO-HIRE SIGNAL SUMMARY');
  lines.push(cc.hireSignalSummary || '—');
  return lines.join('\n');
}

function SectionHeader({ kicker, title }) {
  return (
    <div className="mb-6">
      <div
        className="text-xs uppercase tracking-[0.25em] font-semibold mb-2"
        style={{ color: NETFLIX_RED }}
      >
        {kicker}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
      <div
        className="mt-3 h-[2px] w-12"
        style={{ background: NETFLIX_RED }}
      />
    </div>
  );
}

function StatCard({ label, children }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
      <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
        {label}
      </div>
      <div className="text-zinc-100 leading-relaxed text-[15px]">
        {children}
      </div>
    </div>
  );
}

function RiskBadge({ level }) {
  const normalized = String(level || '').toLowerCase();
  const styles =
    normalized === 'high'
      ? { background: 'rgba(229,9,20,0.15)', color: '#FF6B6B', border: '1px solid rgba(229,9,20,0.4)' }
      : normalized === 'medium'
      ? { background: 'rgba(234,179,8,0.12)', color: '#FACC15', border: '1px solid rgba(234,179,8,0.35)' }
      : { background: 'rgba(34,197,94,0.12)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.35)' };
  return (
    <span
      className="inline-flex items-center text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
      style={styles}
    >
      {level || 'Unknown'}
    </span>
  );
}

function CultureCard({ dimension }) {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{dimension.name}</h3>
        <div
          className="h-1.5 w-8 rounded-full"
          style={{ background: NETFLIX_RED }}
        />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
          Excellent looks like
        </div>
        <p className="text-sm text-zinc-100 leading-relaxed">
          {dimension.excellent}
        </p>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
          Interview question
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed italic">
          "{dimension.interviewQuestion}"
        </p>
      </div>
      <div>
        <div
          className="text-[11px] uppercase tracking-wider font-semibold mb-1"
          style={{ color: NETFLIX_RED }}
        >
          Red flag
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">
          {dimension.redFlag}
        </p>
      </div>
    </div>
  );
}

export default function NetflixTalentBrief() {
  const [roleTitle, setRoleTitle] = useState('Staff Machine Learning Engineer');
  const [level, setLevel] = useState('IC5');
  const [fn, setFn] = useState('Engineering');

  const envKey = useMemo(() => detectEnvKey(), []);
  const [apiKey, setApiKey] = useState(envKey || '');
  const [showSettings, setShowSettings] = useState(false);

  // 'demo' is the default — zero API cost, served from curated fixtures.
  // 'live' calls the Anthropic API (requires apiKey).
  const [mode, setMode] = useState('demo');

  const [loading, setLoading] = useState(false);
  const [statusIdx, setStatusIdx] = useState(0);
  const [error, setError] = useState('');
  const [rawOutput, setRawOutput] = useState('');
  const [brief, setBrief] = useState(null);
  const [playbook, setPlaybook] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedStringIdx, setCopiedStringIdx] = useState(-1);

  const outputRef = useRef(null);

  useEffect(() => {
    if (!loading) return;
    setStatusIdx(0);
    const id = setInterval(() => {
      setStatusIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2400);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (brief && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [brief]);

  const canSubmit =
    !loading &&
    roleTitle.trim().length > 0 &&
    level.trim().length > 0 &&
    fn.trim().length > 0 &&
    (mode === 'demo' || apiKey.trim().length > 0);

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setBrief(null);
    setPlaybook(null);
    setRawOutput('');
    setMatchInfo(null);
    setCopied(false);
    setCopiedStringIdx(-1);

    if (mode === 'demo') {
      try {
        // Hold the loading state long enough to cycle through the three
        // status messages — visual parity with a live API call.
        await new Promise((resolve) => setTimeout(resolve, 2600));
        const match = findBestMatch({
          roleTitle: roleTitle.trim(),
          level: level.trim(),
          fn: fn.trim(),
        });
        setBrief(match.fixture.brief);
        setPlaybook(getSourcingPlaybook(match.fixture.id));
        setMatchInfo({
          fixtureRole: match.fixture.roleTitle,
          fixtureLevel: match.fixture.level,
          fixtureFn: match.fixture.fn,
          isExactMatch: match.isExactMatch,
          isStrongMatch: match.isStrongMatch,
        });
      } catch (err) {
        setError('Demo mode failed to match a fixture. This should not happen — please report.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const text = await callClaude({
        roleTitle: roleTitle.trim(),
        level: level.trim(),
        fn: fn.trim(),
        apiKey: apiKey.trim(),
      });
      setRawOutput(text);
      const parsed = parseBrief(text);
      if (!parsed) {
        setError(
          'The model returned output that could not be parsed as the expected JSON brief. Raw output is shown below.'
        );
      } else {
        setBrief(parsed);
      }
    } catch (err) {
      setError(
        (err && err.message) ||
          'Something went wrong calling the Anthropic API. Check your API key and network and try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!brief) return;
    const text = briefToPlainText(brief, { roleTitle, level, fn }, playbook);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
      document.body.removeChild(ta);
    }
  }

  async function copyString(text, idx) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
    }
    setCopiedStringIdx(idx);
    setTimeout(() => setCopiedStringIdx((i) => (i === idx ? -1 : i)), 1500);
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                Netflix Talent Brief
              </h1>
              <div
                className="mt-3 h-[3px] w-24"
                style={{ background: NETFLIX_RED }}
              />
              <p className="mt-4 text-zinc-300 text-sm md:text-base max-w-3xl leading-relaxed">
                A Talent Intelligence tool for Netflix recruiters and hiring managers: enter any role and instantly get a kickoff-ready brief — live market intelligence, a Boolean-ready sourcing playbook, and interview guidance tailored to that specific role and level.{' '}
                This demo is preloaded with <span className="text-white font-semibold">20 of Netflix's most frequent and demanding hires</span>; the same architecture, powered by Claude with web search, scales to every role across every function.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                  style={
                    mode === 'demo'
                      ? { background: 'rgba(34,197,94,0.12)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.35)' }
                      : { background: 'rgba(229,9,20,0.12)', color: '#FF6B6B', border: '1px solid rgba(229,9,20,0.4)' }
                  }
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: mode === 'demo' ? '#4ADE80' : NETFLIX_RED }}
                  />
                  {mode === 'demo' ? 'Demo mode · cached fixtures' : 'Live API · Claude calls'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowSettings((s) => !s)}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-4"
              type="button"
            >
              {showSettings ? 'Hide settings' : 'Settings'}
            </button>
          </div>
        </header>

        {/* Settings (collapsible): mode toggle + API key */}
        {showSettings && (
          <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Mode
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('demo')}
                  className={
                    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ' +
                    (mode === 'demo'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200')
                  }
                >
                  Demo (free)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('live')}
                  className={
                    'px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ' +
                    (mode === 'live'
                      ? 'bg-zinc-800 border-zinc-700 text-white'
                      : 'bg-transparent border-zinc-800 text-zinc-400 hover:text-zinc-200')
                  }
                >
                  Live API
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500">
                Demo serves curated fixtures via fuzzy matching — instant and zero cost.
                Live calls Claude with web_search — ~$0.05–$0.20 per brief.
              </p>
            </div>
            {mode === 'live' && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
                />
                <p className="mt-2 text-[11px] text-zinc-500">
                  Stored only in component memory for this session.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 md:p-6 mb-10"
        >
          <div className="mb-5">
            <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Pick from {FIXTURES.length} included roles
            </label>
            <select
              value=""
              onChange={(e) => {
                const f = FIXTURES.find((x) => x.id === e.target.value);
                if (f) {
                  setRoleTitle(f.roleTitle);
                  setLevel(f.level);
                  setFn(f.fn);
                }
              }}
              className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600"
            >
              <option value="">— Choose a preloaded role to autofill —</option>
              {FIXTURES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.roleTitle} · {f.level} · {f.fn}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-zinc-500">
              Or type any role below — the matcher will serve the closest cached brief.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Staff Machine Learning Engineer"
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                Function
              </label>
              <select
                value={fn}
                onChange={(e) => setFn(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-zinc-600"
              >
                {FUNCTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full md:w-auto px-8 py-3 rounded-lg font-semibold text-white tracking-wide transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: NETFLIX_RED }}
          >
            {loading ? 'Generating...' : 'Generate Brief'}
          </button>
          {mode === 'live' && !apiKey && (
            <p className="mt-3 text-xs text-zinc-500">
              Live mode requires an Anthropic API key. Open "Settings" to add one,
              or switch to Demo mode for zero-cost cached briefs.
            </p>
          )}
        </form>

        {/* Loading */}
        {loading && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 mb-10 flex items-center gap-4">
            <div className="relative w-3 h-3">
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: NETFLIX_RED, opacity: 0.7 }}
              />
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: NETFLIX_RED }}
              />
            </div>
            <div className="text-zinc-200 animate-pulse">
              {LOADING_MESSAGES[statusIdx]}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="border rounded-2xl p-5 mb-10"
            style={{
              background: 'rgba(229,9,20,0.08)',
              borderColor: 'rgba(229,9,20,0.4)',
            }}
          >
            <div
              className="text-xs uppercase tracking-wider font-semibold mb-1"
              style={{ color: NETFLIX_RED }}
            >
              Error
            </div>
            <p className="text-sm text-zinc-100 leading-relaxed">{error}</p>
            {rawOutput && (
              <details className="mt-4">
                <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-200">
                  Show raw model output
                </summary>
                <pre className="mt-3 text-xs text-zinc-300 whitespace-pre-wrap bg-black/60 border border-zinc-800 rounded-lg p-3 max-h-96 overflow-auto">
                  {rawOutput}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Output */}
        {brief && !loading && (
          <div ref={outputRef} className="space-y-20">
            {/* Brief meta */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-zinc-800">
              <div>
                <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                  Brief for
                </div>
                <div className="text-lg md:text-xl font-bold text-white">
                  {roleTitle}{' '}
                  <span className="text-zinc-500 font-normal">·</span>{' '}
                  {level}{' '}
                  <span className="text-zinc-500 font-normal">·</span> {fn}
                </div>
                {matchInfo && !matchInfo.isExactMatch && (
                  <div className="mt-2 text-xs text-zinc-500">
                    Closest cached match:{' '}
                    <span className="text-zinc-300">
                      {matchInfo.fixtureRole} · {matchInfo.fixtureLevel} · {matchInfo.fixtureFn}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
                {mode === 'demo' ? 'Demo · cached fixture' : 'Live · Claude API'}
              </div>
            </div>

            {/* Section A: Market Intelligence */}
            <section>
              <SectionHeader
                kicker="Section A"
                title="Talent Market Intelligence"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard label="Talent Supply">
                  {brief.marketIntelligence.talentSupply}
                </StatCard>
                <StatCard label="Compensation Signal">
                  {brief.marketIntelligence.compensation}
                </StatCard>
                <StatCard label="Top 5 Competitors Hiring">
                  <ol className="space-y-1.5">
                    {(brief.marketIntelligence.topCompetitors || []).map(
                      (c, i) => (
                        <li
                          key={i}
                          className="flex gap-3 items-baseline"
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: NETFLIX_RED }}
                          >
                            0{i + 1}
                          </span>
                          <span>{c}</span>
                        </li>
                      )
                    )}
                  </ol>
                </StatCard>
                <StatCard label="Talent Pools & Feeder Companies">
                  {brief.marketIntelligence.talentPools}
                </StatCard>
                <StatCard label="Diversity Pipeline">
                  {brief.marketIntelligence.diversityPipeline}
                </StatCard>
                <StatCard label="Time-to-Fill Risk">
                  <div className="flex items-center gap-3 mb-2">
                    <RiskBadge
                      level={
                        brief.marketIntelligence.timeToFillRisk &&
                        brief.marketIntelligence.timeToFillRisk.level
                      }
                    />
                  </div>
                  <div className="text-sm text-zinc-300">
                    {brief.marketIntelligence.timeToFillRisk &&
                      brief.marketIntelligence.timeToFillRisk.rationale}
                  </div>
                </StatCard>
              </div>
              <div className="mt-4">
                <StatCard label="Sourcing Angles to Prioritize">
                  <ol className="space-y-2">
                    {(brief.marketIntelligence.sourcingAngles || []).map(
                      (s, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="text-xs font-bold pt-1"
                            style={{ color: NETFLIX_RED }}
                          >
                            0{i + 1}
                          </span>
                          <span>{s}</span>
                        </li>
                      )
                    )}
                  </ol>
                </StatCard>
              </div>
            </section>

            {/* Section B: Sourcing Playbook */}
            {playbook && (
              <section>
                <SectionHeader
                  kicker="Section B"
                  title="Sourcing Playbook"
                />
                <p className="text-zinc-400 text-sm mb-6 -mt-2 max-w-3xl">
                  Boolean and X-Ray search strings ready to paste into LinkedIn Recruiter or Google,
                  plus the specific sourcing channels that work for this talent shape. Copy any string with one click.
                </p>

                {/* Boolean strings */}
                <div className="space-y-4 mb-8">
                  {(playbook.booleanStrings || []).map((s, i) => (
                    <div
                      key={i}
                      className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <span
                          className="inline-flex items-center text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: 'rgba(229,9,20,0.10)',
                            color: '#FF9999',
                            border: '1px solid rgba(229,9,20,0.30)',
                          }}
                        >
                          {s.platform}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyString(s.query, i)}
                          className="text-xs font-semibold text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-md px-3 py-1 transition-colors"
                        >
                          {copiedStringIdx === i ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="text-[13px] text-zinc-100 bg-black/60 border border-zinc-800 rounded-lg p-3 whitespace-pre-wrap break-words font-mono leading-relaxed">{s.query}</pre>
                      <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                        <span className="text-zinc-500 font-semibold uppercase tracking-wider text-[10px] mr-1">Why</span>
                        {s.rationale}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Sourcing sites */}
                <StatCard label="Where to Source This Talent">
                  <ul className="space-y-3">
                    {(playbook.sourcingSites || []).map((site, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="text-xs font-bold pt-0.5 shrink-0"
                          style={{ color: NETFLIX_RED, minWidth: '1.5rem' }}
                        >
                          0{i + 1}
                        </span>
                        <div>
                          <div className="text-zinc-100 font-semibold text-[15px]">{site.name}</div>
                          <div className="text-zinc-400 text-sm leading-relaxed">{site.why}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </StatCard>
              </section>
            )}

            {/* Section C: Tailored Interview Guide */}
            <section>
              <SectionHeader
                kicker="Section C"
                title="Tailored Interview Guide"
              />
              <p className="text-zinc-400 text-sm mb-6 -mt-2 max-w-3xl">
                Behavioral questions, red flags, and debrief prompts tailored to a{' '}
                <span className="text-white font-semibold">{roleTitle}</span> at the{' '}
                <span className="text-white font-semibold">{level}</span> level — organized by Netflix's 10 culture dimensions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(brief.cultureCalibration.dimensions || []).map((d, i) => (
                  <CultureCard key={i} dimension={d} />
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-5 border"
                  style={{
                    background: 'rgba(229,9,20,0.06)',
                    borderColor: 'rgba(229,9,20,0.35)',
                  }}
                >
                  <div
                    className="text-xs uppercase tracking-wider font-semibold mb-2"
                    style={{ color: NETFLIX_RED }}
                  >
                    Keeper Test
                  </div>
                  <p className="text-zinc-100 leading-relaxed">
                    {brief.cultureCalibration.keeperTest}
                  </p>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                  <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
                    Hire / No-Hire Signal Summary
                  </div>
                  <p className="text-zinc-100 leading-relaxed">
                    {brief.cultureCalibration.hireSignalSummary}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <StatCard label="Calibration Debrief Prompts">
                  <ol className="space-y-2">
                    {(brief.cultureCalibration.debriefPrompts || []).map(
                      (p, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="text-xs font-bold pt-1"
                            style={{ color: NETFLIX_RED }}
                          >
                            0{i + 1}
                          </span>
                          <span>{p}</span>
                        </li>
                      )
                    )}
                  </ol>
                </StatCard>
              </div>
            </section>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-zinc-900 text-center">
          <p className="text-xs text-zinc-600">
            Built as a candidate prototype — not affiliated with Netflix, Inc.
          </p>
        </footer>
      </div>

      {/* Sticky Copy button */}
      {brief && !loading && (
        <button
          onClick={handleCopy}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 px-5 py-3 rounded-full font-semibold text-white shadow-lg hover:scale-[1.03] transition-transform"
          style={{
            background: NETFLIX_RED,
            boxShadow: '0 10px 30px -10px rgba(229,9,20,0.6)',
          }}
        >
          {copied ? '✓ Copied' : 'Copy Brief'}
        </button>
      )}
    </div>
  );
}
