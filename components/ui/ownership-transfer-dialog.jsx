"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Ownership Transfer Confirmation Dialog Component
 * Dialog for confirming organization ownership transfer when promoting staff to admin
 */
export function OwnershipTransferDialog({
  isOpen,
  onClose,
  onConfirm,
  targetUserName,
  isLoading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-left">
                Ownership Transfer Warning
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-left">
          You are about to promote "{targetUserName}" to Admin role. This will
          transfer organization ownership to them, change your role to Staff,
          and log you out automatically. This action cannot be undone.
        </DialogDescription>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
