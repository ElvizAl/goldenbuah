"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, CreditCard, QrCode } from "lucide-react";
import { adminConfirmPaymentAction } from "@/modules/orders/service/payment.service";

interface AdminPaymentConfirmProps {
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    proofImageUrl?: string | null;
    bankName?: string | null;
    note?: string | null;
    rejectedReason?: string | null;
    paidAt?: Date | string | null;
    confirmedAt?: Date | string | null;
  };
}

export function AdminPaymentConfirm({ payment }: AdminPaymentConfirmProps) {
  const [isPending, startTransition] = useTransition();
  const [rejectedReason, setRejectedReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  function handleConfirm() {
    startTransition(async () => {
      const result = await adminConfirmPaymentAction(payment.id, "CONFIRM");
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleReject() {
    if (!rejectedReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    startTransition(async () => {
      const result = await adminConfirmPaymentAction(payment.id, "REJECT", rejectedReason);
      if (result.success) {
        toast.success(result.message);
        setShowRejectForm(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  const statusConfig = {
    WAITING_CONFIRMATION: { label: "Menunggu Konfirmasi", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
    PAID: { label: "Dikonfirmasi", color: "text-green-600 bg-green-50 border-green-200" },
    REJECTED: { label: "Ditolak", color: "text-red-600 bg-red-50 border-red-200" },
    PENDING: { label: "Belum Bayar", color: "text-gray-600 bg-gray-50 border-gray-200" },
    CANCELLED: { label: "Dibatalkan", color: "text-gray-600 bg-gray-50 border-gray-200" },
  } as const;

  const cfg = statusConfig[payment.status as keyof typeof statusConfig];

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        Info Pembayaran
      </h2>

      {/* Status & Amount */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {payment.method === "BANK_TRANSFER" ? (
            <CreditCard className="h-4 w-4 text-gray-400" />
          ) : (
            <QrCode className="h-4 w-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {payment.method === "BANK_TRANSFER"
              ? `Transfer Bank${payment.bankName ? ` (${payment.bankName})` : ""}`
              : "QRIS"}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-900">
          Rp {payment.amount.toLocaleString("id-ID")}
        </span>
      </div>

      {/* Status Badge */}
      {cfg && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${cfg.color}`}>
          {payment.status === "WAITING_CONFIRMATION" && <Clock className="h-4 w-4" />}
          {payment.status === "PAID" && <CheckCircle className="h-4 w-4" />}
          {payment.status === "REJECTED" && <XCircle className="h-4 w-4" />}
          {cfg.label}
        </div>
      )}

      {/* Catatan user */}
      {payment.note && (
        <p className="mb-3 text-xs text-gray-500">
          Catatan: <span className="text-gray-700">{payment.note}</span>
        </p>
      )}

      {/* Alasan tolak */}
      {payment.status === "REJECTED" && payment.rejectedReason && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-100 p-2 text-xs text-red-600">
          Alasan: {payment.rejectedReason}
        </div>
      )}

      {/* Bukti Pembayaran */}
      {payment.proofImageUrl && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Bukti Pembayaran
          </p>
          <a href={payment.proofImageUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-gray-50 hover:opacity-90 transition">
              <Image
                src={payment.proofImageUrl}
                alt="Bukti pembayaran"
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-1 text-center text-xs text-blue-500 hover:underline">
              Klik untuk lihat ukuran penuh
            </p>
          </a>
        </div>
      )}

      {/* Aksi Admin — hanya jika WAITING_CONFIRMATION */}
      {payment.status === "WAITING_CONFIRMATION" && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "✓ Konfirmasi Pembayaran"}
          </button>

          {!showRejectForm ? (
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              disabled={isPending}
              className="w-full rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              ✕ Tolak Pembayaran
            </button>
          ) : (
            <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-medium text-red-700">Alasan penolakan:</p>
              <textarea
                value={rejectedReason}
                onChange={(e) => setRejectedReason(e.target.value)}
                rows={2}
                placeholder="Contoh: Nominal tidak sesuai, bukti tidak terbaca..."
                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                >
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRejectForm(false); setRejectedReason(""); }}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
