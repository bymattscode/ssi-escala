import React from "react";
import { AlertTriangle, Info, CheckCircle, XCircle, ShieldAlert, FileQuestion } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = FileQuestion, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="bg-card/30 border border-dashed border-border/70 rounded-2xl p-10 flex flex-col items-center justify-center text-center my-6 max-w-md mx-auto transition-all duration-300 hover:bg-card/40 hover:border-primary/30">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-4 shadow-sm animate-pulse">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-bold text-foreground text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-semibold text-sm border border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card/40 border border-border/50 rounded-xl p-4 flex flex-col gap-4 animate-pulse shadow-sm">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-secondary/80 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 w-3/5 bg-secondary/80 rounded" />
          <div className="h-3 w-2/5 bg-secondary/50 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/40">
        <div className="h-8 bg-secondary/40 rounded" />
        <div className="h-8 bg-secondary/40 rounded" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-card/40 border border-border/50 rounded-xl overflow-hidden animate-pulse shadow-sm">
      <div className="h-12 bg-secondary/60 border-b border-border/50" />
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 w-1/3">
              <div className="h-9 w-9 rounded-lg bg-secondary/80" />
              <div className="h-4 w-4/5 bg-secondary/60 rounded" />
            </div>
            <div className="h-4 w-1/4 bg-secondary/50 rounded" />
            <div className="h-6 w-24 bg-secondary/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  onConfirm,
  onClose,
  isLoading = false
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: ShieldAlert,
          iconColor: "text-red-500 bg-red-500/10 border-red-500/20",
          button: "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
        };
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
          button: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20"
        };
      default:
        return {
          icon: Info,
          iconColor: "text-primary bg-primary/10 border-primary/20",
          button: "bg-primary hover:bg-primary/90 text-primary-foreground"
        };
    }
  };

  const style = getVariantStyles();
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-30" />
        
        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 border ${style.iconColor} shadow-inner`}>
          <Icon className="h-7 w-7" />
        </div>
        
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6 px-2">{description}</p>
        
        <div className="flex items-center gap-3 w-full justify-end pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground hover:bg-secondary/60 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${style.button} disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, required = false, error, children, helperText }: { label: string; required?: boolean; error?: string; children: React.ReactNode; helperText?: string }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-red-500 font-bold">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-muted-foreground/80">{helperText}</span>}
    </div>
  );
}
