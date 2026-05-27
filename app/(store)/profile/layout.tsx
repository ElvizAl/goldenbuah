import { ProfileSidebar } from "@/modules/profile";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="bg-slate-50 min-h-screen flex py-10 px-4 md:px-8">
      <ProfileSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default Layout;
