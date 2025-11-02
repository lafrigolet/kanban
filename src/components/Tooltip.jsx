import * as Tooltip from "@radix-ui/react-tooltip";

export const Provider = Tooltip.Provider;

export function Tip({ tip, children }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          sideOffset={6}
          className="z-50 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md animate-in fade-in"
        >
          {tip}
          <Tooltip.Arrow className="fill-slate-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

