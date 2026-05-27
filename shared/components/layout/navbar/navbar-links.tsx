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
    { href: "/#kontak", children: "Kontak" },
    { href: "/#maps", children: "Maps" },
]

import { useEffect, useState } from "react"

export const NavbarLink = () => {
    const pathname = usePathname()
    const [activeHash, setActiveHash] = useState("")

    useEffect(() => {
        // Update hash state initially
        setActiveHash(window.location.hash)

        const handleHashChange = () => {
            setActiveHash(window.location.hash)
        }

        // Listen for browser navigation hash change
        window.addEventListener("hashchange", handleHashChange)

        // Capture Any link clicks to update hash instantly
        const handleLinkClick = () => {
            // Need a tiny delay for Next.js to update the URL / window.location
            setTimeout(() => {
                setActiveHash(window.location.hash)
            }, 50)
        }

        window.addEventListener("click", handleLinkClick)

        return () => {
            window.removeEventListener("hashchange", handleHashChange)
            window.removeEventListener("click", handleLinkClick)
        }
    }, [pathname])

    return (
        <div className="flex items-center space-x-4">
            {navbarItems.map((item) => {
                let isActive = false

                if (item.href.startsWith("/#")) {
                    const targetHash = item.href.replace("/", "") // e.g. "#kontak"
                    isActive = pathname === "/" && activeHash === targetHash
                } else {
                    isActive = pathname === item.href && (pathname !== "/" || !activeHash || activeHash === "#")
                }

                return (
                    <NavbarItem key={item.href} href={item.href} isActive={isActive}>
                        {item.children}
                    </NavbarItem>
                )
            })}
        </div>
    )
}
