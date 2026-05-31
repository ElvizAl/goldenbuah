"use server"

import { auth } from "@/modules/auth/auth.config"
import prisma from "@/shared/lib/prisma"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getUsers() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                image: true,
                banned: true,
                banReason: true,
                createdAt: true,
            }
        })
        return { success: true, data: users }
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return { success: false, message: "Terjadi kesalahan saat memuat data user" }
    }
}
