import React, { useState } from 'react';
import { Card } from './card';

interface Room {
  id: string;
  name: string;
  description: string;
  baseImage?: string;
  flooringOptions: FlooringOption[];
}

interface FlooringOption {
  id: string;
  name: string;
  description: string;
  overlayImage?: string;
  materialType: string;
}

const sampleRooms: Room[] = [
  {
    id: '1',
    name: 'Modern Living Room',
    description: 'Spacious contemporary living area with large windows',
    flooringOptions: [
      {
        id: '1-1',
        name: 'Hardwood Classic',
        description: 'Traditional oak hardwood flooring',
        materialType: 'Hardwood'
      },
      {
        id: '1-2',
        name: 'Luxury Vinyl',
        description: 'Wood-look luxury vinyl planks',
        materialType: 'Vinyl'
      },
      {
        id: '1-3',
        name: 'Premium Laminate',
        description: 'High-end laminate with wood grain texture',
        materialType: 'Laminate'
      }
    ]
  },
  {
    id: '2',
    name: 'Kitchen Space',
    description: 'Modern kitchen with island and dining area',
    flooringOptions: [
      {
        id: '2-1',
        name: 'Ceramic Tile',
        description: 'Durable ceramic tiles in neutral tones',
        materialType: 'Tile'
      },
      {
        id: '2-2',
        name: 'Waterproof Vinyl',
        description: 'Water-resistant luxury vinyl tiles',
        materialType: 'Vinyl'
      },
      {
        id: '2-3',
        name: 'Stone-Look Porcelain',
        description: 'Premium porcelain tiles with stone appearance',
        materialType: 'Tile'
      }
    ]
  }
];

export function RoomVisualizer(): React.JSX.Element {
  const [selectedRoom, setSelectedRoom] = useState<string>(sampleRooms[0].id);
  const [selectedFlooring, setSelectedFlooring] = useState<string | null>(null);

  const currentRoom = sampleRooms.find(room => room.id === selectedRoom);
  
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary mb-4">
            Room Visualizer
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Explore different flooring options in sample room settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <div className="aspect-video bg-neutral-100 rounded-lg mb-4">
                {currentRoom?.baseImage ? (
                  <img
                    src={currentRoom.baseImage}
                    alt={currentRoom.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-neutral-500">Room preview coming soon</p>
                  </div>
                )}
                {selectedFlooring && (
                  <div className="absolute inset-0 bg-black/50">
                    <p className="text-white text-center mt-4">
                      Flooring visualization coming soon
                    </p>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{currentRoom?.name}</h3>
              <p className="text-neutral-600">{currentRoom?.description}</p>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Room Selection */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Select Room</h3>
              <div className="space-y-2">
                {sampleRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full text-left px-4 py-2 rounded ${
                      selectedRoom === room.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </Card>

            {/* Flooring Options */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Flooring Options</h3>
              <div className="space-y-2">
                {currentRoom?.flooringOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFlooring(option.id)}
                    className={`w-full text-left p-4 rounded border ${
                      selectedFlooring === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-neutral-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-neutral-600">
                      {option.description}
                    </div>
                    <div className="text-sm text-neutral-500 mt-1">
                      {option.materialType}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
