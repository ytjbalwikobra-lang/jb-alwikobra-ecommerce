import React from 'react';
import { TermsSection as TermsSectionType } from '../../hooks/useTerms';
import { TermsSection } from './TermsSection';

interface TermsContentProps {
  sections: TermsSectionType[];
}

export const TermsContent: React.FC<TermsContentProps> = ({ sections }) => {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <TermsSection key={section.id} section={section} />
      ))}
    </div>
  );
};
