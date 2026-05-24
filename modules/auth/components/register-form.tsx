"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  registerSchema,
  type RegisterInput,
} from "@/modules/auth/schema/auth.schema";
import { registerAction } from "@/modules/auth/service/auth.service";
import { authClient } from "../auth-client";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isGooglePending, setIsGooglePending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("confirmPassword", values.confirmPassword);

    const result = await registerAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/login");
  }

  async function handleGoogleRegister() {
    setIsGooglePending(true);

    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });

    if (error) {
      toast.error(error.message || "Register Google gagal.");
      setIsGooglePending(false);
    }
  }

  const isLoading = isSubmitting || isGooglePending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Buat akun baru</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan data Anda untuk membuat akun
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-background"
            aria-invalid={!!errors.name}
            disabled={isLoading}
            {...register("name")}
          />
          {errors.name?.message && (
            <p className="text-sm text-destructive">
              {errors.name.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="bg-background"
            aria-invalid={!!errors.email}
            disabled={isLoading}
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
          <Input
            id="password"
            type="password"
            className="bg-background"
            aria-invalid={!!errors.password}
            disabled={isLoading}
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">
            Konfirmasi Kata Sandi
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            className="bg-background"
            aria-invalid={!!errors.confirmPassword}
            disabled={isLoading}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword?.message && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isLoading}>
            {isSubmitting ? "Mendaftarkan..." : "Daftar"}
          </Button>
        </Field>

        <FieldSeparator>Atau lanjutkan dengan</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isLoading}
            onClick={handleGoogleRegister}
          >
            {isGooglePending ? "Menghubungkan..." : "Daftar dengan Google"}
          </Button>

          <FieldDescription className="text-center">
            Sudah punya akun?{" "}
            <a href="/login" className="underline underline-offset-4">
              Masuk
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}