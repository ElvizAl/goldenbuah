"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ClipboardList, Star, Map } from "lucide-react";

interface ProfileSidebarProps {
  pendingReviews?: number;
}

export function ProfileSidebar({ pendingReviews = 0 }: ProfileSidebarProps) {
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
      label: "Ulasan Saya",
      href: "/profile/reviews",
      icon: Star,
      badge: pendingReviews > 0 ? pendingReviews : undefined,
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
                <span className="flex-1 font-medium">{menu.label}</span>
                {"badge" in menu && menu.badge !== undefined && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white leading-none">
                    {menu.badge > 99 ? "99+" : menu.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
