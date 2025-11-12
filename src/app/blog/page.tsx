'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

const posts = [
  {
    slug: 'how-to-plan-a-budget-friendly-event',
    title: 'How to Plan a Budget-Friendly Event',
    excerpt:
      'Smart tips to save on venue, catering, and decor without compromising the experience.',
    image: '/pricing.png',
    date: '2025-11-12',
    category: 'Ideas & Tips',
  },
  {
    slug: 'top-10-amenities-to-look-for-in-a-hall',
    title: 'Top 10 Amenities to Look For in a Hall',
    excerpt:
      'From parking to acoustics—what actually matters when choosing your venue.',
    image: '/photography.png',
    date: '2025-11-10',
    category: 'Venue Guide',
  },
  {
    slug: 'checklist-for-your-event-day',
    title: 'The Ultimate Event Day Checklist',
    excerpt:
      'A concise checklist to keep everything on track on the big day.',
    image: '/bg.png',
    date: '2025-11-08',
    category: 'Checklist',
  },
];

export default function BlogPage() {
  // Format a stable date string regardless of server/client locale or timezone
  const formatDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    // Construct Date using local components to avoid UTC parsing differences
    const date = new Date(y, (m || 1) - 1, d || 1);
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Blog</h1>
          <p className="mt-3 text-gray-600 max-w-2xl">
            Ideas, tips, and guides to help you plan better events with confidence.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-44 sm:h-52 bg-gray-100">
                <Image
                  src={`/${post.slug}.jpg`}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={false}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full border border-gray-200">
                    {post.category}
                  </span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{post.title}</h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                <div className="mt-4">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Read more
                    <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-lg bg-gray-50 border border-gray-200 p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Have an idea to share?</h3>
          <p className="mt-1 text-sm text-gray-600">Send us your tips and event hacks at feedback@weenyou.com.</p>
        </div>
      </section>
    </div>
  );
}