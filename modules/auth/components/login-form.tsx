"use client";

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
  loginSchema,
  type LoginInput,
} from "@/modules/auth/schema/auth.schema";
import { loginAction } from "@/modules/auth/service/auth.service";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginInput) {
    const formData = new FormData();

    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await loginAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Masuk ke akun Anda</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan email Anda untuk masuk ke akun
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="bg-background"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email?.message && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
            <a
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Lupa kata sandi?
            </a>
          </div>

          <Input
            id="password"
            type="password"
            className="bg-background"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password?.message && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </Field>

        <Field>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Masuk"}
          </Button>
        </Field>

        <FieldSeparator>Atau lanjutkan dengan</FieldSeparator>

        <Field>
          <Button variant="outline" type="button" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Masuk dengan Google
          </Button>

          <FieldDescription className="text-center">
            Belum punya akun?{" "}
            <a href="/register" className="underline underline-offset-4">
              Daftar
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}