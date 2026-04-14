
import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Arista7800R4, Arista7060X6, GpuRack, StorageNode } from './HardwareIcons';
import { Info } from 'lucide-react';

interface ClusterDiagramProps {
  spineCount: number;
  leafCount: number;
  gpuCount: number;
  mediaType: string;
  mediaColor: string;
  portSpeedLabel: string;
  latencyLabel: string;
  leafSwitchLabel: string;
  spineSwitchLabel: string;
  gpuRackLabel: string;
  storageNodeLabel: string;
  nicsPerPort?: number;
  planningMode?: 'BACKEND_ONLY' | 'FULL_STACK';
  storageFabric?: {
    leafCount: number;
    spineCount: number;
  };
}

interface NodeData {
  id: string;
  type: string;
  x: number;
  y: number;
  label: string;
  realCount: number;
}

interface LinkData {
  id: string;
  source: NodeData;
  target: NodeData;
  type: string;
}

export const ClusterDiagram: React.FC<ClusterDiagramProps> = ({
  spineCount,
  leafCount,
  gpuCount,
  mediaType,
  mediaColor,
  portSpeedLabel,
  latencyLabel,
  leafSwitchLabel,
  spineSwitchLabel,
  gpuRackLabel,
  storageNodeLabel,
  nicsPerPort = 1,
  planningMode = 'BACKEND_ONLY',
  storageFabric
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const isFullStack = planningMode === 'FULL_STACK';

  // Representative counts for visualization
  const displaySpines = Math.min(spineCount, 4);
  const displayLeaves = Math.min(leafCount, 6);
  const displayRacks = 4;
  
  const displayFeSpines = isFullStack ? (storageFabric ? Math.min(storageFabric.spineCount, 2) : 2) : 0;
  const displayFeLeaves = isFullStack ? (storageFabric ? Math.min(storageFabric.leafCount, 4) : 4) : 0;

  const width = 800;
  const height = 600; // Increased height for better spacing

  const nodes = useMemo(() => {
    // Y-coordinates based on mode
    const yFeSpine = 60;
    const yFeLeaf = 180;
    const yRack = isFullStack ? 320 : 400; // Adjusted for more space
    const yBeLeaf = isFullStack ? 460 : 220;
    const yBeSpine = isFullStack ? 560 : 80;

    const beSpineNodes = Array.from({ length: displaySpines }).map((_, i) => ({
      id: `spine-${i}`,
      type: 'spine',
      x: (width / (displaySpines + 1)) * (i + 1),
      y: yBeSpine,
      label: `BE Spine ${i + 1}`,
      realCount: spineCount
    }));

    const beLeafNodes = Array.from({ length: displayLeaves }).map((_, i) => ({
      id: `leaf-${i}`,
      type: 'leaf',
      x: (width / (displayLeaves + 1)) * (i + 1),
      y: yBeLeaf,
      label: `BE Leaf ${i + 1}`,
      realCount: leafCount
    }));

    const rackNodes = Array.from({ length: displayRacks }).map((_, i) => ({
      id: `rack-${i}`,
      type: 'rack',
      x: (width / (displayRacks + 1)) * (i + 1),
      y: yRack,
      label: `GPU Rack ${i + 1}`,
      realCount: Math.ceil(gpuCount / 8)
    }));

    const feNodes: NodeData[] = [];
    if (isFullStack) {
      const feSpineNodes = Array.from({ length: displayFeSpines }).map((_, i) => ({
        id: `fe-spine-${i}`,
        type: 'spine',
        x: (width / (displayFeSpines + 1)) * (i + 1),
        y: yFeSpine,
        label: `FE Spine ${i + 1}`,
        realCount: storageFabric?.spineCount || 2
      }));

      const feLeafNodes = Array.from({ length: displayFeLeaves }).map((_, i) => {
        // Split leaves into AI Front and HPC Front for isolation
        const isAiFront = i < displayFeLeaves / 2;
        return {
          id: `fe-leaf-${i}`,
          type: 'leaf',
          x: (width / (displayFeLeaves + 1)) * (i + 1),
          y: yFeLeaf,
          label: isAiFront ? `AI Front ${i + 1}` : `HPC Front ${i - (displayFeLeaves / 2) + 1}`,
          realCount: storageFabric?.leafCount || 4
        };
      });
      
      feNodes.push(...feSpineNodes, ...feLeafNodes);

      // Place storage in a dedicated FE-side domain instead of sharing the spine row.
      const storageNodes = Array.from({ length: 2 }).map((_, i) => ({
        id: `storage-${i}`,
        type: 'storage',
        x: width - 90,
        y: 120 + (i * 90),
        label: i === 0 ? 'Storage A' : 'Storage B',
        realCount: (storageFabric?.leafCount || 4) * 2
      }));
      feNodes.push(...storageNodes);
    }

    return [...beSpineNodes, ...beLeafNodes, ...rackNodes, ...feNodes];
  }, [displaySpines, displayLeaves, displayRacks, displayFeSpines, displayFeLeaves, spineCount, leafCount, gpuCount, planningMode, storageFabric, isFullStack]);

  const links = useMemo(() => {
    const allLinks: LinkData[] = [];
    const isFullStack = planningMode === 'FULL_STACK';

    // Back-End Links
    nodes.filter(n => n.id.startsWith('spine-')).forEach(s => {
      nodes.filter(n => n.id.startsWith('leaf-')).forEach(l => {
        allLinks.push({
          id: `${s.id}-${l.id}`,
          source: s,
          target: l,
          type: 'spine-leaf'
        });
      });
    });

    nodes.filter(n => n.id.startsWith('leaf-')).forEach(l => {
      nodes.filter(n => n.type === 'rack').forEach(r => {
        const leafIdx = parseInt(l.id.split('-')[1]);
        const rackIdx = parseInt(r.id.split('-')[1]);
        if (Math.abs(leafIdx - rackIdx) <= 1) {
          allLinks.push({
            id: `${l.id}-${r.id}`,
            source: l,
            target: r,
            type: 'leaf-rack'
          });
        }
      });
    });

    // Front-End Links
    if (isFullStack) {
      nodes.filter(n => n.id.startsWith('fe-spine-')).forEach(s => {
        nodes.filter(n => n.id.startsWith('fe-leaf-')).forEach(l => {
          allLinks.push({
            id: `${s.id}-${l.id}`,
            source: s,
            target: l,
            type: 'fe-spine-leaf'
          });
        });
      });

      nodes.filter(n => n.id.startsWith('fe-leaf-')).forEach(l => {
        // Connect to Racks
        nodes.filter(n => n.type === 'rack').forEach(r => {
          const leafIdx = parseInt(l.id.split('-')[2]);
          const rackIdx = parseInt(r.id.split('-')[1]);
          if (Math.abs(leafIdx - rackIdx) <= 1) {
            allLinks.push({
              id: `${l.id}-${r.id}`,
              source: l,
              target: r,
              type: 'fe-leaf-rack'
            });
          }
        });
        
        // Connect to Storage Nodes (Isolated)
        const leafIdx = parseInt(l.id.split('-')[2]);
        const isAiFront = leafIdx < displayFeLeaves / 2;
        
        nodes.filter(n => n.type === 'storage').forEach(s => {
          const isAiStorage = s.label === 'AI Storage';
          // Connect AI Front to AI Storage, HPC Front to HPC Storage
          if (isAiFront === isAiStorage) {
            allLinks.push({
              id: `${l.id}-${s.id}`,
              source: l,
              target: s,
              type: 'fe-leaf-storage'
            });
          }
        });
      });
    }

    return allLinks;
  }, [nodes, planningMode, isFullStack, displayFeLeaves]);

  const lineGenerator = d3.linkVertical<{ source: { x: number; y: number }; target: { x: number; y: number } }, { x: number; y: number }>()
    .x((d: { x: number; y: number }) => d.x)
    .y((d: { x: number; y: number }) => d.y);

  const getNodeTranslate = (node: NodeData) => ({
    x: node.x - (node.type === 'spine' ? 25 : node.type === 'leaf' ? 35 : 20),
    y: node.y - (node.type === 'spine' ? 33 : node.type === 'leaf' ? 9 : 30),
  });

  const getLabelY = (node: NodeData) => {
    if (node.type === 'spine') {
      return -12;
    }
    if (node.type === 'leaf') {
      return 30;
    }
    if (node.type === 'storage') {
      return 76;
    }
    return node.y < height / 2 ? 75 : -10;
  };

  return (
    <div className="relative w-full h-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full relative z-10">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fabric Labels & Borders */}
        {planningMode === 'FULL_STACK' && (
          <g>
            <rect x="20" y="20" width={width - 40} height={240} rx="20" fill="none" stroke="#334155" strokeDasharray="5,5" strokeOpacity="0.5" />
            <text x="40" y="45" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">Front-End Fabric (Storage/Services)</text>
            <rect x={width - 170} y="45" width="110" height="180" rx="16" fill="none" stroke="#475569" strokeDasharray="4,4" strokeOpacity="0.6" />
            <text x={width - 158} y="68" className="fill-orange-300 text-[9px] font-black uppercase tracking-widest">Storage Domain</text>
            
            <rect x="20" y="300" width={width - 40} height={280} rx="20" fill="none" stroke="#334155" strokeDasharray="5,5" strokeOpacity="0.5" />
            <text x="40" y="325" className="fill-slate-500 text-[10px] font-black uppercase tracking-widest">Back-End Fabric (Compute)</text>
          </g>
        )}

        {/* Links */}
        <g>
          {links.map(link => {
            const isHovered = hoveredLink === link.id || 
                             (hoveredNode && (link.source.id === hoveredNode || link.target.id === hoveredNode));
            
            return (
              <g key={link.id}>
                <motion.path
                  d={lineGenerator({
                    source: { 
                      x: link.source.x, 
                      y: link.source.y + (link.source.y < link.target.y ? 
                        (link.source.type === 'spine' ? 33 : 9) : 
                        (link.source.type === 'spine' ? -33 : -9)) 
                    },
                    target: { 
                      x: link.target.x, 
                      y: link.target.y + (link.target.y < link.source.y ? 
                        (link.target.type === 'leaf' ? 9 : 30) : 
                        (link.target.type === 'leaf' ? -9 : -30)) 
                    }
                  }) || ''}
                  fill="none"
                  stroke={isHovered ? 
                    (link.type.startsWith('fe-') ? '#10B981' : 
                    (link.type.includes('rack') ? (mediaColor.includes('orange') ? '#f97316' : mediaColor.includes('blue') ? '#3b82f6' : mediaColor.includes('yellow') ? '#eab308' : '#22c55e') : '#3B82F6')) 
                    : '#334155'}
                  strokeWidth={isHovered ? 2 : 1}
                  strokeOpacity={isHovered ? 0.8 : 0.3}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  onMouseEnter={() => setHoveredLink(link.id)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
                {link.type.includes('rack') && nicsPerPort > 1 && isHovered && (
                  <text
                    x={(link.source.x + link.target.x) / 2}
                    y={(link.source.y + link.target.y) / 2}
                    className="text-[8px] font-black fill-orange-500 select-none pointer-events-none"
                    textAnchor="middle"
                    dy="-10"
                  >
                    {nicsPerPort}x Breakout
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        {nodes.map(node => {
          const translate = getNodeTranslate(node);
          return (
          <g key={node.id} 
             transform={`translate(${translate.x}, ${translate.y})`}
             onMouseEnter={() => setHoveredNode(node.id)}
             onMouseLeave={() => setHoveredNode(null)}
             className="cursor-pointer">
            
            {node.type === 'spine' && <Arista7800R4 width={50} height={66} />}
            {node.type === 'leaf' && <Arista7060X6 width={70} height={18} />}
            {node.type === 'rack' && <GpuRack width={40} height={60} />}
            {node.type === 'storage' && <StorageNode width={40} height={60} />}

            {/* Labels */}
            <text x={node.type === 'spine' ? 25 : node.type === 'leaf' ? 35 : 20} 
                  y={getLabelY(node)}
                  textAnchor="middle" 
                  className="fill-slate-400 text-[9px] font-bold uppercase tracking-tighter">
              {node.label}
            </text>

            {/* Scale Indicators */}
            {node.id.includes('-0') && (
              <g transform={`translate(${node.type === 'spine' ? -35 : node.type === 'leaf' ? -45 : -35}, 0)`}>
                <rect width="24" height="12" rx="3" fill="#1E293B" stroke="#334155" />
                <text x="12" y="9" textAnchor="middle" className="fill-blue-400 text-[7px] font-black">
                  x{node.realCount}
                </text>
              </g>
            )}
          </g>
        )})}
      </svg>

      {/* Interactive Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-6 left-6 right-6 p-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl flex items-center justify-between z-20"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Info size={20} />
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {hoveredNode.startsWith('fe-') ? 'Front-End Component' : 
                   hoveredNode.startsWith('spine') || hoveredNode.startsWith('leaf') ? 'Back-End Component' :
                   hoveredNode.startsWith('storage') ? 'Storage Resource' : 'Compute Resource'}
                </div>
                <div className="text-sm font-bold text-white">
                  {hoveredNode.includes('spine') ? spineSwitchLabel : 
                   hoveredNode.includes('leaf') ? leafSwitchLabel : 
                   hoveredNode.startsWith('storage') ? storageNodeLabel :
                   gpuRackLabel}
                </div>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Throughput</div>
                <div className="text-xs font-mono text-blue-400">{portSpeedLabel}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Latency</div>
                <div className="text-xs font-mono text-green-400">{latencyLabel}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-6 left-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-1 rounded-full ${mediaColor.replace('text-', 'bg-')}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mediaType} Links</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 rounded-full bg-slate-700" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Counts compressed for readability</span>
        </div>
      </div>
    </div>
  );
};
