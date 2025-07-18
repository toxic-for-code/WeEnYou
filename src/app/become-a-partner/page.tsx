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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">Become a Partner</h1>
      <p className="text-lg text-center mb-8 text-gray-700 max-w-2xl">
        Whether you're a photographer, caterer, decorator, or provide any event-related service — WeEnYou gives you the tools and visibility to grow your business. Partner with us and reach thousands of event planners looking for trusted vendors like you.
      </p>

      <div className="relative w-full max-w-5xl mb-12 min-h-[360px] flex items-center">
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 text-2xl"
          onClick={() => scrollSlider("left")}
          aria-label="Scroll left"
          style={{ height: 48, width: 48, display: infoCards.length > 1 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
        >
          &#8592;
        </button>
        <div
          ref={sliderRef}
          className="flex gap-8 overflow-x-auto scrollbar-hide px-12 py-2 w-full"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              ref={el => { cardRefs.current[idx] = el; }}
              className="bg-white/60 backdrop-blur-md border border-white/30 rounded-xl shadow-lg p-6 flex-shrink-0 w-80 flex flex-col items-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <img src={card.img} alt={card.title} className="rounded-lg w-full h-40 object-cover mb-4" />
              <h2 className="text-xl font-bold mb-2 text-center">{card.title}</h2>
              <p className="text-gray-700 text-center mb-1">{card.desc}</p>
            </div>
          ))}
          <div className="flex-shrink-0 w-16" />
        </div>
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow p-2 text-2xl"
          onClick={() => scrollSlider("right")}
          aria-label="Scroll right"
          style={{ height: 48, width: 48, display: infoCards.length > 1 ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center' }}
        >
          &#8594;
        </button>
      </div>

      <section className="w-full bg-black py-12 mb-12">
        <h1 className="text-4xl font-bold text-center text-white mb-2">Why join as a Service Partner?</h1>
        <p className="text-lg text-center text-white mb-8">With WeEnYou's advanced tools, your service business will grow faster.</p>
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide px-4 py-2" style={{ scrollSnapType: 'x mandatory' }}>
            {benefitCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#181818] rounded-xl shadow-lg p-6 flex-shrink-0 min-w-[320px] w-80 flex flex-col items-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <img src={card.img} alt={card.title} className="rounded-lg w-full h-48 object-cover mb-4" />
                <h2 className="text-xl font-bold mb-2 text-center text-white">{card.title}</h2>
                <p className="text-gray-200 text-center mb-1">{card.desc}</p>
              </div>
            ))}
            <div className="flex-shrink-0 w-4" />
          </div>
        </div>
      </section>

      <section className="w-full max-w-3xl mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">💼 Service Categories We Welcome:</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg text-gray-800 text-center">
          {categories.map((cat, idx) => <li key={idx}>{cat}</li>)}
        </ul>
      </section>

      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-4 text-center">🚀 Ready to grow your service business?</h3>
      </div>
      <button
        className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold px-16 py-3 rounded-full shadow transition w-[90vw] max-w-2xl z-50"
        onClick={() => window.location.href = "/auth/signup"}
        style={{ position: 'fixed' }}
      >
        Join Now
      </button>

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