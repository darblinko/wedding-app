import React from 'react';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="card-with-shadow max-w-md w-full">
        <div className="text-center">
          <div className="bg-gradient-primary text-white rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
            <h1 className="text-8xl font-bold">{t('notFound.404')}</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">{t('notFound.title')}</h2>
          <p className="text-gray-600 mt-2">{t('notFound.message')}</p>
          <div className="mt-6">
            <a href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-primary hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {t('notFound.backToHome')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;