"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const articles = [
  {
    slug: "how-to-choose-wedding-venue",
    title: "How to Choose the Perfect Wedding Venue",
    category: "Wedding Planning",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    author: "Ishani Sharma",
    date: "March 10, 2026",
    content: [
      "Choosing the right wedding venue is one of the most important decisions when planning your big day. The venue sets the tone, atmosphere, and overall experience for your celebration.",
      "Consider your guest list carefully. Always select a venue that allows slightly more capacity than your expected guests. Crowded spaces can detract from the elegance and comfort of the event.",
      "Location is key. Choose a place that is convenient for guests, considering accessibility, nearby hotels, and logistics like parking and transportation.",
      "Venue costs often go beyond just rental fees. Be sure to ask about hidden charges like decor setup, service taxes, and potential overtime fees.",
      "If you're considering an outdoor venue, always have a solid backup plan for unexpected weather. Check if the venue offers indoor alternatives that are just as beautiful."
    ],
    tips: [
      { title: "Guest Capacity", text: "Ensure the venue comfortably accommodates your list plus a small buffer." },
      { title: "Amenities", text: "Look for restrooms, AC, bridal preparation rooms, and good lighting systems." },
      { title: "Indoor vs Outdoor", text: "Stunning views are great, but weather safety is paramount." }
    ]
  },
  {
    slug: "wedding-venue-mistakes",
    title: "7 Wedding Venue Mistakes to Avoid",
    category: "Wedding Planning",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
    author: "Rohan Gupta",
    date: "March 08, 2026",
    content: [
      "Choosing a wedding venue can be overwhelming, and many couples make mistakes that could easily be avoided. From logistics to budget, small details can have a big impact.",
      "Never book a venue without visiting it in person. Photos can be edited or taken from misleading angles. Seeing the space helps you visualize the flow of your event.",
      "Don't ignore the fine print. Hidden costs like cleaning fees or vendor restrictions can spike your budget unexpectedly.",
      "Choosing a venue that is too small for your guest count is a recipe for discomfort. Always prioritize space for movement and dancing.",
      "Parking is often overlooked but critical. Ensure there's ample space or valet services available for all your guests."
    ],
    tips: [
      { title: "Visit in Person", text: "Walk through the entire space to check flow and maintenance." },
      { title: "Hidden Fees", text: "Ask for a complete list of possible extra charges before signing." },
      { title: "Vendor Rules", text: "Check if the venue limits you to specific caterers or decorators." }
    ]
  },
  {
    slug: "birthday-venue-ideas",
    title: "Unique Birthday Venue Ideas",
    category: "Birthday Parties",
    image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=1200",
    author: "Ananya Desai",
    date: "March 05, 2026",
    content: [
      "Planning a birthday celebration? Moving away from traditional halls to something more creative can make the experience unforgettable for you and your guests.",
      "Rooftop venues are perfect for evening celebrations, offering stunning city views and a chic vibe. They are ideal for both vibrant parties and intimate dinners.",
      "Garden venues provide a refreshing outdoor environment that's perfect for casual, relaxed birthday lunches or colorful themed parties.",
      "Private dining rooms in boutique restaurants offer a more intimate and curated experience, perfect for foodies and close-knit groups.",
      "Beachside venues are the ultimate choice for a destination feel, providing a natural backdrop that needs very little extra decoration."
    ],
    tips: [
      { title: "Themed Decor", text: "Choose a venue that allows for custom themes and easy decoration setup." },
      { title: "Acoustics", text: "If you're planning music, check the venue's sound system and noise policy." },
      { title: "Parking", text: "Even for small parties, accessibility remains a high priority for guests." }
    ]
  },
  {
    slug: "corporate-event-planning",
    title: "Planning Successful Corporate Events",
    category: "Corporate Events",
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=1200",
    author: "Vikram Malhotra",
    date: "March 01, 2026",
    content: [
      "Corporate events require precision and professionalism. Whether it's a networking mixer or a product launch, the environment must facilitate engagement and productivity.",
      "Start by defining clear goals. Is this for team building, client relations, or a strategic meeting? Your venue should reflect these objectives.",
      "The right corporate venue should offer modern technology, including reliable high-speed Wi-Fi, projectors, and quality sound systems.",
      "Structure is essential. A well-planned agenda prevents fatigue and ensures all key points are covered while leaving room for networking.",
      "Catering can make or break the experience. Professional, high-quality food and beverage service keep attendees energized and satisfied."
    ],
    tips: [
      { title: "Connectivity", text: "High-speed internet is non-negotiable for modern corporate gatherings." },
      { title: "Ergonomics", text: "Ensure seating is comfortable for long presentations or workshops." },
      { title: "Lighting", text: "Good professional lighting is essential for presentations and photography." }
    ]
  },
  {
    slug: "event-decoration-trends",
    title: "Decoration Trends for Modern Events",
    category: "Venue Decoration",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200",
    author: "Meera Nair",
    date: "Feb 25, 2026",
    content: [
      "Event decoration is constantly evolving. Today, it's about creating an immersive experience rather than just filling a room with flowers or fabric.",
      "Minimalist decor is gaining massive popularity. Clean lines, elegant lighting, and a few high-impact elements often create a more sophisticated look than cluttered designs.",
      "Large-scale floral installations are a major trend, turning standard venue features into breathtaking focal points and 'Instagrammable' moments.",
      "Creative use of LED lighting can completely transform the mood and architecture of a venue, allowing for dynamic transitions throughout the event.",
      "Personalization is the heart of modern decor. From customized signage to themed props, small touches that reflect the host's personality are key."
    ],
    tips: [
      { title: "Less is More", text: "Focus on a few high-quality statement pieces rather than many small decorations." },
      { title: "Lighting", text: "Invest in good lighting; it's the most cost-effective way to change a venue's vibe." },
      { title: "Sustainability", text: "Use reusable or eco-friendly decor materials where possible." }
    ]
  },
  {
    slug: "catering-guide",
    title: "Choosing the Right Catering for Your Event",
    category: "Catering Ideas",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1200",
    author: "Rahul Varma",
    date: "Feb 20, 2026",
    content: [
      "Food is often the most talked-about part of any event. Selecting the right caterer and menu is critical to the overall success of your celebration.",
      "Always consider the diverse dietary preferences of your guests. Ensure there's a balanced variety of vegetarian, vegan, and non-dairy options.",
      "Menu variety is essential. Offer a range of appetizers to start, followed by a well-curated main course and creative desserts.",
      "Decide between buffet and plated meals based on the event's vibe. Buffets allow for more variety and interaction, while plated meals add a touch of formality.",
      "Never skip the tasting session. It's the only way to ensure the quality, presentation, and spice levels meet your standards."
    ],
    tips: [
      { title: "Dietary Needs", text: "Ask guests about allergies or restrictions early in the planning process." },
      { title: "Quantity", text: "Work with your caterer to ensure there's enough food without excessive waste." },
      { title: "Presentation", text: "Food should look as good as it tastes. Ask to see photos of recent setups." }
    ]
  },
  {
    slug: "event-budget-planning",
    title: "How to Plan an Event on a Budget",
    category: "Budget Planning",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200",
    author: "Sanjay Reddy",
    date: "Feb 15, 2026",
    content: [
      "Planning a high-quality event doesn't always require a massive budget. With smart choices and careful organization, you can create a memorable experience without overspending.",
      "Start by setting clear priorities. Decide what's most important—is it the food, the venue, or the entertainment? Allocate more of your budget there.",
      "Consider off-peak dates. Booking a venue on a weekday or during non-peak months can drastically reduce your rental costs.",
      "Be mindful of the guest count. Even a small reduction in attendees can lead to significant savings in catering, rentals, and stationery.",
      "Don't shy away from DIY. Simple, creative DIY decorations can add a personal touch while saving a substantial amount of money."
    ],
    tips: [
      { title: "Track Expenses", text: "Use a spreadsheet to track every minor cost to avoid budget creep." },
      { title: "Negotiate", text: "Don't be afraid to ask vendors for discounts or package deals for multiple services." },
      { title: "Early Booking", text: "Book early to lock in current rates and avoid last-minute price hikes." }
    ]
  },
  {
    slug: "event-planning-checklist",
    title: "Complete Event Planning Checklist",
    category: "Event Planning Checklist",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1200",
    author: "Pooja Hegde",
    date: "Feb 10, 2026",
    content: [
      "Successful events are built on organization. This comprehensive checklist ensures no detail is overlooked, from initial planning to the final coordination.",
      "Starting 3-6 months earlier gives you the best choice of venues and vendors. This is the time to lock in your core team and finalize your budget.",
      "One month before is for the details. Finalize your guest list, send out invitations, and confirm all catering and decor arrangements.",
      "The final week is about coordination. Prepare a detailed schedule for the day and share it with your family and vendors.",
      "On the event day, arrive early to oversee setup. Having a clear plan allows you to handle any minor issues so you can actually enjoy the event."
    ],
    tips: [
      { title: "Vendor Contacts", text: "Keep a list of all vendor phone numbers handy on the day of the event." },
      { title: "Timeline", text: "Create a minute-by-minute schedule to keep the event running smoothly." },
      { title: "Emergency Kit", text: "Keep small essentials like safety pins, tape, and scissors on hand." }
    ]
  }
];

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  
  const article = articles.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h2>
          <p className="text-gray-500 mb-8">The guide you are looking for doesn't exist.</p>
          <Link href="/ideas-tips" className="text-[#C89B3C] font-bold flex items-center justify-center">
            <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Ideas & Tips
          </Link>
        </div>
      </div>
    );
  }

  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      const filtered = articles
        .filter(a => a.slug !== slug)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setRelatedArticles(filtered);
    }
  }, [slug]);

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* Header Container */}
      <section className="bg-gray-50 pt-32 pb-16 sm:pt-40 sm:pb-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/ideas-tips" 
            className="inline-flex items-center text-sm font-bold text-[#C89B3C] mb-8 hover:opacity-80 transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            Ideas & Tips Hub
          </Link>
          
          <span className="inline-block px-4 py-1.5 bg-[#C89B3C]/10 text-[#C89B3C] text-[10px] font-bold rounded-full uppercase tracking-widest mb-6">
            {article.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-gray-200">
            <div className="flex items-center text-gray-500 text-sm">
              <UserIcon className="w-4 h-4 mr-2" />
              {article.author}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {article.date}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 -mt-12 sm:-mt-16">
        <div className="aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl">
          <img 
            src={article.image} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Content Container */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mt-16 sm:mt-24">
        <div className="prose prose-lg max-w-none">
          {article.content.map((paragraph, idx) => (
            <p key={idx} className="text-gray-600 text-lg leading-relaxed mb-8">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-12 bg-gray-50 rounded-[3rem] border border-gray-100">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-[#C89B3C] rounded-2xl flex items-center justify-center mr-4 shadow-lg shadow-gold/20">
              <LightBulbIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Expert Tips</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {article.tips.map((tip, idx) => (
              <div key={idx} className="flex group">
                <div className="mr-4 mt-1">
                  <CheckCircleIcon className="w-6 h-6 text-[#C89B3C] group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{tip.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Tip */}
        <div className="mt-12 p-6 border-l-4 border-[#C89B3C] bg-gold/5 rounded-r-2xl">
          <p className="text-gray-700 italic font-medium">
            "Every successful event starts with clear vision and organized planning. Don't be afraid to ask questions and take your time with big decisions."
          </p>
        </div>
      </section>

      {/* Call To Action */}
      <section className="max-w-4xl mx-auto px-6 md:px-8 mt-24">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C89B3C] opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Find the Perfect Venue for Your Event</h2>
            <Link 
              href="/venues" 
              className="inline-flex items-center justify-center px-10 py-4 bg-[#C89B3C] text-white rounded-2xl font-bold hover:bg-[#b58931] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gold/20"
            >
              Browse Venues
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 mt-32">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Related Articles</h2>
          <Link href="/ideas-tips" className="text-sm font-bold text-[#C89B3C] hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedArticles.map((item) => (
            <Link 
              key={item.slug} 
              href={`/ideas-tips/${item.slug}`}
              className="group flex flex-col h-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <span className="text-[10px] font-bold text-[#C89B3C] uppercase tracking-widest mb-3">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
