"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function FormActions({
  isLoading = false,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  submitIcon: SubmitIcon,
  showCancel = true,
  className = "",
}) {
  const router = useRouter();

  const handleCancel = onCancel || (() => router.back());

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:justify-end pt-6 ${className}`}
    >
      {showCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {submitText}...
          </>
        ) : (
          <>
            {SubmitIcon && <SubmitIcon className="h-4 w-4" />}
            {submitText}
          </>
        )}
      </Button>
    </div>
  );
}
