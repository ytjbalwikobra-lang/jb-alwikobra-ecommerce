import React from 'react';
import { TermsSection as TermsSectionType } from '../../hooks/useTerms';

interface TermsSectionProps {
  section: TermsSectionType;
}

export const TermsSection: React.FC<TermsSectionProps> = ({ section }) => {
  const renderContent = () => {
    if (Array.isArray(section.content)) {
      return (
        <ul className="space-y-2">
          {section.content.map((item, index) => (
            <li key={index} className="text-gray-700 leading-relaxed">
              • {item}
            </li>
          ))}
        </ul>
      );
    }
    
    return <p className="text-gray-700 leading-relaxed">{section.content}</p>;
  };

  return (
    <section 
      id={section.id} 
      className={`mb-8 p-6 rounded-lg ${section.isImportant ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'}`}
    >
      <h2 className={`text-xl font-semibold mb-4 ${section.isImportant ? 'text-red-800' : 'text-gray-800'}`}>
        {section.title}
      </h2>
      {renderContent()}
    </section>
  );
};
