import Footer from "@/shared/components/layout/footer";
import Navbar  from "@/shared/components/layout/navbar/navbar";
import { FloatingShortcuts } from "@/shared/components/layout/floating-shortcuts";
import { AiChatWidget } from "@/shared/components/layout/ai-chat-widget";

interface Props {
    children: React.ReactNode;
}

const Layout = ({children}: Props) => {
  return (
    <div className="flex flex-col min-h-screen relative">
        <Navbar />
        <div className="flex-1">
        {children}
        <Footer />
        </div>
        <FloatingShortcuts />
        <AiChatWidget />
    </div>
  )
}

export default Layout