import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Lupa Kata Sandi</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan email Anda dan kami akan mengirimkan link untuk mengatur
            ulang kata sandi
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            className="bg-background"
          />
        </Field>

        <Field>
          <Button type="submit">Kirim Link Reset</Button>
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
  )
}