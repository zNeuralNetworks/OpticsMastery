
import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildDatedFilename, downloadCSV } from '../shared/lib/export';

export interface BOMItem {
  id: string;
  sku: string;
  quantity: number;
  description: string;
  category: string;
  role?: string;
  sourceFeature?: string;
  quantitySource?: 'deterministic' | 'assumed';
}

interface BOMContextType {
  bom: BOMItem[];
  addToBOM: (item: BOMItem) => void;
  removeFromBOM: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearBOM: () => void;
  exportBOM: () => void;
}

const BOMContext = createContext<BOMContextType | undefined>(undefined);

export const buildBOMItemId = (item: Pick<BOMItem, 'sku' | 'category' | 'role'>) =>
  [item.category, item.role ?? 'default', item.sku].join('::');

export const BOMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bom, setBom] = useState<BOMItem[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('project_bom');
        return saved ? JSON.parse(saved) : [];
      }
    } catch (e) {
      console.warn('LocalStorage access failed in BOMContext:', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('project_bom', JSON.stringify(bom));
    } catch (e) {
      console.warn('LocalStorage setItem failed in BOMContext:', e);
    }
  }, [bom]);

  const addToBOM = (item: BOMItem) => {
    setBom(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromBOM = (itemId: string) => {
    setBom(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setBom(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i));
  };

  const clearBOM = () => setBom([]);

  const exportBOM = () => {
    if (bom.length === 0) return;

    downloadCSV(
      buildDatedFilename('arista-project-bom', 'csv'),
      ['SKU', 'Description', 'Category', 'Role', 'Quantity Source', 'Quantity'],
      bom.map((item) => [
        item.sku,
        item.description,
        item.category,
        item.role ?? '',
        item.quantitySource ?? '',
        item.quantity,
      ]),
    );
  };

  return (
    <BOMContext.Provider value={{ bom, addToBOM, removeFromBOM, updateQuantity, clearBOM, exportBOM }}>
      {children}
    </BOMContext.Provider>
  );
};

export const useBOM = () => {
  const context = useContext(BOMContext);
  if (context === undefined) {
    throw new Error('useBOM must be used within a BOMProvider');
  }
  return context;
};
