import type { ComponentProps } from "react";
import { ArchitectureCard } from "@/components/ui/ArchitectureCard";

type CardProps = ComponentProps<typeof ArchitectureCard>;

export function Card(props: CardProps) {
  return <ArchitectureCard {...props} />;
}
