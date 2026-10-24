// Builds a case-insensitive regex that tolerates common Arabic spelling variants,
// so searching "الاخلاص" also matches "الإخلاص", and "مدرسه" matches "مدرسة".

export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LETTER_GROUPS = ['اأإآ', 'ةه', 'ىيئ', 'وؤ'];

const CHAR_CLASS = {};
for (const group of LETTER_GROUPS) {
  for (const letter of group) CHAR_CLASS[letter] = `[${group}]`;
}

// Tashkeel (harakat) and tatweel: stripped from the query, allowed anywhere in the stored text.
// MongoDB's PCRE engine rejects \uXXXX escapes, so the pattern must hold the literal characters.
const DIACRITICS_CLASS = '[ً-ْـ]';
const DIACRITICS = new RegExp(DIACRITICS_CLASS, 'g');
const OPTIONAL_DIACRITICS = `${DIACRITICS_CLASS}*`;

export function buildArabicRegex(query) {
  const chars = [...query.replace(DIACRITICS, '').trim()];
  const pattern = chars.map((ch) => CHAR_CLASS[ch] || escapeRegex(ch)).join(OPTIONAL_DIACRITICS);
  return new RegExp(pattern, 'i');
}
