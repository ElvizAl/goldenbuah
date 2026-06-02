"use client";

import { DownloadIcon } from "lucide-react";

interface ExportPdfButtonProps {
  label?: string;
}

export function ExportPdfButton({ label = "Export PDF" }: ExportPdfButtonProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <button
      onClick={handlePrint}
      className="no-print inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-orange-500 dark:hover:text-orange-400"
    >
      <DownloadIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
