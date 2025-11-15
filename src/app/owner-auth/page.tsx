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
    title: "Commission Charges",
    img: "/charges.png",
    desc: "Flat 29% service fee or Rs 40 per check-in. GST as applicable."
  },
  {
    title: "Payment Frequency",
    img: "payment.png",
    desc: "Daily pending dues are credited to your bank account automatically."
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
    if (!session) {
      router.push("/auth/owner-signup");
    } else {
      router.push("/list-your-hall");
    }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">Explore the world of WeEnYou!</h1>
      <p className="text-lg text-center mb-8 text-gray-700">Transparent policies and easy payments for your growth, always!</p>
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
              className="bg-white rounded-xl shadow-lg p-6 flex-shrink-0 w-80 flex flex-col items-center"
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
        <h1 className="text-4xl font-bold text-center text-white mb-2">Why join WeEnYou?</h1>
        <p className="text-lg text-center text-white mb-8">With WeEnYou's advanced tools, your business will grow faster.</p>
        <div className="relative w-full max-w-6xl mx-auto">
          <div className="flex gap-8 overflow-x-auto scrollbar-hide px-4 py-2" style={{ scrollSnapType: 'x mandatory' }}>
            {joinCards.map((card, idx) => (
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
      <button
        className="fixed left-1/2 -translate-x-1/2 bottom-6 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold px-16 py-3 rounded-full shadow transition w-[90vw] max-w-2xl z-50"
        onClick={() => { window.location.href = 'https://owner.weenyou.com/'; }}
        style={{ position: 'fixed' }}
      >
        Join WeEnYou
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