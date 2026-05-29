"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { loginSchema, type LoginInput } from "@/modules/auth/schema/auth.schema"
import { loginAction } from "@/modules/auth/service/auth.service"

interface AdminLoginFormProps extends React.ComponentProps<"form"> {}

export function AdminLoginForm({ className, ...props }: AdminLoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginInput) {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", values.email)
      formData.append("password", values.password)

      const result = await loginAction(formData)

      if (!result.success) {
        toast.error(result.message)
        setIsLoading(false)
        return
      }

      toast.success(result.message)
      // Redirect to admin dashboard
      router.push("/admin/dashboard")
    } catch (error) {
      toast.error("Terjadi kesalahan saat masuk")
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-4 text-left", className)}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs font-semibold text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder=""
          className="h-10 w-full border border-gray-300 rounded-md px-3 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black text-sm"
          disabled={isLoading}
          {...register("email")}
        />
        {errors.email?.message && (
          <p className="text-xs text-red-500 mt-0.5">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs font-semibold text-gray-700">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder=""
          className="h-10 w-full border border-gray-300 rounded-md px-3 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-black text-sm"
          disabled={isLoading}
          {...register("password")}
        />
        {errors.password?.message && (
          <p className="text-xs text-red-500 mt-0.5">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5 mt-2">
        <Button
          type="submit"
          className="w-35 h-8.5 bg-[#2F54EB] hover:bg-blue-700 text-white font-medium text-xs rounded-[6px] shadow-xs cursor-pointer transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Login"}
        </Button>
        <a href="/register" className="text-[10px] text-red-500 hover:underline">
          Don't have an account? Register here
        </a>
      </div>
    </form>
  )
}
