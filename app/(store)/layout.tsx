import Navbar  from "@/shared/components/layout/navbar/navbar";

interface Props {
    children: React.ReactNode;
}

const Layout = ({children}: Props) => {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 pb-4">
        {children}
        </div>
    </div>
  )
}

export default Layout