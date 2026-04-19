"use client";

import { useMutationState } from "@tanstack/react-query";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/ui-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SyncIndicator() {
  const pendingMutations = useMutationState({
    filters: { status: "pending" },
    select: (mutation) => mutation.state.variables,
  });

  const failedMutations = useMutationState({
    filters: { status: "error" },
  });

  const isSyncing = pendingMutations.length > 0;
  const hasError = failedMutations.length > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300",
              isSyncing
                ? "bg-primary/5 border-primary/20"
                : hasError
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-background border-border",
            )}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary/80">
                  Syncing
                </span>
              </>
            ) : hasError ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-destructive animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-destructive">
                  Error
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                  Online
                </span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-64 p-3">
          <div className="space-y-1">
            <p className="font-semibold">
              {isSyncing
                ? "Syncing in progress"
                : hasError
                  ? "Sync failed"
                  : "System Ready"}
            </p>
            <p className="text-muted-foreground">
              {isSyncing
                ? `Pushing ${pendingMutations.length} update(s) to the local database.`
                : hasError
                  ? "One or more operations failed to sync. Please check your connection."
                  : "All data is successfully persisted in your local browser storage."}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
