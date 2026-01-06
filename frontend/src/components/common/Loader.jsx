import { useTranslation } from 'react-i18next';

const Loader = ({ fullScreen = false, showText = true, className = '', message } = {}) => {
  const { t } = useTranslation();
  const text = message ?? t('common.loading');

  return (
    <div
      className={`flex items-center justify-center p-8 ${fullScreen ? 'min-h-screen' : ''} ${className}`}
    >
      <div className="text-center" role="status" aria-live="polite">
        <div className="relative inline-flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600 animate-spin" />
          <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
        </div>
        {showText && <div className="mt-4 text-sm font-medium text-gray-600">{text}</div>}
      </div>
    </div>
  );
};

export default Loader;
