import React from 'react';
import { Card } from './card';

interface Room {
  name: string;
  description: string;
  imageUrl?: string;
}

const rooms: Room[] = [
  {
    name: 'Living Room',
    description: 'Elegant and durable flooring solutions for your living spaces',
  },
  {
    name: 'Kitchen',
    description: 'Water-resistant and easy-to-clean options for busy kitchens',
  },
  {
    name: 'Bedroom',
    description: 'Comfortable and stylish flooring for peaceful bedrooms',
  },
  {
    name: 'Bathroom',
    description: 'Moisture-resistant and safe flooring for bathrooms',
  },
  {
    name: 'Office',
    description: 'Professional flooring options for home offices',
  }
];

export function ShopByRoom(): React.JSX.Element {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Shop by Room</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-12">
            Find the perfect flooring solution for every room in your home
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <Card key={room.name}>
              {room.imageUrl && (
                <div className="mb-4 h-48 bg-neutral-100 rounded-lg overflow-hidden">
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-neutral-600">{room.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
