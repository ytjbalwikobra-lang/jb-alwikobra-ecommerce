import React, { useCallback } from 'react';
import { useTerms } from '../hooks/useTerms';

interface TermsSectionProps {
  section: {
    id: string;
    title: string;
    content: string[] | string;
    isImportant?: boolean;
  };
}

const TermsSection: React.FC<TermsSectionProps> = ({ section }) => {
  const renderContent = () => {
    if (Array.isArray(section.content)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {section.content.map((item, index) => (
            <li key={index} className="text-gray-300 leading-relaxed text-sm">
              {item}
            </li>
          ))}
        </ul>
      );
    }
    
    return <p className="text-gray-300 leading-relaxed text-sm">{section.content}</p>;
  };

  return (
    <div 
      id={section.id} 
      className={`mb-6 p-4 rounded-lg border ${
        section.isImportant 
          ? 'bg-red-900/20 border-red-500/30' 
          : 'bg-black/40 border-pink-500/30'
      }`}
    >
      <h2 className={`text-lg font-medium mb-3 ${
        section.isImportant ? 'text-red-300' : 'text-white'
      }`}>
        {section.title}
      </h2>
      {renderContent()}
    </div>
  );
};

const TermsPage: React.FC = () => {
  const { lastUpdated, tableOfContents, sections } = useTerms();

  const handleNavClick = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
        <p className="text-sm text-gray-400 mb-8">
          Terakhir diperbarui: {lastUpdated}
        </p>

        {/* Table of Contents */}
        <nav aria-label="Daftar Isi" className="mb-8 bg-black/40 border border-pink-500/30 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-2">Daftar Isi</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm list-disc list-inside text-pink-300">
            {tableOfContents.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  className="hover:underline text-left"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <TermsSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
