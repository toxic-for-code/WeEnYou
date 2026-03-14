"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const infoCards = [
  {
    title: "Photography",
    img: "/photography.png",
    desc: "Professional photoshoot of your property. T&C applied."
  },
  {
    title: "Pricing Policy",
    img: "/pricing.png",
    desc: "AI-powered dynamic pricing to maximize your revenue."
  },
  {
    title: "Sign-up Process",
    img: "/signup.png",
    desc: 'Click the "Join WeEnYou" button, share your basic details, and sign up in just 30 minutes.'
  },
  {
    title: "Zero Commission for Owners",
    img: "/charges.png",
    desc: "Owners keep 100% of their service price. A platform fee of 10–20% is charged to the customer depending on the service category. GST applicable as per regulations."
  },
  {
    title: "Payment Frequency",
    img: "payment.png",
    desc: "Daily pending dues are credited to your bank account automatically."
  },
  {
    title: "Analytics Dashboard",
    img: "/analytics-dashboard.png",
    desc: "Track listing views, booking inquiries, customer engagement, and performance insights to grow your hall bookings."
  }
];

const joinCards = [
  {
    title: "Self Onboarding",
    img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    desc: "Self onboard in 30 minutes and start growing your business from Day 1."
  },
  {
    title: "Business Growth",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
    desc: "2x revenue jump with WeEnYou channels, OTAs, and AI-enabled pricing."
  },
  {
    title: "Easy Operations",
    img: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    desc: "Manage inventory, access real-time bookings, and get support with the WeEnYou app."
  }
];

export default function OwnerAuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (status === "loading") return null;

  const handleJoin = () => {
    window.location.href = "https://owner.weenyou.com/";
  };

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
      {/* Standard Centered Container */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-12 w-full">
          <h1 className="text-[26px] md:text-5xl font-bold leading-tight mb-4 text-gray-900">
            Explore the world of WeEnYou!
          </h1>
          <p className="text-[15px] md:text-xl text-gray-600 max-w-2xl mx-auto">
            Transparent policies and easy payments for your growth, always!
          </p>
        </div>

        {/* Card Section: 1 col Mobile, 2 col Tablet, 3 col Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full mb-16">
          {infoCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-[18px] flex flex-col items-center transition-shadow hover:shadow-md h-full"
            >
              <img src={card.img} alt={card.title} className="rounded-xl w-full h-48 md:h-40 object-cover mb-4" />
              <h2 className="text-xl font-bold mb-2 text-center text-gray-900">{card.title}</h2>
              <p className="text-gray-600 text-center text-[15px] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Join Section - Full width black background, centered content */}
      <section className="w-full bg-black py-16 px-4 md:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center">
          <h2 className="text-[26px] md:text-4xl font-bold text-white mb-4">Why join WeEnYou?</h2>
          <p className="text-[15px] md:text-lg text-gray-300 mb-12 max-w-2xl">
            With WeEnYou's advanced tools, your business will grow faster.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {joinCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-[#181818] rounded-[16px] border border-white/10 p-[18px] flex flex-col items-center h-full"
              >
                <img src={card.img} alt={card.title} className="rounded-xl w-full h-48 object-cover mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">{card.title}</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Button Container */}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 py-16 flex justify-center">
        <button
          className="w-full md:w-auto md:min-w-[400px] h-[52px] bg-red-500 hover:bg-red-600 text-white text-base md:text-lg font-bold rounded-full shadow-lg transition-all active:scale-95"
          onClick={handleJoin}
        >
          Join WeEnYou
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