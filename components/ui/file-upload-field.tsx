import { FileText, X } from "lucide-react";

type FileUploadFieldProps = {
  label: string;
  displayName: string | null | undefined;
  hasNewFile: boolean;
  onClear: () => void;
  clearAriaLabel: string;
  inputKey: number;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
};

export function FileUploadField({
  label,
  displayName,
  hasNewFile,
  onClear,
  clearAriaLabel,
  inputKey,
  inputProps,
}: FileUploadFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground-muted mb-2">
        {label}
      </label>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary-glow px-4 py-5 text-center transition hover:border-primary/50 hover:bg-primary/15">
        {displayName ? (
          <>
            <div className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left shadow-sm">
              <div className="rounded-lg bg-error/20 p-2">
                <FileText className="h-5 w-5 text-error" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-foreground-dim">Documento PDF</p>
              </div>
              {hasNewFile && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
                  className="ml-auto rounded p-1 text-foreground-dim transition hover:bg-surface-elevated hover:text-foreground"
                  aria-label={clearAriaLabel}
                  title="Remover arquivo"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <span className="text-xs text-primary/70">Clique para substituir o arquivo</span>
          </>
        ) : (
          <>
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium text-primary">Selecionar {label}</span>
            <span className="text-xs text-primary/70">Clique para anexar um PDF</span>
          </>
        )}
        <input key={inputKey} type="file" {...inputProps} className="sr-only" accept=".pdf" />
      </label>
    </div>
  );
}
