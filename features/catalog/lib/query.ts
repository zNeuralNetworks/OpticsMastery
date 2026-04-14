
import { Optic, Cable } from '../../../types';

export type CatalogItem = (Optic | Cable) & { catalogType: 'OPTIC' | 'CABLE' };

export interface CatalogFilterCriteria {
  searchTerm: string;
  typeFilter: string;     // 'ALL' | FormFactor
  categoryFilter: string; // 'ALL' | 'OPTICS' | 'CABLES'
}

/**
 * pure function to normalize the catalog dataset
 */
export const normalizeCatalog = (optics: Optic[], cables: Cable[]): CatalogItem[] => {
  return [
    ...optics.map(o => ({ ...o, catalogType: 'OPTIC' as const })),
    ...cables.map(c => ({ ...c, catalogType: 'CABLE' as const }))
  ];
};

/**
 * Core filtering engine for the catalog
 */
export const filterCatalog = (items: CatalogItem[], criteria: CatalogFilterCriteria): CatalogItem[] => {
  const { searchTerm, typeFilter, categoryFilter } = criteria;
  const term = searchTerm.toLowerCase();

  return items.filter(item => {
    // 1. Search Term Match
    const matchesSearch = item.sku.toLowerCase().includes(term) || 
                          item.description.toLowerCase().includes(term);
    
    if (!matchesSearch) return false;

    // 2. Form Factor Match
    const itemFormFactor = item.catalogType === 'OPTIC' 
      ? (item as Optic).formFactor 
      : (item as Cable).formFactorSource;
      
    const matchesType = typeFilter === 'ALL' || itemFormFactor === typeFilter;
    
    if (!matchesType) return false;

    // 3. Category Match
    let matchesCategory = true;
    if (categoryFilter === 'OPTICS') {
        matchesCategory = item.catalogType === 'OPTIC';
    } else if (categoryFilter === 'CABLES') {
        matchesCategory = item.catalogType === 'CABLE';
    }

    return matchesCategory;
  });
};

/**
 * Extract unique form factors from the dataset for dropdowns
 */
export const getUniqueFormFactors = (items: CatalogItem[]): string[] => {
  const factors = new Set(items.map(i => 
    i.catalogType === 'OPTIC' ? (i as Optic).formFactor : (i as Cable).formFactorSource
  ));
  return Array.from(factors);
};
