"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, PenTool, Map } from "lucide-react";

export function ProfileSidebar() {
  const pathname = usePathname();

  const menus = [
    {
      label: "Profil",
      href: "/profile",
      icon: User,
    },
    {
      label: "Alamat",
      href: "/profile/address",
      icon: Map,
    },
    {
      label: "Pesanan Saya",
      href: "/profile/orders",
      icon: ClipboardList,
    },
    {
      label: "Review",
      href: "/profile/reviews",
      icon: PenTool,
    },
  ];

  return (
    <div className="w-full shrink-0 lg:w-80">
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm">
        <div className="border-t border-neutral-100 py-1">
          {menus.map((menu) => {
            const Icon = menu.icon;

            const isActive =
              pathname === menu.href ||
              (menu.href !== "/profile" && pathname.startsWith(menu.href));

            return (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm transition-colors ${
                  isActive
                    ? "bg-cyan-50 text-cyan-600"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-cyan-500" : "text-neutral-400"
                  }`}
                />
                <span className="font-medium">{menu.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
