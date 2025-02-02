import React from 'react';
import { Card } from './card';

interface Service {
  title: string;
  description: string;
  features: string[];
}

const designServices: Service[] = [
  {
    title: 'Initial Consultation',
    description: 'Professional design consultation to understand your vision and requirements',
    features: [
      'Space assessment',
      'Style preferences discussion',
      'Budget planning',
      'Material recommendations'
    ]
  },
  {
    title: 'Custom Design Planning',
    description: 'Detailed design plans tailored to your space and preferences',
    features: [
      '3D visualization',
      'Pattern layouts',
      'Color schemes',
      'Material combinations'
    ]
  },
  {
    title: 'Material Selection',
    description: 'Expert guidance in choosing the perfect materials for your project',
    features: [
      'Sample presentations',
      'Durability analysis',
      'Maintenance requirements',
      'Cost comparisons'
    ]
  },
  {
    title: 'Project Coordination',
    description: 'End-to-end project management for seamless execution',
    features: [
      'Timeline planning',
      'Contractor coordination',
      'Quality assurance',
      'Final inspection'
    ]
  }
];

export function DesignServices(): React.JSX.Element {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Design Services</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-12">
            Transform your space with our professional design services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {designServices.map((service) => (
            <Card key={service.title}>
              <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
              <p className="text-neutral-600 mb-6">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="h-5 w-5 text-primary mr-2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Schedule a Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
