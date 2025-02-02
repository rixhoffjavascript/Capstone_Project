import React, { useState } from 'react';
import { Card } from './card';
import { Dialog, DialogContent } from './dialog';
import { X } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  materialType: string;
  style: string;
  color: string;
}

const projects: Project[] = [
  {
    id: '1',
    title: 'Modern Living Room Renovation',
    description: 'Complete hardwood flooring installation with custom borders',
    category: 'Residential',
    materialType: 'Hardwood',
    style: 'Modern',
    color: 'Natural'
  },
  {
    id: '2',
    title: 'Commercial Office Space',
    description: 'Durable vinyl flooring for high-traffic areas',
    category: 'Commercial',
    materialType: 'Vinyl',
    style: 'Professional',
    color: 'Gray'
  },
  {
    id: '3',
    title: 'Luxury Apartment Complex',
    description: 'Multi-unit installation of premium engineered wood',
    category: 'Multi-Family',
    materialType: 'Engineered Wood',
    style: 'Luxury',
    color: 'Dark Brown'
  },
  {
    id: '4',
    title: 'Restaurant Renovation',
    description: 'Slip-resistant ceramic tile installation',
    category: 'Commercial',
    materialType: 'Ceramic',
    style: 'Contemporary',
    color: 'Beige'
  },
  {
    id: '5',
    title: 'Historic Home Restoration',
    description: 'Restoration of original hardwood flooring',
    category: 'Residential',
    materialType: 'Hardwood',
    style: 'Traditional',
    color: 'Cherry'
  }
];

export function ProjectGallery(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project => {
    if (selectedCategory && project.category !== selectedCategory) return false;
    if (selectedMaterial && project.materialType !== selectedMaterial) return false;
    if (selectedStyle && project.style !== selectedStyle) return false;
    if (selectedColor && project.color !== selectedColor) return false;
    return true;
  });

  const uniqueCategories = Array.from(new Set(projects.map(p => p.category)));
  const uniqueMaterials = Array.from(new Set(projects.map(p => p.materialType)));
  const uniqueStyles = Array.from(new Set(projects.map(p => p.style)));
  const uniqueColors = Array.from(new Set(projects.map(p => p.color)));

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-secondary mb-4">Project Gallery</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Explore our completed flooring projects and get inspired
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Category</label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Material</label>
            <select
              value={selectedMaterial || ''}
              onChange={(e) => setSelectedMaterial(e.target.value || null)}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Materials</option>
              {uniqueMaterials.map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Style</label>
            <select
              value={selectedStyle || ''}
              onChange={(e) => setSelectedStyle(e.target.value || null)}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Styles</option>
              {uniqueStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Color</label>
            <select
              value={selectedColor || ''}
              onChange={(e) => setSelectedColor(e.target.value || null)}
              className="w-full rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Colors</option>
              {uniqueColors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card 
              key={project.id}
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedProject(project)}
            >
              <div className="mb-4 h-48 bg-neutral-100 rounded-lg overflow-hidden">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                    Preview coming soon
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">{project.title}</h3>
              <p className="text-neutral-600 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {project.category}
                </span>
                <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
                  {project.materialType}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedProject} onClose={() => setSelectedProject(null)}>
        <DialogContent className="relative">
          <button
            onClick={() => setSelectedProject(null)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100"
          >
            <X className="h-6 w-6" />
          </button>
          {selectedProject && (
            <div>
              <div className="aspect-video bg-neutral-100 rounded-lg mb-6">
                {selectedProject.imageUrl ? (
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500">
                    Preview coming soon
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-secondary mb-4">{selectedProject.title}</h2>
              <p className="text-neutral-600 mb-6">{selectedProject.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-neutral-700 mb-2">Details</h3>
                  <dl className="space-y-1">
                    <div className="flex justify-between">
                      <dt className="text-neutral-600">Category:</dt>
                      <dd className="font-medium">{selectedProject.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600">Material:</dt>
                      <dd className="font-medium">{selectedProject.materialType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600">Style:</dt>
                      <dd className="font-medium">{selectedProject.style}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-neutral-600">Color:</dt>
                      <dd className="font-medium">{selectedProject.color}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
