import TestimonialCard from "@/shared/components/sections/testimonial-card"

const testimonials = [
  {
    name: "Budi Santoso",
    comment: "Buahnya segar dan manis. Pengiriman cepat dan pelayanan ramah. Pasti akan belanja lagi!",
  },
  {
    name: "Siti Rahayu",
    comment:
      "Saya sangat puas dengan kualitas buah yang dikirimkan. Semua buah dalam kondisi sempurna dan rasanya luar biasa.",
  },
  {
    name: "Ahmad Hidayat",
    comment:
      "Harga terjangkau untuk kualitas buah yang sangat baik. Proses pemesanan mudah dan pengiriman tepat waktu.",
  },
]

export default function TestimonialSection() {
  return (
    <section id="testimoni" className="bg-muted py-12 sm:py-16 md:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
              Apa Kata Pelanggan Kami
            </h2>
            <p className="max-w-xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
              Dengarkan pengalaman pelanggan yang telah menikmati buah segar dari toko kami
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 mt-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}
