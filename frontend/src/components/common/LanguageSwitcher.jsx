import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'uz', name: 'UZ', flag: '🇺🇿' },
  { code: 'en', name: 'EN', flag: '🇬🇧' },
  { code: 'ru', name: 'RU', flag: '🇷🇺' },
];

function LanguageSwitcher({ variant = 'dropdown', scrolled = true }) {
  const { i18n } = useTranslation();

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              i18n.language === lang.code
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={lang.name}
          >
            <span className="mr-1">{lang.flag}</span>
            <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant (mobile-friendly)
  return (
    <div className="relative inline-block group">
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className={`appearance-none border-2 rounded-xl px-4 py-2.5 pr-10 text-sm font-bold transition-all duration-500 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl hover:scale-105 ${
          scrolled
            ? 'bg-gradient-to-r from-white to-gray-50 border-gray-300 text-gray-800 hover:border-indigo-500 hover:from-indigo-50 hover:to-white'
            : 'bg-white/90 backdrop-blur-lg border-white text-gray-800 hover:bg-white'
        }`}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white text-gray-900 py-2 font-semibold">
            {lang.name}
          </option>
        ))}
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 transition-all duration-500 group-hover:scale-110 ${
        scrolled ? 'text-gray-600' : 'text-gray-700'
      }`}>
        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export default LanguageSwitcher;
