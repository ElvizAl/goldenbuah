"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/shared/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/shared/components/ui/input-otp";
import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/modules/auth/schema/auth.schema";
import {
  verifyEmailOtpAction,
  resendEmailVerificationOtpAction,
} from "@/modules/auth/service/auth.service";

export function OtpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [isResendPending, setIsResendPending] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailParam,
      otp: "",
    },
  });

  const email = watch("email");
  const otp = watch("otp");

  // Sync email from search parameters if available
  useEffect(() => {
    if (emailParam) {
      setValue("email", emailParam);
    }
  }, [emailParam, setValue]);

  async function onSubmit(values: VerifyEmailInput) {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("otp", values.otp);

    const result = await verifyEmailOtpAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/login");
  }

  async function handleResend() {
    if (!email) {
      toast.error("Email tidak ditemukan. Silakan isi email terlebih dahulu.");
      return;
    }

    setIsResendPending(true);
    try {
      const result = await resendEmailVerificationOtpAction(email);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Gagal mengirim ulang kode OTP.");
    } finally {
      setIsResendPending(false);
    }
  }

  const isLoading = isSubmitting || isResendPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verifikasi OTP</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan kode 6 digit yang telah dikirim ke{" "}
            <span className="font-semibold text-foreground break-all">
              {email || "email Anda"}
            </span>
          </p>
        </div>

        <Field>
          <div className="flex flex-col items-center gap-2">
            <Controller
              control={control}
              name="otp"
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>

                  <InputOTPSeparator />

                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            {errors.otp?.message && (
              <p className="text-sm text-destructive mt-1">
                {errors.otp.message}
              </p>
            )}
            {errors.email?.message && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading || otp.length < 4}>
            {isSubmitting ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Tidak menerima kode?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading || !email}
              className="underline underline-offset-4 hover:text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResendPending ? "Mengirim ulang..." : "Kirim ulang"}
            </button>
          </FieldDescription>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            <a href="/login" className="underline underline-offset-4">
              Kembali ke halaman masuk
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
