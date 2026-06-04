import { Separator } from "@/shared/components/ui/separator"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { AdminOrderNotification } from "@/modules/orders/components/admin-order-notification"
import { getPendingOrderCount } from "@/modules/orders/service/admin-notification.service"

export async function SiteHeader() {
  const result = await getPendingOrderCount();
  const pendingCount = result.success ? result.count : 0;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <span className="text-base font-medium flex-1">Admin Dashboard</span>

        {/* Order notification bell */}
        <AdminOrderNotification initialCount={pendingCount} />
      </div>
    </header>
  )
}
