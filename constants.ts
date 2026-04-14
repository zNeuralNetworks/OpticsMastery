
import { Page } from './types';
import { 
  Network, 
  CheckCircle2, 
  Activity, 
  BookOpen, 
  Box, 
  Sparkles, 
  Ruler, 
  Eye, 
  Rotate3d,
  Grid3X3,
  ArrowRightLeft,
  ShoppingCart,
  Cpu
} from 'lucide-react';

export const MENU_ITEMS = [
  // --- LEARN ---
  { 
    id: Page.LEARN, 
    label: 'Knowledge Base', 
    icon: BookOpen, 
    desc: 'Standards & Protocols',
    category: 'LEARN'
  },
  { 
    id: Page.FORM_FACTOR_EXPLORER, 
    label: '3D Form Factors', 
    icon: Rotate3d, 
    desc: 'Physical Architecture',
    category: 'LEARN'
  },

  // --- DESIGN ---
  { 
    id: Page.TOPOLOGY, 
    label: 'Architecture Lab', 
    icon: Network, 
    desc: 'Fabric Design & Media Strategy',
    category: 'DESIGN'
  },
  { 
    id: Page.AI_PLANNER, 
    label: 'AI Cluster Planner', 
    icon: Cpu, 
    desc: 'GPU Cluster Sizing & Fabric',
    category: 'DESIGN'
  },
  { 
    id: Page.MIGRATION_WIZARD, 
    label: 'Migration Wizard', 
    icon: ArrowRightLeft, 
    desc: 'Legacy Upgrade Path',
    category: 'DESIGN'
  },

  // --- PRACTICE ---
  { 
    id: Page.VISUALIZER, 
    label: 'Cable Configurator', 
    icon: Activity, 
    desc: 'Breakout & Gearbox Logic',
    category: 'PRACTICE'
  },
  { 
    id: Page.COMPATIBILITY_EXPLAINER, 
    label: 'Link Validation', 
    icon: CheckCircle2, 
    desc: 'Physical Link Validator',
    category: 'PRACTICE'
  },
  { 
    id: Page.LINK_BUDGET, 
    label: 'Link Budget Calc', 
    icon: Ruler, 
    desc: 'Loss & Power Estimator',
    category: 'PRACTICE'
  },
  { 
    id: Page.DBM_INTERPRETER, 
    label: 'Signal Interpreter', 
    icon: Activity, 
    desc: 'Rx/Tx Power Analyzer',
    category: 'PRACTICE'
  },
  { 
    id: Page.SIGNAL_INTEGRITY, 
    label: 'Signal Sandbox', 
    icon: Eye, 
    desc: 'Eye Diagram Simulator',
    category: 'PRACTICE'
  },

  // --- REFERENCE ---
  { 
    id: Page.CATALOG, 
    label: 'Part Finder', 
    icon: Box, 
    desc: 'Transceiver Database',
    category: 'REFERENCE'
  },
  { 
    id: Page.SMART_MATRIX, 
    label: 'Smart Matrix', 
    icon: Grid3X3, 
    desc: 'Platform Fit Matrix',
    category: 'REFERENCE'
  },

  { 
    id: Page.BOM_BUILDER, 
    label: 'BOM Builder', 
    icon: ShoppingCart, 
    desc: 'Project Bill of Materials',
    category: 'REFERENCE'
  },

  // --- NON-CORE (ROADMAP) ---
  { 
    id: Page.CONTENT_IMPROVEMENTS, 
    label: 'Roadmap', 
    icon: Sparkles, 
    desc: 'Future Improvements',
    category: 'FOOTER'
  },
];
