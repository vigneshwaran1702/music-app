import { LANGUAGES, LanguageOption } from '../constants/languages';

export function getLanguageByCode(code: string): LanguageOption {
  if (!code) return LANGUAGES[0];
  const clean = code.toLowerCase().trim();
  const found = LANGUAGES.find(
    (l) =>
      l.code.toLowerCase() === clean ||
      l.id.toLowerCase() === clean ||
      l.name.toLowerCase() === clean ||
      l.nativeName.toLowerCase() === clean
  );
  return (
    found || {
      id: code,
      name: code.charAt(0).toUpperCase() + code.slice(1),
      nativeName: code.toUpperCase(),
      code: code,
      flag: '🌐',
      gradient: ['#6366f1', '#ec4899'],
      popularGenres: ['All Genres']
    }
  );
}

export function getAllLanguages(): LanguageOption[] {
  return LANGUAGES;
}
