'use client';

import { getImageUrl } from '@/lib/imageUtils';

interface ServiceImagesProps {
  images: string[];
  serviceName: string;
}

export default function ServiceImages({ images, serviceName }: ServiceImagesProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      {images.map((img: string, i: number) => (
        <img 
          key={i} 
          src={getImageUrl(img)} 
          alt={serviceName} 
          className="rounded w-full h-40 object-cover" 
        />
      ))}
    </div>
  );
} 