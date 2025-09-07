import React from 'react';

// Globally hide breadcrumbs (visual and JSON-LD) per request
type Crumb = { name: string; item: string };
const SeoBreadcrumbs: React.FC<{ items: Crumb[] }> = () => null;

export default SeoBreadcrumbs;
