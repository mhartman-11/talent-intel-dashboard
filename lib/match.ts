import { FIXTURES, Fixture } from './fixtures';

export interface BriefQuery {
  roleTitle: string;
  level: string;
  fn: string;
}

const STOPWORDS = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'for', 'to', 'in', 'on', 'at',
  'i', 'ii', 'iii', 'iv',
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1)
    .filter((t) => !STOPWORDS.has(t));
}

function normalizeLevel(level: string): string {
  return level.trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeFn(fn: string): string {
  return fn.trim().toLowerCase().replace(/[\/\s]+/g, ' ');
}

interface ScoredFixture {
  fixture: Fixture;
  score: number;
  breakdown: {
    fn: number;
    level: number;
    role: number;
    exact: number;
  };
}

export function scoreFixture(query: BriefQuery, fixture: Fixture): ScoredFixture {
  const breakdown = { fn: 0, level: 0, role: 0, exact: 0 };

  if (normalizeFn(query.fn) === normalizeFn(fixture.fn)) breakdown.fn = 10;

  if (normalizeLevel(query.level) === normalizeLevel(fixture.level)) {
    breakdown.level = 8;
  }

  const qTokens = new Set(tokenize(query.roleTitle));
  const fTokens = new Set([
    ...tokenize(fixture.roleTitle),
    ...fixture.aliases.flatMap(tokenize),
  ]);

  let overlap = 0;
  for (const t of qTokens) if (fTokens.has(t)) overlap++;

  const denom = Math.max(qTokens.size, fTokens.size, 1);
  breakdown.role = Math.min(15, Math.round((overlap / denom) * 15) + overlap);

  if (query.roleTitle.trim().toLowerCase() === fixture.roleTitle.toLowerCase()) {
    breakdown.exact = 5;
  }

  const score = breakdown.fn + breakdown.level + breakdown.role + breakdown.exact;
  return { fixture, score, breakdown };
}

export interface MatchResult {
  fixture: Fixture;
  score: number;
  isExactMatch: boolean;
  isStrongMatch: boolean;
}

export function findBestMatch(query: BriefQuery): MatchResult {
  const scored = FIXTURES.map((f) => scoreFixture(query, f));
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0];

  const isExactMatch =
    top.breakdown.exact > 0 &&
    top.breakdown.level > 0 &&
    top.breakdown.fn > 0;

  const isStrongMatch = top.score >= 18;

  return {
    fixture: top.fixture,
    score: top.score,
    isExactMatch,
    isStrongMatch,
  };
}
