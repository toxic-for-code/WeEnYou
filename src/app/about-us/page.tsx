"use client";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: "🎉",
    title: "Curated Venues & Vendors",
    desc: "We handpick the best venues and service providers, so you can browse confidently knowing every option meets our standards for quality and reliability.",
  },
  {
    icon: "🔍",
    title: "Easy Discovery & Comparison",
    desc: "Filter, sort, and compare venues by location, capacity, budget, and amenities. See real photos, detailed information, and honest reviews.",
  },
  {
    icon: "💸",
    title: "Transparent Pricing",
    desc: "No hidden surprises. We believe in clear pricing and fair deals that help you stay on budget without compromising on quality.",
  },
  {
    icon: "🤝",
    title: "Personalized Support",
    desc: "Our team is here to guide you every step of the way, from shortlisting venues to finalizing bookings and coordinating with vendors.",
  },
  {
    icon: "🛡️",
    title: "Seamless Booking",
    desc: "Confirm your bookings securely through our platform, and enjoy a stress-free planning experience.",
  },
];

export default function AboutUsPage() {
  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-72 md:h-96 flex items-center justify-center bg-[url('/bg.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center text-center text-white animate-fade-in-up">
          <Image src="/logo.png" alt="WeEnYou Logo" width={120} height={40} className="mb-4 drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">We Enable You to Celebrate</h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto font-medium">Discover, compare, and book the perfect venues and trusted vendors for every celebration—effortlessly.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-12 text-gray-900 animate-fade-in">
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-green-700">Your Dream Event, One Click Away</h2>
          <p className="mb-4 text-center text-lg text-gray-700">
            At <span className="font-semibold text-green-700">WeEnYou</span>, we believe every celebration deserves the perfect setting. Whether you're planning an unforgettable wedding, a milestone birthday, or a corporate gathering, we make it effortless to discover, compare, and book the ideal venue and trusted vendors—all in one place.
          </p>
          <p className="text-center text-gray-600">
            Founded with the vision to transform how people plan events, WeEnYou brings transparency, convenience, and inspiration to your special occasions. From elegant banquet halls to professional photographers and creative decorators, we connect you with a curated network of verified partners across cities, helping you bring your ideas to life seamlessly.
          </p>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Why Choose <span className="text-green-700">WeEnYou</span>?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all animate-fade-in-up">
                <span className="text-3xl md:text-4xl mt-1">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-12 flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-green-50 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-2 text-green-700">Our Mission</h2>
            <p>
              To empower individuals, families, and businesses to create memorable events with ease, by bridging the gap between venue discovery and hassle-free booking.
            </p>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold mb-2 text-green-700">Our Vision</h2>
            <p>
              A world where planning a celebration is as joyful as the celebration itself.
            </p>
          </div>
        </section>

        {/* Testimonial/Quote */}
        <section className="mb-12">
          <div className="bg-white rounded-lg shadow p-6 text-center animate-fade-in-up">
            <blockquote className="italic text-lg text-gray-700 mb-2">“WeEnYou made our wedding planning so easy and stress-free. Every vendor was top-notch!”</blockquote>
            <span className="text-green-700 font-semibold">— Priya & Rahul, Mumbai</span>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mb-8 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4">Ready to plan your next event?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <Link href="/" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all">Explore Venues</Link>
            <Link href="/help" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg transition-all">Contact Us</Link>
          </div>
        </section>
      </div>

      {/* Simple fade-in animation styles */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 1s ease;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 