import { describe, expect, it } from 'vitest';
import { parseDiecastTitle } from '@/lib/parse-title';

describe('parseDiecastTitle', () => {
  it('returns empty for blank/whitespace input', () => {
    expect(parseDiecastTitle('')).toEqual({});
    expect(parseDiecastTitle('   ')).toEqual({});
  });

  it('extracts year, series, and casting from a full title', () => {
    expect(parseDiecastTitle('Hot Wheels 2024 HW Showroom Camaro Concept 1:64 Die-Cast')).toEqual({
      year: 2024,
      series: 'HW Showroom',
      castingName: 'Camaro Concept',
    });
  });

  it('strips brand + filler when there is no year or series', () => {
    expect(parseDiecastTitle('Hot Wheels Dodge Charger Play Vehicle')).toEqual({
      castingName: 'Dodge Charger',
    });
  });

  it('recognises Fast & Furious series and the 1968 floor year', () => {
    const r = parseDiecastTitle('Mattel 1968 Fast & Furious Nissan Skyline');
    expect(r.year).toBe(1968);
    expect(r.series).toBe('Fast & Furious');
    expect(r.castingName).toBe('Nissan Skyline');
  });

  it('ignores years outside the diecast range', () => {
    expect(parseDiecastTitle('Matchbox 1955 Chevy Bel Air').year).toBeUndefined();
  });

  it('leaves castingName undefined when nothing remains after stripping', () => {
    expect(parseDiecastTitle('Hot Wheels Diecast Vehicle')).toEqual({});
  });

  it('preserves short lowercase tokens but title-cases real words', () => {
    expect(parseDiecastTitle('greenlight VW Beetle').castingName).toBe('VW Beetle');
  });

  it('keeps a short already-lowercase token as-is', () => {
    // "el" (2 chars, lowercase) stays lowercase; longer words get title-cased.
    expect(parseDiecastTitle('Chevy el Camino').castingName).toBe('Chevy el Camino');
  });
});
