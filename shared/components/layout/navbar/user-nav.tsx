"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { LogOut, Settings, Package, ShieldCheck } from "lucide-react";
import { authClient } from "@/modules/auth/auth-client";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function UserNav() {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { data: session, isPending } = authClient.useSession();

  async function handleLogout() {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Berhasil keluar.");
            router.push("/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal keluar. Silakan coba lagi.");
    }
  }

  if (!isHydrated || isPending) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Button asChild size="sm" className="font-medium ml-2">
        <Link href="/login">Masuk</Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-3 h-10 rounded-full select-none cursor-pointer">
          <span className="text-sm font-medium text-muted-foreground">
            Hallo, <span className="font-semibold text-foreground">{session.user.name}</span>
          </span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name} />
            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground break-all">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer flex items-center font-medium text-emerald-600 focus:text-emerald-700">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Admin Panel
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/profile/orders" className="cursor-pointer flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Pesanan Saya
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Pengaturan Akun
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 flex items-center"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
