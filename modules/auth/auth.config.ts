import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP, admin } from "better-auth/plugins";
import prisma from "@/shared/lib/prisma";
import { resend } from "@/shared/lib/resend";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_BASE_URL as string],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Better Auth admin plugin sends lowercase "user"/"admin",
          // but Prisma enum Role expects "USER"/"ADMIN"
          const raw = (user as Record<string, unknown>).role;
          const normalized =
            typeof raw === "string" ? raw.toUpperCase() : "USER";

          return {
            data: {
              ...user,
              role: normalized as "USER" | "ADMIN",
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session once per day)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes cache in cookie
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await resend.emails.send({
            from: process.env.EMAIL_FROM as string,
            to: email,
            subject: "Kode Verifikasi Email",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Verifikasi Email</h2>
                <p>Gunakan kode berikut untuk memverifikasi email Anda:</p>
                <h1 style="letter-spacing: 6px;">${otp}</h1>
                <p>Kode ini bersifat sementara.</p>
              </div>
            `,
          });

          return;
        }

        if (type === "forget-password") {
          await resend.emails.send({
            from: process.env.EMAIL_FROM as string,
            to: email,
            subject: "Kode Reset Password",
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Reset Password</h2>
                <p>Gunakan kode berikut untuk reset password akun Anda:</p>
                <h1 style="letter-spacing: 6px;">${otp}</h1>
                <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
              </div>
            `,
          });

          return;
        }
      },
    }),
    admin(),
    nextCookies(),
  ],
});

export type Auth = typeof auth;