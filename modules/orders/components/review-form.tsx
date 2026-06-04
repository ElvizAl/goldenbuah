"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Star, Camera, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createReviewAction } from "@/modules/orders/service/review.service";
import { uploadImage } from "@/shared/lib/upload-image";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
  onSuccess?: () => void;
}

export function ReviewForm({
  orderId,
  productId,
  productName,
  productImageUrl,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 5MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit() {
    if (rating === 0) {
      toast.error("Pilih bintang terlebih dahulu.");
      return;
    }

    startTransition(async () => {
      try {
        let imageUrl: string | null = null;
        if (imageFile) {
          imageUrl = await uploadImage(imageFile, "reviews");
        }

        const formData = new FormData();
        formData.set("orderId", orderId);
        formData.set("productId", productId);
        formData.set("rating", String(rating));
        if (comment.trim()) formData.set("comment", comment.trim());
        if (imageUrl) formData.set("imageUrl", imageUrl);

        const result = await createReviewAction(formData);
        if (result.success) {
          toast.success(result.message);
          onSuccess?.();
        } else {
          toast.error(result.message);
        }
      } catch {
        toast.error("Gagal mengirim ulasan.");
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Product Info */}
      <div className="flex items-center gap-3">
        {productImageUrl ? (
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
            <Image
              src={productImageUrl}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50">
            <span className="text-xl">🛒</span>
          </div>
        )}
        <p className="text-sm font-semibold text-neutral-800">{productName}</p>
      </div>

      {/* Star Rating */}
      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500">Rating *</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-neutral-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="mt-1 text-xs text-neutral-400">
            {["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"][rating]}
          </p>
        )}
      </div>

      {/* Comment */}
      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500">Komentar (opsional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Ceritakan pengalamanmu dengan produk ini..."
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <p className="mt-1 text-right text-xs text-neutral-400">
          {comment.length}/1000
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500">Foto (opsional)</p>
        {imagePreview ? (
          <div className="relative inline-block">
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-neutral-200">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-200 text-neutral-400 transition hover:border-cyan-400 hover:text-cyan-500"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">Tambah foto</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || rating === 0}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Mengirim..." : "Kirim Ulasan"}
      </button>
    </div>
  );
}
