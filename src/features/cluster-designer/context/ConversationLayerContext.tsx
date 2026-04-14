import type { ReactNode } from "react";
import { createContext, useContext } from "react";

export type ConversationLayerState = {
  showConversationLayer: boolean;
};

const ConversationLayerContext = createContext<ConversationLayerState>({
  showConversationLayer: true,
});

export function ConversationLayerProvider({
  value,
  children,
}: {
  value: ConversationLayerState;
  children: ReactNode;
}) {
  return (
    <ConversationLayerContext.Provider value={value}>
      {children}
    </ConversationLayerContext.Provider>
  );
}

export function useConversationLayer() {
  return useContext(ConversationLayerContext);
}
