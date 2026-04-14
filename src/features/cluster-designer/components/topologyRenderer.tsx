import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  AiFabricDiagramBlock,
  AiFabricDiagramLink,
  TopologyVisualModel,
} from "@/features/cluster-designer/types";

type TopologyRendererProps = {
  model: TopologyVisualModel;
  animated?: boolean;
  highlightStrength?: number;
  mode?: "preview" | "overlay" | "analytical";
  onActiveBlockChange?: (block: AiFabricDiagramBlock | null) => void;
};

type Position = { x: number; y: number };

const DIMENSIONS = {
  preview: { width: 1180, height: 420 },
  analytical: { width: 1180, height: 460 },
  overlay: { width: 1380, height: 620 },
} as const;

export function TopologyRenderer({
  model,
  animated = false,
  highlightStrength = 70,
  mode = "preview",
  onActiveBlockChange,
}: TopologyRendererProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const analytical = mode === "analytical";
  const overlay = mode === "overlay";
  const dimensions = DIMENSIONS[mode];
  const showFrontEnd = model.layoutMode === "full-stack";

  const zones = useMemo(() => {
    const width = dimensions.width;

    if (showFrontEnd) {
      return {
        feZone: { x: 32, y: 26, width: width - 64, height: overlay ? 170 : analytical ? 152 : 140 },
        computeBand: { x: 56, y: overlay ? 228 : analytical ? 210 : 194, width: width - 112, height: overlay ? 96 : 82 },
        beZone: { x: 32, y: overlay ? 352 : analytical ? 322 : 294, width: width - 64, height: overlay ? 232 : analytical ? 182 : 152 },
      };
    }

    return {
      feZone: null,
      computeBand: { x: 56, y: 42, width: width - 112, height: overlay ? 110 : analytical ? 94 : 84 },
      beZone: { x: 32, y: overlay ? 186 : analytical ? 166 : 148, width: width - 64, height: overlay ? 390 : analytical ? 258 : 214 },
    };
  }, [analytical, dimensions, overlay, showFrontEnd]);

  const blocks = useMemo(
    () => [...model.storageBlocks, ...model.frontEndBlocks, ...model.computeBlocks, ...model.backEndBlocks],
    [model],
  );

  const positions = useMemo(() => {
    const positionMap = new Map<string, Position>();

    if (showFrontEnd && zones.feZone) {
      const storageBlocks = model.storageBlocks;
      const storageXs = distribute(storageBlocks.length, zones.feZone.x + 156, zones.feZone.x + zones.feZone.width - 156);
      storageBlocks.forEach((block, index) => {
        positionMap.set(block.id, { x: storageXs[index], y: zones.feZone.y + (overlay ? 56 : 48) });
      });

      const feCore = model.frontEndBlocks.find((block) => block.id === "fe-spine");
      if (feCore) {
        positionMap.set(feCore.id, { x: zones.feZone.x + zones.feZone.width / 2, y: zones.feZone.y + (overlay ? 78 : 66) });
      }

      const accessBlocks = model.frontEndBlocks.filter((block) => block.id.startsWith("fe-access-"));
      const accessXs = distribute(accessBlocks.length, zones.feZone.x + 240, zones.feZone.x + zones.feZone.width - 240);
      accessBlocks.forEach((block, index) => {
        positionMap.set(block.id, { x: accessXs[index], y: zones.feZone.y + (overlay ? 132 : analytical ? 124 : 116) });
      });

      const storageAccessBlocks = model.frontEndBlocks.filter((block) => block.id.startsWith("storage-access-"));
      const storageAccessXs = distribute(
        storageAccessBlocks.length,
        zones.feZone.x + 230,
        zones.feZone.x + zones.feZone.width - 230,
      );
      storageAccessBlocks.forEach((block, index) => {
        positionMap.set(block.id, { x: storageAccessXs[index], y: zones.feZone.y + (overlay ? 132 : analytical ? 124 : 116) });
      });
    }

    const computeXs = distribute(
      model.computeBlocks.length,
      zones.computeBand.x + 120,
      zones.computeBand.x + zones.computeBand.width - 120,
    );
    model.computeBlocks.forEach((block, index) => {
      positionMap.set(block.id, { x: computeXs[index], y: zones.computeBand.y + zones.computeBand.height / 2 });
    });

    const beCore = model.backEndBlocks.find((block) => block.id === "be-spine");
    if (beCore) {
      positionMap.set(beCore.id, {
        x: zones.beZone.x + zones.beZone.width / 2,
        y: zones.beZone.y + (overlay ? 66 : analytical ? 58 : 48),
      });
    }

    const railBlocks = model.backEndBlocks.filter((block) => block.id.startsWith("be-rail-"));
    const railXs = distribute(railBlocks.length, zones.beZone.x + 174, zones.beZone.x + zones.beZone.width - 174);
    railBlocks.forEach((block, index) => {
      positionMap.set(block.id, {
        x: railXs[index],
        y: zones.beZone.y + (overlay ? 170 : analytical ? 134 : 112),
      });
    });

    return positionMap;
  }, [analytical, model, overlay, showFrontEnd, zones]);

  useEffect(() => {
    onActiveBlockChange?.(blocks.find((block) => block.id === activeBlockId) ?? null);
  }, [activeBlockId, blocks, onActiveBlockChange]);

  const pathOpacity = analytical ? 0.84 : overlay ? 0.76 : 0.68;
  const pulseOpacity = 0.24 + Math.min(0.48, highlightStrength / 180);

  return (
    <div className="h-full overflow-hidden rounded-[24px] border border-border/80 bg-[radial-gradient(circle_at_top,_rgba(32,55,108,0.18),_transparent_50%),linear-gradient(180deg,rgba(7,14,33,0.985),rgba(5,10,24,0.99))]">
      <svg
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="h-full w-full"
        role="img"
        aria-label={
          showFrontEnd
            ? "Front-end and back-end AI fabric topology"
            : "Back-end AI fabric topology with shared compute groups"
        }
      >
        <defs>
          <pattern id={`diagram-grid-${mode}`} width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(119,141,181,0.06)" strokeWidth="1" />
          </pattern>
        </defs>

        <rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill={`url(#diagram-grid-${mode})`} opacity="0.34" />

        {zones.feZone ? (
          <Zone
            zone={zones.feZone}
            title={model.frontEndTitle}
            subtitle={model.frontEndSubtitle}
            accent="fe"
          />
        ) : null}
        <Zone
          zone={zones.beZone}
          title={model.backEndTitle}
          subtitle={model.backEndSubtitle}
          accent="be"
        />

        <rect
          x={zones.computeBand.x}
          y={zones.computeBand.y}
          width={zones.computeBand.width}
          height={zones.computeBand.height}
          rx={28}
          fill="rgba(14,20,36,0.76)"
          stroke="rgba(119,141,181,0.16)"
        />
        <text
          x={zones.computeBand.x + 20}
          y={zones.computeBand.y - 10}
          fill="var(--color-label)"
          fontSize={overlay ? "11" : "10"}
          letterSpacing="2.6"
        >
          SHARED COMPUTE ESTATE
        </text>

        {model.representativeLinks.map((link) => {
          const from = positions.get(link.from);
          const to = positions.get(link.to);
          if (!from || !to) return null;

          return (
            <BundledLink
              key={`${link.from}-${link.to}`}
              from={from}
              to={to}
              link={link}
              animated={animated}
              reduceMotion={reduceMotion}
              opacity={pathOpacity}
              pulseOpacity={pulseOpacity}
              analytical={analytical}
            />
          );
        })}

        {blocks.map((block) => {
          const position = positions.get(block.id);
          if (!position) return null;

          return (
            <DiagramBlock
              key={block.id}
              block={block}
              position={position}
              mode={mode}
              active={activeBlockId === block.id}
              onEnter={() => setActiveBlockId(block.id)}
              onLeave={() => setActiveBlockId(null)}
            />
          );
        })}
      </svg>
    </div>
  );
}

function Zone({
  zone,
  title,
  subtitle,
  accent,
}: {
  zone: { x: number; y: number; width: number; height: number };
  title: string;
  subtitle: string;
  accent: "fe" | "be";
}) {
  const stroke = accent === "fe" ? "rgba(79,140,255,0.26)" : "rgba(16,185,129,0.28)";
  const fill = accent === "fe" ? "rgba(13,26,58,0.36)" : "rgba(9,28,25,0.22)";

  return (
    <g>
      <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx={24} fill={fill} stroke={stroke} strokeDasharray="10 12" />
      <text x={zone.x + 20} y={zone.y + 26} fill="var(--color-label)" fontSize="11" letterSpacing="2.8">
        {title.toUpperCase()}
      </text>
      <text x={zone.x + 20} y={zone.y + 46} fill="var(--color-muted)" fontSize="12">
        {subtitle}
      </text>
    </g>
  );
}

function BundledLink({
  from,
  to,
  link,
  animated,
  reduceMotion,
  opacity,
  pulseOpacity,
  analytical,
}: {
  from: Position;
  to: Position;
  link: AiFabricDiagramLink;
  animated: boolean;
  reduceMotion: boolean | null;
  opacity: number;
  pulseOpacity: number;
  analytical: boolean;
}) {
  const midY = (from.y + to.y) / 2;
  const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  const tone = {
    modeled: {
      stroke: "rgba(99,216,181,0.75)",
      width: 2.3,
      dash: undefined,
    },
    representative: {
      stroke: "rgba(79,140,255,0.72)",
      width: 2,
      dash: "10 10",
    },
    "assumption-driven": {
      stroke: "rgba(245,158,11,0.7)",
      width: 1.8,
      dash: "4 10",
    },
  }[link.semantic];

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={tone.stroke}
      strokeWidth={tone.width}
      strokeDasharray={tone.dash}
      opacity={opacity}
      initial={animated ? { pathLength: 0, opacity: 0.15 } : false}
      animate={
        animated
          ? {
              pathLength: 1,
              opacity: analytical ? [opacity * 0.58, pulseOpacity, opacity * 0.58] : opacity,
              strokeDashoffset: tone.dash && !reduceMotion ? [0, -22] : 0,
            }
          : undefined
      }
      transition={{
        pathLength: { duration: reduceMotion ? 0 : 0.45, ease: "easeOut" },
        opacity: { duration: reduceMotion ? 0 : 2.5, repeat: analytical ? Infinity : 0, ease: "easeInOut" },
        strokeDashoffset: {
          duration: reduceMotion ? 0 : 1.6,
          repeat: tone.dash && analytical ? Infinity : 0,
          ease: "linear",
        },
      }}
    />
  );
}

function DiagramBlock({
  block,
  position,
  mode,
  active,
  onEnter,
  onLeave,
}: {
  block: AiFabricDiagramBlock;
  position: Position;
  mode: "preview" | "overlay" | "analytical";
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const style = blockStyle(block.type);
  const dimensions = blockDimensions(block.type, mode);
  const label = mode === "preview" ? block.shortLabel ?? block.label : block.label;

  return (
    <motion.g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={0}
      role="button"
      aria-label={`${block.label}. ${block.compactDetail}`}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: active ? 1.03 : 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
    >
      <motion.rect
        x={-dimensions.width / 2}
        y={-dimensions.height / 2}
        rx={18}
        width={dimensions.width}
        height={dimensions.height}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={active ? "2.2" : "1.4"}
        animate={
          active
            ? { filter: "drop-shadow(0 0 14px rgba(79,140,255,0.18))" }
            : { filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }
        }
        transition={{ duration: reduceMotion ? 0 : 0.18 }}
      />
      <text x={-dimensions.width / 2 + 18} y={-4} fill={style.label} fontSize={dimensions.labelSize} fontWeight="600">
        {label}
      </text>
      <text x={-dimensions.width / 2 + 18} y={18} fill="var(--color-muted)" fontSize={dimensions.detailSize}>
        {block.compactDetail}
      </text>
    </motion.g>
  );
}

function blockDimensions(type: AiFabricDiagramBlock["type"], mode: "preview" | "overlay" | "analytical") {
  const base = {
    preview: { width: 186, height: 58, labelSize: 12, detailSize: 10.5 },
    analytical: { width: 210, height: 64, labelSize: 12.5, detailSize: 11 },
    overlay: { width: 248, height: 74, labelSize: 13, detailSize: 11.5 },
  }[mode];

  if (type === "gpu-rack-group") {
    return { ...base, width: base.width + (mode === "overlay" ? 26 : 18) };
  }

  if (type === "service-domain" || type === "storage-domain") {
    return { ...base, width: base.width + (mode === "overlay" ? 34 : 16), height: base.height - 2 };
  }

  return base;
}

function distribute(count: number, start: number, end: number) {
  if (count <= 1) return [(start + end) / 2];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
}

function blockStyle(type: AiFabricDiagramBlock["type"]) {
  return {
    "fe-spine": {
      fill: "rgba(32,55,108,0.62)",
      stroke: "rgba(79,140,255,0.52)",
      label: "rgba(190,214,255,0.98)",
    },
    "fe-leaf": {
      fill: "rgba(18,43,87,0.58)",
      stroke: "rgba(89,188,255,0.48)",
      label: "rgba(190,214,255,0.98)",
    },
    "be-spine": {
      fill: "rgba(19,61,74,0.6)",
      stroke: "rgba(53,184,170,0.52)",
      label: "rgba(197,247,238,0.98)",
    },
    "be-leaf": {
      fill: "rgba(14,49,45,0.6)",
      stroke: "rgba(65,201,144,0.46)",
      label: "rgba(197,247,238,0.98)",
    },
    "gpu-rack-group": {
      fill: "rgba(23,31,50,0.94)",
      stroke: "rgba(119,141,181,0.42)",
      label: "rgba(231,238,255,0.98)",
    },
    "storage-domain": {
      fill: "rgba(83,53,18,0.6)",
      stroke: "rgba(245,158,11,0.5)",
      label: "rgba(255,227,182,0.98)",
    },
    "service-domain": {
      fill: "rgba(47,42,83,0.58)",
      stroke: "rgba(139,92,246,0.48)",
      label: "rgba(229,219,255,0.98)",
    },
  }[type];
}
