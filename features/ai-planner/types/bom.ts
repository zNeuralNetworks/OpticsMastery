export interface PlannerBomLine {
  id: string;
  sku: string;
  description: string;
  quantity: number;
  category: string;
  role: string;
  quantitySource: 'deterministic' | 'assumed';
  note?: string;
}

export interface PlannerBomSection {
  title: string;
  description: string;
  lines: PlannerBomLine[];
}
