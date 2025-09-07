import React from 'react';

type Crumb = {
  name: string;
  item: string;
};

const SeoBreadcrumbs: React.FC<{ items: Crumb[] }>
  = ({ items }) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-gray-400">
          {items.map((c, i) => (
            <li key={i} itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement" className="flex items-center gap-1">
              <a href={c.item} itemProp="item" className="hover:text-pink-300">
                <span itemProp="name">{c.name}</span>
              </a>
              <meta itemProp="position" content={String(i + 1)} />
              {i < items.length - 1 && <span className="mx-1 text-gray-600">/</span>}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
};

export default SeoBreadcrumbs;
