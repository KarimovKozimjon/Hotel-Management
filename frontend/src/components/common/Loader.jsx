import { useTranslation } from 'react-i18next';

const Loader = ({ fullScreen = false, showText = true, className = '', message } = {}) => {
  const { t } = useTranslation();
  const text = message ?? t('common.loading');

  return (
    <div
      className={`flex items-center justify-center p-8 ${fullScreen ? 'min-h-screen' : ''} ${className}`}
    >
      <div className="text-center" role="status" aria-live="polite">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        {showText && <div className="mt-4 text-sm font-medium text-gray-600">{text}</div>}
      </div>
    </div>
  );
};

export default Loader;
