import { Loader2 } from "lucide-react";

export function ToolLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500">
      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      <span>{label}</span>
    </div>
  );
}
