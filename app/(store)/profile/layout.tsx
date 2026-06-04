import { ProfileSidebar } from "@/modules/profile";
import { getPendingReviewCount } from "@/modules/orders/service/review.service";

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const pendingReviews = await getPendingReviewCount();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Mobile/tablet: sidebar stacks on top; desktop: side-by-side */}
        <div className="flex flex-col lg:flex-row lg:gap-6">
          <ProfileSidebar pendingReviews={pendingReviews} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
