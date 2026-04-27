import { ExternalLink, FileText } from "lucide-react";
import { getFileNameFromUrl } from "@/lib/formatters";

type SaleDocumentLinkProps = {
  url: string | null | undefined;
};

export function SaleDocumentLink({ url }: SaleDocumentLinkProps) {
  if (!url) {
    return <span className="text-gray-400">-</span>;
  }

  const href = url.startsWith("http://") || url.startsWith("https://") ? url : undefined;
  const fileName = getFileNameFromUrl(url);

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex w-full max-w-64 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-700 transition hover:border-blue-300 hover:bg-blue-50"
        title={fileName}
      >
        <span className="rounded bg-red-100 p-1">
          <FileText className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-blue-600" aria-hidden="true" />
      </a>
    );
  }

  return (
    <div
      className="inline-flex w-full max-w-64 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-700"
      title={fileName}
    >
      <span className="rounded bg-red-100 p-1">
        <FileText className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs">{fileName}</span>
    </div>
  );
}
