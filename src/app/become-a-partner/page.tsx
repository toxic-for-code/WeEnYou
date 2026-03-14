"use client";
import { useRef, useState } from "react";

const infoCards = [
  {
    title: "Professional Profile Setup",
    img: "/photography.png", // Placeholder, replace as needed
    desc: "Create a stunning profile for your service with descriptions, photos, packages, and pricing — attract the right customers with ease."
  },
  {
    title: "Smart Pricing Tools",
    img: "/pricing.png",
    desc: "Use AI-powered suggestions to price your services competitively while maximizing revenue."
  },
  {
    title: "Quick Onboarding",
    img: "/signup.png",
    desc: "Sign up and list your service in less than 30 minutes. No long paperwork, no hassle."
  },
  {
    title: "Partner Dashboard",
    img: "/charges.png",
    desc: "Track inquiries, manage bookings, view payments, and access performance insights — all in one place."
  },
  {
    title: "Real-Time Messaging",
    img: "/payment.png",
    desc: "Communicate directly with clients through our secure in-app chat to finalize event details and build trust."
  },
  {
    title: "Commission & Charges",
    img: "/charges.png",
    desc: "Enjoy transparent commission rates and no hidden fees. Know exactly what you earn for every booking."
  }
];

const benefitCards = [
  {
    title: "Boosted Visibility",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    desc: "Get featured across event hall listings and in targeted searches by location and category. More eyes on your service = more bookings."
  },
  {
    title: "Fast, Transparent Payouts",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    desc: "Receive payments quickly with our integrated and transparent payout system. No hidden charges."
  }
];

const categories = [
  "Catering",
  "Photography & Videography",
  "Decoration & Floral",
  "Sound & Music Systems",
  "Event Planning & Management",
  "Lighting & Stage Setup",
  "Makeup & Grooming",
  "Transportation & Guest Services"
];

export default function BecomeAPartnerPage() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollSlider = (dir: "left" | "right") => {
    let newIdx = currentIdx;
    if (dir === "right") {
      newIdx = currentIdx === infoCards.length - 1 ? 0 : currentIdx + 1;
    } else {
      newIdx = currentIdx === 0 ? infoCards.length - 1 : currentIdx - 1;
    }
    setCurrentIdx(newIdx);
    cardRefs.current[newIdx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center overflow-x-hidden">
      {/* Centered Main Content */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-12 w-full">
          <h1 className="text-[26px] md:text-5xl font-bold leading-tight mb-4 text-gray-900">
            Become a Partner
          </h1>
          <p className="text-[15px] md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you're a photographer, caterer, decorator, or provide any event-related service — WeEnYou gives you the tools and visibility to grow your business. Partner with us and reach thousands of event planners looking for trusted vendors like you.
          </p>
        </div>

        {/* Information Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mb-16">
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white/60 backdrop-blur-md border border-gray-100 rounded-[16px] shadow-sm p-[18px] flex flex-col items-center h-full transition-shadow hover:shadow-md"
            >
              <img src={card.img} alt={card.title} className="rounded-xl w-full h-48 md:h-40 object-cover mb-4" />
              <h2 className="text-xl font-bold mb-2 text-center text-gray-900">{card.title}</h2>
              <p className="text-gray-600 text-center text-[15px] md:text-base leading-relaxed h-full">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Join Section - Full bleed with centered content */}
      <section className="w-full bg-black py-16 px-4 md:px-6 text-center text-white">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center">
          <h2 className="text-[26px] md:text-4xl font-bold mb-4">Why join as a Service Partner?</h2>
          <p className="text-[15px] md:text-lg text-gray-300 mb-12 max-w-2xl">
            With WeEnYou's advanced tools, your service business will grow faster.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-4xl">
            {benefitCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#181818] rounded-[16px] border border-white/10 p-[18px] flex flex-col items-center h-full"
              >
                <img src={card.img} alt={card.title} className="rounded-xl w-full h-48 object-cover mb-4" />
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Centered */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-16">
        <h2 className="text-[22px] md:text-3xl font-bold mb-8 text-center text-gray-900">💼 Service Categories We Welcome:</h2>
        <ul className="flex flex-col md:grid md:grid-cols-2 gap-x-12 gap-y-3 text-[16px] md:text-lg text-gray-800">
          {categories.map((cat, idx) => (
            <li key={idx} className="flex items-center gap-3 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg border border-gray-100 md:border-none">
              <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0"></span>
              {cat}
            </li>
          ))}
        </ul>
      </div>

      {/* Final Join Section */}
      <div className="w-full max-w-md px-4 pb-20 flex flex-col items-center">
        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6 text-center">🚀 Ready to grow your service business?</h3>
        <button
          className="w-full h-[52px] bg-red-500 hover:bg-red-600 text-white text-base md:text-lg font-bold rounded-full shadow-lg transition-all active:scale-95"
          onClick={() => window.location.href = "/auth/signup"}
        >
          Join Now
        </button>
      </div>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
} 