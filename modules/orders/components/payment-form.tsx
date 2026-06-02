"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { CreditCard, QrCode, Upload, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { submitPaymentAction } from "@/modules/orders/service/payment.service";
import { uploadImage } from "@/shared/lib/upload-image";

interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface PaymentFormProps {
  orderId: string;
  total: number;
  bankAccounts: BankAccount[];
  qrisImageUrl: string | null;
  // Jika payment sudah ada (untuk tampilkan status)
  existingPayment?: {
    id: string;
    method: string;
    status: string;
    proofImageUrl?: string | null;
    rejectedReason?: string | null;
    bankName?: string | null;
  } | null;
}

export function PaymentForm({
  orderId,
  total,
  bankAccounts,
  qrisImageUrl,
  existingPayment,
}: PaymentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<"BANK_TRANSFER" | "QRIS">("BANK_TRANSFER");
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(
    bankAccounts[0] ?? null
  );
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  // Jika sudah ada payment dan statusnya bukan REJECTED, tampilkan status saja
  if (
    existingPayment &&
    existingPayment.status !== "REJECTED"
  ) {
    return <PaymentStatus payment={existingPayment} total={total} />;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  }

  function handleSubmit() {
    if (!proofFile) {
      toast.error("Upload bukti pembayaran terlebih dahulu.");
      return;
    }
    if (method === "BANK_TRANSFER" && !selectedBank) {
      toast.error("Pilih bank tujuan transfer.");
      return;
    }

    startTransition(async () => {
      try {
        setUploading(true);
        // Upload gambar ke Vercel Blob
        const imageUrl = await uploadImage(proofFile, "payments");
        setUploading(false);

        const formData = new FormData();
        formData.set("orderId", orderId);
        formData.set("method", method);
        formData.set("proofImageUrl", imageUrl);
        if (method === "BANK_TRANSFER" && selectedBank) {
          formData.set("bankName", selectedBank.bankName);
        }
        if (note) formData.set("note", note);

        const result = await submitPaymentAction(formData);

        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch {
        setUploading(false);
        toast.error("Gagal mengupload bukti pembayaran.");
      }
    });
  }

  const isLoading = isPending || uploading;

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        Lakukan Pembayaran
      </h2>

      {/* Rejection notice */}
      {existingPayment?.status === "REJECTED" && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Pembayaran ditolak</p>
            {existingPayment.rejectedReason && (
              <p className="mt-0.5 text-red-600">{existingPayment.rejectedReason}</p>
            )}
            <p className="mt-1 text-red-500">Silakan upload ulang bukti pembayaran.</p>
          </div>
        </div>
      )}

      {/* Total */}
      <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center">
        <p className="text-xs text-yellow-700">Total yang harus dibayar</p>
        <p className="text-xl font-bold text-yellow-900">
          Rp {total.toLocaleString("id-ID")}
        </p>
      </div>

      {/* Pilih Metode */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setMethod("BANK_TRANSFER")}
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
            method === "BANK_TRANSFER"
              ? "border-yellow-400 bg-yellow-50 text-yellow-800"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Transfer Bank
        </button>
        <button
          type="button"
          onClick={() => setMethod("QRIS")}
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
            method === "QRIS"
              ? "border-yellow-400 bg-yellow-50 text-yellow-800"
              : "border-gray-200 text-gray-600 hover:border-gray-300"
          }`}
        >
          <QrCode className="h-4 w-4" />
          QRIS
        </button>
      </div>

      {/* Bank Transfer */}
      {method === "BANK_TRANSFER" && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Pilih Rekening Tujuan
          </p>
          {bankAccounts.map((bank) => (
            <label
              key={bank.bankName}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                selectedBank?.bankName === bank.bankName
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="bank"
                  checked={selectedBank?.bankName === bank.bankName}
                  onChange={() => setSelectedBank(bank)}
                  className="accent-yellow-400"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{bank.bankName}</p>
                  <p className="text-xs text-gray-500">a.n. {bank.accountName}</p>
                </div>
              </div>
              <p className="font-mono text-sm font-semibold text-gray-800">
                {bank.accountNumber}
              </p>
            </label>
          ))}
          <p className="text-xs text-gray-400">
            * Transfer tepat sesuai nominal, sertakan bukti transfer.
          </p>
        </div>
      )}

      {/* QRIS */}
      {method === "QRIS" && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Scan QR Code
          </p>
          {qrisImageUrl ? (
            <div className="flex justify-center">
              <div className="relative h-48 w-48 overflow-hidden rounded-lg border bg-white p-2">
                <Image
                  src={qrisImageUrl}
                  alt="QRIS"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
              QR Code belum dikonfigurasi. Hubungi toko.
            </div>
          )}
          <p className="mt-2 text-center text-xs text-gray-400">
            * Screenshot bukti pembayaran QRIS setelah berhasil.
          </p>
        </div>
      )}

      {/* Upload Bukti */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
          Upload Bukti Pembayaran
        </p>
        {proofPreview ? (
          <div className="relative">
            <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-gray-50">
              <Image
                src={proofPreview}
                alt="Bukti pembayaran"
                fill
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setProofFile(null);
                setProofPreview(null);
              }}
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 text-center transition hover:border-yellow-300 hover:bg-yellow-50">
            <Upload className="mb-2 h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">Klik untuk upload foto bukti</span>
            <span className="mt-1 text-xs text-gray-400">JPG, PNG, maksimal 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Catatan */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
          Catatan (opsional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: sudah transfer pukul 10:00"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !proofFile}
        className="w-full rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500 disabled:opacity-50"
      >
        {isLoading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
      </button>
    </div>
  );
}

// ─── Komponen Status Payment ──────────────────────────────────────────────
function PaymentStatus({
  payment,
  total,
}: {
  payment: {
    method: string;
    status: string;
    proofImageUrl?: string | null;
    bankName?: string | null;
  };
  total: number;
}) {
  const statusConfig = {
    WAITING_CONFIRMATION: {
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      label: "Menunggu Konfirmasi",
      color: "bg-yellow-50 border-yellow-200 text-yellow-700",
    },
    PAID: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: "Pembayaran Dikonfirmasi",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    CANCELLED: {
      icon: <XCircle className="h-5 w-5 text-gray-400" />,
      label: "Pembayaran Dibatalkan",
      color: "bg-gray-50 border-gray-200 text-gray-600",
    },
  } as const;

  const cfg = statusConfig[payment.status as keyof typeof statusConfig];

  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        Status Pembayaran
      </h2>

      {/* Total */}
      <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center">
        <p className="text-xs text-yellow-700">Total yang dibayar</p>
        <p className="text-xl font-bold text-yellow-900">
          Rp {total.toLocaleString("id-ID")}
        </p>
      </div>

      {/* Status */}
      {cfg && (
        <div className={`mb-4 flex items-center gap-3 rounded-lg border p-3 ${cfg.color}`}>
          {cfg.icon}
          <div>
            <p className="text-sm font-semibold">{cfg.label}</p>
            <p className="text-xs">
              {payment.method === "BANK_TRANSFER"
                ? `Transfer Bank${payment.bankName ? ` (${payment.bankName})` : ""}`
                : "QRIS"}
            </p>
          </div>
        </div>
      )}

      {/* Bukti */}
      {payment.proofImageUrl && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Bukti Pembayaran
          </p>
          <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-gray-50">
            <Image
              src={payment.proofImageUrl}
              alt="Bukti pembayaran"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
