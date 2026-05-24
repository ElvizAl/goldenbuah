"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/shared/components/ui/input-otp";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/modules/auth/schema/auth.schema";
import {
  forgotPasswordAction,
  resetPasswordWithOtpAction,
} from "@/modules/auth/service/auth.service";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "reset">("request");
  const [userEmail, setUserEmail] = useState("");

  // Step 1: Request OTP Form
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest, isSubmitting: isSubmittingRequest },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Step 2: Reset Password Form
  const {
    control: controlReset,
    register: registerReset,
    handleSubmit: handleSubmitReset,
    watch: watchReset,
    formState: { errors: errorsReset, isSubmitting: isSubmittingReset },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpValue = watchReset("otp") || "";

  async function onRequestSubmit(values: ForgotPasswordInput) {
    const formData = new FormData();
    formData.append("email", values.email);

    const result = await forgotPasswordAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setUserEmail(values.email);
    setStep("reset");
  }

  async function onResetSubmit(values: ResetPasswordInput) {
    const formData = new FormData();
    formData.append("email", userEmail);
    formData.append("otp", values.otp);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);

    const result = await resetPasswordWithOtpAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/login");
  }

  if (step === "request") {
    return (
      <form
        onSubmit={handleSubmitRequest(onRequestSubmit)}
        className={cn("flex flex-col gap-6", className)}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Lupa Kata Sandi</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Masukkan email Anda dan kami akan mengirimkan kode OTP untuk mengatur
              ulang kata sandi Anda.
            </p>
          </div>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className="bg-background"
              aria-invalid={!!errorsRequest.email}
              disabled={isSubmittingRequest}
              {...registerRequest("email")}
            />
            {errorsRequest.email?.message && (
              <p className="text-sm text-destructive mt-1">
                {errorsRequest.email.message}
              </p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isSubmittingRequest}>
              {isSubmittingRequest ? "Mengirim kode..." : "Kirim Kode OTP"}
            </Button>
          </Field>

          <Field>
            <FieldDescription className="text-center">
              Sudah ingat kata sandi?{" "}
              <a href="/login" className="underline underline-offset-4">
                Masuk
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmitReset(onResetSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Kata Sandi</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan kode OTP yang dikirim ke{" "}
            <span className="font-semibold text-foreground break-all">{userEmail}</span>{" "}
            dan buat kata sandi baru Anda.
          </p>
        </div>

        <Field>
          <div className="flex flex-col items-center gap-2">
            <FieldLabel>Kode OTP</FieldLabel>
            <Controller
              control={controlReset}
              name="otp"
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isSubmittingReset}
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
            {errorsReset.otp?.message && (
              <p className="text-sm text-destructive mt-1">
                {errorsReset.otp.message}
              </p>
            )}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Kata Sandi Baru</FieldLabel>
          <Input
            id="password"
            type="password"
            className="bg-background"
            aria-invalid={!!errorsReset.password}
            disabled={isSubmittingReset}
            {...registerReset("password")}
          />
          {errorsReset.password?.message && (
            <p className="text-sm text-destructive mt-1">
              {errorsReset.password.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Konfirmasi Kata Sandi Baru
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            className="bg-background"
            aria-invalid={!!errorsReset.confirmPassword}
            disabled={isSubmittingReset}
            {...registerReset("confirmPassword")}
          />
          {errorsReset.confirmPassword?.message && (
            <p className="text-sm text-destructive mt-1">
              {errorsReset.confirmPassword.message}
            </p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmittingReset || otpValue.length < 4}>
            {isSubmittingReset ? "Memperbarui sandi..." : "Perbarui Kata Sandi"}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Salah email?{" "}
            <button
              type="button"
              onClick={() => setStep("request")}
              className="underline cursor-pointer hover:text-primary"
            >
              Ubah email
            </button>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
