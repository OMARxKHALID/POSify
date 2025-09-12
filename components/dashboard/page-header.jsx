"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  icon: Icon,
  showBackButton = false,
  onBackClick,
  children,
}) {
  return (
    <div className="space-y-4">
      {showBackButton && (
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
