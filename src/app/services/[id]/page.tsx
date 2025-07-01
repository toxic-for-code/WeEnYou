import { notFound } from 'next/navigation';

async function getService(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/services/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.service || null;
}

export default async function ServicePage({ params }: { params: { id: string } }) {
  const service = await getService(params.id);
  if (!service) return notFound();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{service.name}</h1>
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm mr-2">{service.serviceType}</span>
        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">₹{service.price}</span>
      </div>
      {service.images && service.images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          {service.images.map((img: string, i: number) => (
            <img key={i} src={img} alt={service.name} className="rounded w-full h-40 object-cover" />
          ))}
        </div>
      )}
      <p className="mb-6 text-gray-700">{service.description}</p>
      <div className="mb-2 text-gray-600">Location: {service.city}, {service.state}</div>
      <div className="mb-2 text-gray-600">Contact: {service.contact}</div>
      <div className="mb-2 text-gray-600">Status: <span className={service.status === 'active' ? 'text-green-600' : 'text-gray-500'}>{service.status}</span></div>
    </div>
  );
} 