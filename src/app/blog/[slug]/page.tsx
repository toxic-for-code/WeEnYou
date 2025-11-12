'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

type Post = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  image: string;
  content: string[]; // paragraphs
};

const POSTS: Record<string, Post> = {
  'how-to-plan-a-budget-friendly-event': {
    slug: 'how-to-plan-a-budget-friendly-event',
    title: 'How to Plan a Budget-Friendly Event',
    date: '2025-11-12',
    category: 'Ideas & Tips',
    image: '/pricing.png',
    content: [
      'Planning an unforgettable event does not have to break the bank. With smart choices and a clear plan, you can deliver a great experience within a reasonable budget.',
      'Start by defining your must-haves vs. nice-to-haves. Allocate most of your budget to what guests will remember—venue ambience, sound, and food quality. Reduce costs on items like premium decor or oversized signage, unless they are core to your theme.',
      'Consider weekday bookings or off-peak seasons to unlock better venue pricing. Bundle services where possible (venue + catering + AV) and negotiate for package discounts. Transparent discussion with vendors often leads to savings and upgrades.',
      'DIY elements can add personal charm: table settings, welcome boards, and photo corners. Keep DIY scope realistic to avoid last-minute stress—focus on a few high-impact touches rather than many complex tasks.',
      'Finally, track expenses in a simple spreadsheet. Having a live budget view keeps decisions grounded and eliminates surprises.'
    ],
  },
  'top-10-amenities-to-look-for-in-a-hall': {
    slug: 'top-10-amenities-to-look-for-in-a-hall',
    title: 'Top 10 Amenities to Look For in a Hall',
    date: '2025-11-10',
    category: 'Venue Guide',
    image: '/photography.png',
    content: [
      'Choosing the right hall is more than capacity and price—amenities shape guest comfort and event flow.',
      'Look for: reliable AC, clean restrooms, ample parking, backup power, quality sound system, stage or presentation area, wheelchair access, changing/green rooms, secure storage, and responsible on-site management.',
      'Bonus amenities like in-house decor, catering areas, and pre-installed lighting can save both budget and time. Inspect the venue in person when possible, and request a test for the AV setup prior to event day.'
    ],
  },
  'checklist-for-your-event-day': {
    slug: 'checklist-for-your-event-day',
    title: 'The Ultimate Event Day Checklist',
    date: '2025-11-08',
    category: 'Checklist',
    image: '/bg.png',
    content: [
      'A calm event day starts with a clear, realistic checklist that keeps everyone aligned.',
      'Confirm venue access times, vendor arrivals, signage placement, registration/guest flow, and AV tests. Keep a printed contact sheet for all vendors and key volunteers, with roles and responsibilities clearly assigned.',
      'Prepare a small “event kit”: gaffer tape, markers, scissors, USB drives, multi-plug, power banks, first-aid basics, and snacks. Hydration and short breaks for your core team go a long way in maintaining energy.',
      'Schedule a brief run-through with the MC/coordinator, and ensure cue points for performances or announcements are noted. After the event, capture quick feedback from guests and vendors—this is gold for your next one.'
    ],
  },
};

const formatDate = (dateString: string) => {
  const [y, m, d] = dateString.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return format(date, 'dd/MM/yyyy');
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center text-xs text-gray-600 gap-2">
            <Link href="/blog" className="text-primary-600 hover:text-primary-700">Blog</Link>
            <span>/</span>
            <span className="text-gray-500">{post.category}</span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">{post.title}</h1>
          <div className="mt-2 text-sm text-gray-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </div>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative h-56 sm:h-72 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
          <Image
            src={`/${post.slug}.jpg`}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            className="object-cover"
            priority={false}
          />
        </div>

        <div className="prose prose-gray max-w-none mt-6">
          {post.content.map((p, idx) => (
            <p key={idx} className="text-gray-800 leading-7">{p}</p>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <Link href="/blog" className="text-primary-600 hover:text-primary-700 font-medium">← Back to Blog</Link>
          <a
            href="mailto:feedback@weenyou.com"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Share your tips
          </a>
        </div>
      </article>
    </div>
  );
}