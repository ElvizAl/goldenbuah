"use client"

import { cn } from "@/shared/lib/utils"
import { usePathname } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import Link from "next/link"

interface NavbarItemProps {
    href: string
    children: React.ReactNode
    isActive?: boolean
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
    return (
        <Button
            size="sm"
            className={cn(
                "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent text-black px-4 py-2 text-md",
                isActive && "bg-[#01BC1D] text-white hover:bg-[#0d9622] hover:text-white",
            )}
        >
            <Link href={href}>{children}</Link>
        </Button>
    )
}

const navbarItems = [
    { href: "/", children: "Home" },
    { href: "/produk", children: "Produk" },
    { href: "/kontak", children: "Kontak" },
    { href: "/Maps", children: "Maps" },
]

export const NavbarLink = () => {
    const pathname = usePathname()
    return (
        <div className="flex items-center space-x-4">
            {navbarItems.map((item) => (
                <NavbarItem key={item.href} href={item.href} isActive={pathname === item.href}>
                    {item.children}
                </NavbarItem>
            ))}
        </div>
    )
}