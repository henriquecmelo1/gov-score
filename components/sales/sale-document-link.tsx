import { ExternalLink, FileText } from "lucide-react";
import { getFileNameFromUrl } from "@/lib/formatters";

type SaleDocumentLinkProps = {
  url: string | null | undefined;
};

export function SaleDocumentLink({ url }: SaleDocumentLinkProps) {
  if (!url) {
    return <span className="text-foreground-dim">-</span>;
  }

  const href = url.startsWith("http://") || url.startsWith("https://") ? url : undefined;
  const fileName = getFileNameFromUrl(url);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex w-full max-w-64 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-foreground-muted transition hover:border-primary/40 hover:bg-primary-glow"
        title={fileName}
      >
        <span className="rounded bg-error/20 p-1">
          <FileText className="h-3.5 w-3.5 text-error" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground-dim group-hover:text-primary" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div
      className="inline-flex w-full max-w-64 items-center gap-2 rounded-lg border border-border bg-surface-elevated px-2 py-1.5 text-foreground-muted"
      title={fileName}
    >
      <span className="rounded bg-error/20 p-1">
        <FileText className="h-3.5 w-3.5 text-error" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
    </div>
  );
}
