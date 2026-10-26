const TITLES = new Set([
  'mr', 'mrs', 'ms', 'dr', 'rev', 'reverend', 'pastor', 'pst',
  'bishop', 'elder', 'deacon', 'brother', 'br', 'bro', 'sister', 'sis', 'evangelist', 'evg'
]);

export function extractNameTokens(fullName: string): string[] {
  if (!fullName) return [];
  return fullName
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\s]/gu, '') // remove punctuation/numbers
    .split(/\s+/)
    .filter(word => word.length >= 2 && !TITLES.has(word));
}

export function areSameTwoNames(name1: string, name2: string): boolean {
  const tokens1 = extractNameTokens(name1);
  const tokens2 = extractNameTokens(name2);

  if (tokens1.length === 0 || tokens2.length === 0) return false;

  // Exact normalized match
  if (tokens1.join(' ') === tokens2.join(' ')) return true;

  // Count common name tokens
  const set2 = new Set(tokens2);
  let commonCount = 0;
  for (const token of tokens1) {
    if (set2.has(token)) {
      commonCount++;
    }
  }

  // If both names share at least 2 name words (e.g. first & last name)
  if (commonCount >= 2) {
    return true;
  }

  // If both names have only 1 word and they match
  if (tokens1.length === 1 && tokens2.length === 1 && tokens1[0] === tokens2[0]) {
    return true;
  }

  return false;
}
