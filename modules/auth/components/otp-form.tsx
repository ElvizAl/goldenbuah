import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/shared/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/shared/components/ui/input-otp"

export function OtpForm({
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
          <h1 className="text-2xl font-bold">Verifikasi OTP</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Masukkan kode 6 digit yang telah dikirim ke email Anda
          </p>
        </div>

        <Field>
          <div className="flex justify-center">
            <InputOTP maxLength={6} name="code">
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
          </div>
        </Field>

        <Field>
          <Button type="submit">Verifikasi</Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Tidak menerima kode?{" "}
            <button
              type="button"
              className="underline underline-offset-4 hover:text-primary"
            >
              Kirim ulang
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
  )
}