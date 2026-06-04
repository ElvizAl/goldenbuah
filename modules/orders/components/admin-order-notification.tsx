"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getPendingOrderCount } from "@/modules/orders/service/admin-notification.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";

export function AdminOrderNotification({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    const result = await getPendingOrderCount();
    if (result.success) setCount(result.count);
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label="Notifikasi pesanan"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifikasi Pesanan</span>
          {count > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
              {count} baru
            </span>
          )}
        </div>
        <div className="px-4 py-4">
          {count === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-2">
              Tidak ada pesanan baru yang menunggu.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-100 p-3">
                <Bell className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {count} pesanan menunggu konfirmasi
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Segera proses pesanan yang masuk.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/dashboard/orders"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-neutral-900 hover:bg-neutral-700 text-white text-center text-sm font-medium py-2 transition-colors"
              >
                Lihat Semua Pesanan
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
