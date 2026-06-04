"use client";

import { Printer } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function PrintInvoiceButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
    >
      <Printer className="h-4 w-4" />
      Cetak / Simpan PDF
    </Button>
  );
}
