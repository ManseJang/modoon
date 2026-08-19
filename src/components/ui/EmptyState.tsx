import type { ReactNode } from "react";

export default function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      {icon && <div className="mb-1 text-muted">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
    </div>
  );
}
