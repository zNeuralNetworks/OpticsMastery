import { Disclosure } from "@/components/ui/Disclosure";

type ConversationHelperProps = {
  show: boolean;
  children: string;
};

export function ConversationHelper({ show, children }: ConversationHelperProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="mt-5">
      <Disclosure label="How to explain this">
        <div className="border-l-2 border-indigo/50 pl-4">
          <p className="data-label text-indigo">Customer talk track</p>
          <p className="mt-2 text-sm leading-6 text-muted">{children}</p>
        </div>
      </Disclosure>
    </div>
  );
}
