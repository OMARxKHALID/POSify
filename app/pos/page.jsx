"use client";
import { POSLayout } from "@/components/pos/pos-layout";
import { POSHeader } from "@/components/pos/pos-header";
import { POSContent } from "@/components/pos/pos-content";
import { POSMobileContent } from "@/components/pos/pos-mobile-content";

export default function POSPage() {
  return (
    <POSLayout>
      <POSHeader />

      <div className="hidden lg:block">
        <POSContent />
      </div>

      <div className="lg:hidden">
        <POSMobileContent />
      </div>
    </POSLayout>
  );
}
