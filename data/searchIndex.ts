import React from 'react';
import { Network, Activity, CheckCircle2, Layers, ArrowRightLeft, Box, Sparkles, BookOpen, Hash, ArrowRight, Terminal, Globe, Zap, Cpu } from 'lucide-react';
import { AppNavigationParams, Page, LearnPageTab } from '../types';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  type: 'PAGE' | 'TOPIC' | 'TOOL';
  icon: React.ElementType;
  page: Page;
  subTab?: LearnPageTab;
  params?: AppNavigationParams;
}

export const SEARCH_ITEMS: SearchItem[] = [
  // Pages
  { id: 'p-topo', title: 'Architecture Lab', description: 'Design Spine-Leaf fabrics', type: 'PAGE', icon: Network, page: Page.TOPOLOGY },
  { id: 'p-vis', title: 'Cable Configurator', description: 'Breakout & Gearbox guide', type: 'TOOL', icon: Activity, page: Page.VISUALIZER },
  { id: 'p-mat', title: 'Physical Fit Matrix', description: 'Validate polish and form-factor fit', type: 'TOOL', icon: CheckCircle2, page: Page.SMART_MATRIX },
  { id: 'p-sfp', title: 'SFP Family Matrix', description: 'Visual breakdown of SFP to SFP-DD', type: 'TOOL', icon: Layers, page: Page.SFP_MATRIX },
  { id: 'p-mig', title: 'Migration Wizard', description: 'Legacy 10G/40G to 400G planner', type: 'TOOL', icon: ArrowRightLeft, page: Page.MIGRATION_WIZARD },
  { id: 'p-cat', title: 'Part Finder', description: 'Search optics catalog', type: 'TOOL', icon: Box, page: Page.CATALOG },
  { id: 'p-road', title: 'Roadmap', description: 'Future improvements', type: 'PAGE', icon: Sparkles, page: Page.CONTENT_IMPROVEMENTS },
  { id: 'p-link', title: 'Link Budget Calculator', description: 'Estimate optical loss', type: 'TOOL', icon: Box, page: Page.LINK_BUDGET },
  { id: 'p-power', title: 'Signal Interpreter', description: 'Analyze Rx/Tx dBm levels', type: 'TOOL', icon: Activity, page: Page.DBM_INTERPRETER },
  
  // Knowledge Base Topics
  { id: 'k-basic', title: 'Network Basics', description: 'Transceivers & Power Budget', type: 'TOPIC', icon: BookOpen, page: Page.LEARN, subTab: 'STRATEGY' },
  { id: 'k-form', title: 'Form Factors (OSFP/QSFP-DD)', description: 'Physical shapes and platform fit', type: 'TOPIC', icon: Box, page: Page.LEARN, subTab: 'HARDWARE' },
  { id: 'k-fund', title: 'PAM4 & FEC Signaling', description: 'Modulation fundamentals', type: 'TOPIC', icon: Activity, page: Page.LEARN, subTab: 'SIGNALING' },
  { id: 'k-media', title: 'Fiber & Copper Media', description: 'SMF, MMF, AOC, DAC types', type: 'TOPIC', icon: Hash, page: Page.LEARN, subTab: 'CONNECTIVITY' },
  { id: 'k-ai', title: 'AI Networking & RoCEv2', description: 'Lossless Ethernet for AI', type: 'TOPIC', icon: Network, page: Page.LEARN, subTab: 'STRATEGY' },
  { id: 'k-mig', title: 'Migration Strategy', description: '100G to 400G upgrades', type: 'TOPIC', icon: ArrowRight, page: Page.LEARN, subTab: 'UPGRADES' },
  { id: 'k-debug', title: 'Operations & Debugging', description: 'CLI commands & troubleshooting', type: 'TOPIC', icon: Terminal, page: Page.LEARN, subTab: 'OPERATIONS' },
  
  // Future Tech
  { id: 'k-zr', title: '400G-ZR / ZR+ (DCI)', description: 'Coherent optics for long haul', type: 'TOPIC', icon: Globe, page: Page.LEARN, subTab: 'UPGRADES' },
  { id: 'k-lpo', title: 'LPO (Linear Drive)', description: 'Low power optics (No DSP)', type: 'TOPIC', icon: Zap, page: Page.LEARN, subTab: 'UPGRADES' },
  { id: 'k-aec', title: 'AEC (Active Electrical)', description: 'Smart copper cables', type: 'TOPIC', icon: Cpu, page: Page.LEARN, subTab: 'UPGRADES' },
];
