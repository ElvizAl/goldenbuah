import { AdminLoginForm } from "@/modules/auth/components/admin-login-form"

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center p-4 selection:bg-blue-500 selection:text-white"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=2069&auto=format&fit=crop')`
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Decorative Wooden Sign Text matching the image (TOKO BUAH GOLDEN / GOLDEN FRUIT MARKET / SEJAK 1998) */}
      <div className="absolute top-6 right-6 z-10 hidden md:block max-w-70 bg-[#E8CCA6]/90 border-[6px] border-[#A0522D] rounded-md px-4 py-3 text-center shadow-lg transform rotate-2 font-serif text-[#4A2E16]">
        <h2 className="text-xl font-extrabold tracking-wide border-b border-[#4A2E16]/40 pb-1 uppercase">
          Toko Buah Golden
        </h2>
        <div className="my-1.5 flex justify-center">
          {/* Simple basket of fruit icon using pure CSS/SVG */}
          <svg className="w-8 h-8 opacity-80" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A2,2 0 0,1 14,6C14,6.74 13.9,7.18 13.56,7.56C13.18,7.9 12.74,8 12,8C11.26,8 10.82,7.9 10.44,7.56C10.1,7.18 10,6.74 10,6A2,2 0 0,1 12,4M12,18C8.69,18 6,15.31 6,12C6,11.35 6.1,10.72 6.3,10.15L8.5,14L10,11.5L12,15L14,11.5L15.5,14L17.7,10.15C17.9,10.72 18,11.35 18,12C18,15.31 15.31,18 12,18Z" />
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-wider">
          Golden Fruit Market
        </p>
        <span className="text-[10px] font-semibold italic text-[#4A2E16]/80 block mt-0.5">
          SEJAK 1998
        </span>
      </div>

      {/* Main Container Card conforming precisely to the layout in the user's image */}
      <div className="relative z-10 w-full max-w-107.5 rounded-[16px] bg-white px-8 py-10 shadow-2xl text-center select-none md:max-w-115">
        <h1 className="text-2xl font-bold text-black mb-6">
          Login
        </h1>

        <AdminLoginForm className="mt-2" />
      </div>
    </div>
  )
}
