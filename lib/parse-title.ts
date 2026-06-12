/**
 * Best-effort parser for diecast product titles from a barcode database.
 *
 * Barcode lookups return a single free-text title (e.g.
 * "Mattel 2024 HW Showroom Camaro Concept 1:64 Die-Cast"). There are no
 * structured year / series / model fields, so we extract what we can to
 * pre-fill the add form — the user can correct anything. Colour and base code
 * are physical attributes stamped on the car and never appear in a title, so
 * they are always left for manual entry.
 */

export interface ParsedTitle {
  /** 4-digit model year, if one appears in the title. */
  year?: number;
  /** Best-effort series (e.g. "HW Showroom", "Fast & Furious"), if recognised. */
  series?: string;
  /** The core model/casting name with brand, year, series and filler stripped. */
  castingName?: string;
}

// Brand prefixes to strip (case-insensitive). Generic toy/diecast makers.
const BRANDS = ['hot wheels', 'hotwheels', 'mattel', 'matchbox', 'maisto', 'greenlight', 'johnny lightning'];

// Trailing filler that describes packaging/scale, not the model.
const FILLER = [
  'play vehicle',
  'die-cast',
  'diecast',
  'die cast',
  'toy car',
  'toy vehicle',
  'vehicle',
  'collectible',
  'collectable',
  '1:64',
  '1/64',
  'scale',
  'new',
  'sealed',
];

// A handful of well-known series families. Matching is generous (substring),
// and the matched span is removed from the casting name.
const SERIES_PATTERNS: Array<{ label: string; re: RegExp }> = [
  { label: 'HW Showroom', re: /\bHW\s*Showroom\b/i },
  { label: 'HW Exotics', re: /\bHW\s*Exotics\b/i },
  { label: 'HW Race', re: /\bHW\s*Race\b/i },
  { label: 'HW Art Cars', re: /\bHW\s*Art\s*Cars\b/i },
  { label: 'Fast & Furious', re: /\bFast\s*&?\s*Furious\b/i },
  { label: 'Super Treasure Hunt', re: /\bSuper\s*Treasure\s*Hunt\b/i },
  { label: 'Treasure Hunt', re: /\bTreasure\s*Hunt\b/i },
  { label: 'Boulevard', re: /\bBoulevard\b/i },
  { label: 'Car Culture', re: /\bCar\s*Culture\b/i },
  { label: 'Mainline', re: /\bMainline\b/i },
];

function titleCaseWord(w: string): string {
  return w.length <= 2 && w === w.toLowerCase() ? w : w.charAt(0).toUpperCase() + w.slice(1);
}

/** Parse a barcode-database product title into structured fields. */
export function parseDiecastTitle(rawTitle: string): ParsedTitle {
  const title = rawTitle.trim();
  if (!title) return {};

  const result: ParsedTitle = {};
  let work = ` ${title} `;

  // Year (1968 = first mass-market diecast year .. near-future)
  const yearMatch = work.match(/\b(19[6-9]\d|20[0-9]\d)\b/);
  if (yearMatch) {
    result.year = Number.parseInt(yearMatch[0], 10);
    work = work.replace(yearMatch[0], ' ');
  }

  // Series
  for (const { label, re } of SERIES_PATTERNS) {
    if (re.test(work)) {
      result.series = label;
      work = work.replace(re, ' ');
      break;
    }
  }

  // Strip brands
  for (const brand of BRANDS) {
    work = work.replace(new RegExp(`\\b${escape(brand)}\\b`, 'ig'), ' ');
  }

  // Strip filler words/phrases
  for (const f of FILLER) {
    work = work.replace(new RegExp(`\\b${escape(f)}\\b`, 'ig'), ' ');
  }

  // Collapse leftover separators/whitespace into a clean casting name.
  const cleaned = work
    .replace(/[•|,\-–—]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned) {
    result.castingName = cleaned.split(' ').map(titleCaseWord).join(' ');
  }
  return result;
}

/** Escape a literal string for safe use inside a RegExp. */
function escape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
