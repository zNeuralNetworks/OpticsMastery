import { motion, useReducedMotion } from "framer-motion";
import type { CommunicationPattern } from "@/features/cluster-designer/types";

type TrainingCommunicationDiagramProps = {
  pattern: CommunicationPattern;
};

const WIDTH = 620;
const HEIGHT = 230;

export function TrainingCommunicationDiagram({ pattern }: TrainingCommunicationDiagramProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-full w-full rounded-[20px] border border-border/80 bg-space/30"
      role="img"
      aria-label="Training communication pattern diagram"
      initial={reduceMotion ? false : { opacity: 0.85, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
    >
      <defs>
        <marker id="training-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--color-amethyst)" opacity="0.76" />
        </marker>
      </defs>

      {pattern === "ring-all-reduce" ? <RingDiagram /> : null}
      {pattern === "tree-all-reduce" ? <TreeDiagram /> : null}
      {pattern === "hierarchical" ? <HierarchicalDiagram /> : null}
      {pattern === "mixed-unknown" ? <MeshDiagram /> : null}
    </motion.svg>
  );
}

function RingDiagram() {
  const nodes = [
    { x: 160, y: 56, label: "G1" },
    { x: 300, y: 40, label: "G2" },
    { x: 445, y: 56, label: "G3" },
    { x: 495, y: 132, label: "G4" },
    { x: 445, y: 186, label: "G5" },
    { x: 300, y: 202, label: "G6" },
    { x: 160, y: 186, label: "G7" },
    { x: 110, y: 132, label: "G8" },
  ];

  return (
    <g>
      <Label x={24} y={28} text="RING ALL-REDUCE" />
      {nodes.map((node, index) => {
        const next = nodes[(index + 1) % nodes.length];
        return (
          <motion.line
            key={`${node.label}-${next.label}`}
            x1={node.x}
            y1={node.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(139,92,246,0.48)"
            strokeWidth="2"
            markerEnd="url(#training-arrow)"
            initial={{ pathLength: 0, opacity: 0.15 }}
            animate={{ pathLength: 1, opacity: [0.3, 0.8, 0.3] }}
            transition={{ pathLength: { duration: 0.35 }, opacity: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
          />
        );
      })}
      {nodes.map((node) => (
        <DiagramNode key={node.label} x={node.x} y={node.y} label={node.label} tone="accent" />
      ))}
    </g>
  );
}

function TreeDiagram() {
  const root = { x: 310, y: 40, label: "Root" };
  const mid = [
    { x: 200, y: 105, label: "A" },
    { x: 420, y: 105, label: "B" },
  ];
  const leaves = [
    { x: 120, y: 180, label: "G1" },
    { x: 210, y: 180, label: "G2" },
    { x: 400, y: 180, label: "G3" },
    { x: 490, y: 180, label: "G4" },
  ];

  return (
    <g>
      <Label x={24} y={28} text="TREE ALL-REDUCE" />
      {mid.map((node) => (
        <motion.line
          key={`root-${node.label}`}
          x1={root.x}
          y1={root.y}
          x2={node.x}
          y2={node.y}
          stroke="rgba(139,92,246,0.44)"
          strokeWidth="2"
          markerEnd="url(#training-arrow)"
          initial={{ pathLength: 0, opacity: 0.15 }}
          animate={{ pathLength: 1, opacity: [0.25, 0.7, 0.25] }}
          transition={{ pathLength: { duration: 0.3 }, opacity: { duration: 1.9, repeat: Infinity, ease: "easeInOut" } }}
        />
      ))}
      {leaves.map((node, index) => {
        const parent = index < 2 ? mid[0] : mid[1];
        return (
          <motion.line
            key={`${parent.label}-${node.label}`}
            x1={parent.x}
            y1={parent.y}
            x2={node.x}
            y2={node.y}
            stroke="rgba(111,135,166,0.4)"
            strokeWidth="1.8"
            markerEnd="url(#training-arrow)"
            initial={{ pathLength: 0, opacity: 0.12 }}
            animate={{ pathLength: 1, opacity: [0.18, 0.5, 0.18] }}
            transition={{ pathLength: { duration: 0.3 }, opacity: { duration: 2.1, repeat: Infinity, ease: "easeInOut" } }}
          />
        );
      })}
      <DiagramNode x={root.x} y={root.y} label={root.label} tone="accent" />
      {mid.map((node) => (
        <DiagramNode key={node.label} x={node.x} y={node.y} label={node.label} tone="leaf" />
      ))}
      {leaves.map((node) => (
        <DiagramNode key={node.label} x={node.x} y={node.y} label={node.label} tone="neutral" />
      ))}
    </g>
  );
}

function HierarchicalDiagram() {
  const groups = [
    { x: 150, y: 70, label: "Pod A" },
    { x: 470, y: 70, label: "Pod B" },
  ];
  const localA = [
    { x: 100, y: 150, label: "G1" },
    { x: 150, y: 180, label: "G2" },
    { x: 200, y: 150, label: "G3" },
  ];
  const localB = [
    { x: 420, y: 150, label: "G4" },
    { x: 470, y: 180, label: "G5" },
    { x: 520, y: 150, label: "G6" },
  ];

  return (
    <g>
      <Label x={24} y={28} text="HIERARCHICAL COMMUNICATION" />
      <motion.line x1={groups[0].x} y1={groups[0].y} x2={groups[1].x} y2={groups[1].y} stroke="rgba(139,92,246,0.46)" strokeWidth="3" markerEnd="url(#training-arrow)" initial={{ pathLength: 0, opacity: 0.2 }} animate={{ pathLength: 1, opacity: [0.3, 0.85, 0.3] }} transition={{ pathLength: { duration: 0.32 }, opacity: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }} />
      {localA.map((node) => (
        <motion.line key={`a-${node.label}`} x1={groups[0].x} y1={groups[0].y} x2={node.x} y2={node.y} stroke="rgba(16,185,129,0.38)" strokeWidth="1.8" initial={{ pathLength: 0, opacity: 0.14 }} animate={{ pathLength: 1, opacity: [0.2, 0.55, 0.2] }} transition={{ pathLength: { duration: 0.28 }, opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} />
      ))}
      {localB.map((node) => (
        <motion.line key={`b-${node.label}`} x1={groups[1].x} y1={groups[1].y} x2={node.x} y2={node.y} stroke="rgba(16,185,129,0.38)" strokeWidth="1.8" initial={{ pathLength: 0, opacity: 0.14 }} animate={{ pathLength: 1, opacity: [0.2, 0.55, 0.2] }} transition={{ pathLength: { duration: 0.28 }, opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} />
      ))}
      {groups.map((group) => (
        <DiagramNode key={group.label} x={group.x} y={group.y} label={group.label} tone="accent" />
      ))}
      {localA.concat(localB).map((node) => (
        <DiagramNode key={node.label} x={node.x} y={node.y} label={node.label} tone="neutral" />
      ))}
    </g>
  );
}

function MeshDiagram() {
  const nodes = [
    { x: 150, y: 70, label: "Pod 1" },
    { x: 310, y: 55, label: "Pod 2" },
    { x: 470, y: 70, label: "Pod 3" },
    { x: 210, y: 170, label: "Pod 4" },
    { x: 410, y: 170, label: "Pod 5" },
  ];

  return (
    <g>
      <Label x={24} y={28} text="MIXED / UNKNOWN" />
      {nodes.flatMap((node, index) =>
        nodes.slice(index + 1).map((peer) => (
          <motion.line
            key={`${node.label}-${peer.label}`}
            x1={node.x}
            y1={node.y}
            x2={peer.x}
            y2={peer.y}
            stroke="rgba(111,135,166,0.28)"
            strokeWidth="1.4"
            initial={{ pathLength: 0, opacity: 0.08 }}
            animate={{ pathLength: 1, opacity: [0.12, 0.35, 0.12] }}
            transition={{ pathLength: { duration: 0.25 }, opacity: { duration: 2.1, repeat: Infinity, ease: "easeInOut" } }}
          />
        )),
      )}
      <motion.path
        d="M 120 195 C 220 120, 390 120, 500 195"
        stroke="rgba(139,92,246,0.42)"
        strokeWidth="2"
        strokeDasharray="10 10"
        fill="none"
        markerEnd="url(#training-arrow)"
        initial={{ pathLength: 0, opacity: 0.2 }}
        animate={{ pathLength: 1, opacity: [0.28, 0.8, 0.28], strokeDashoffset: [0, -18] }}
        transition={{ pathLength: { duration: 0.34 }, opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }, strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: "linear" } }}
      />
      {nodes.map((node) => (
        <DiagramNode key={node.label} x={node.x} y={node.y} label={node.label} tone="neutral" />
      ))}
    </g>
  );
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} fill="var(--color-label)" fontSize="12" letterSpacing="3">
      {text}
    </text>
  );
}

function DiagramNode({
  x,
  y,
  label,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  tone: "accent" | "leaf" | "neutral";
}) {
  const reduceMotion = useReducedMotion();
  const styles = {
    accent: { fill: "rgba(139,92,246,0.14)", stroke: "var(--color-amethyst)" },
    leaf: { fill: "rgba(16,185,129,0.12)", stroke: "var(--color-emerald)" },
    neutral: { fill: "rgba(22,35,56,0.92)", stroke: "var(--color-border)" },
  }[tone];

  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
    >
      <rect x={-32} y={-16} width={64} height={32} rx={10} fill={styles.fill} stroke={styles.stroke} strokeWidth="1.5" />
      <text x="0" y="5" textAnchor="middle" fill="var(--color-ink)" fontSize="12" fontWeight="600">
        {label}
      </text>
    </motion.g>
  );
}
