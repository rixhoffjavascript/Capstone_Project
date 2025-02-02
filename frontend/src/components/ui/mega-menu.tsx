import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, X } from "lucide-react";


interface Category {
  category: string;
  subcategories: string[];
  featured: string[];
  image?: string;
}

interface MegaMenuProps {
  categories: Category[];
  onClose: () => void;
  isMobile?: boolean;
}

export function MegaMenu({ categories, onClose, isMobile = false }: MegaMenuProps): React.JSX.Element {
  return (
    <div 
      className={`
        ${isMobile 
          ? 'fixed inset-0 bg-white z-50 overflow-y-auto animate-slideIn'
          : 'absolute top-full left-0 w-full bg-white shadow-nav z-50 hidden lg:block animate-slideDown'
        }
      `}
      onMouseLeave={!isMobile ? onClose : undefined}
    >
      {isMobile && (
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center shadow-nav z-50">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-primary p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className={`
          grid gap-x-12 gap-y-8
          ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'}
        `}>
          {categories.map((cat) => (
            <div key={cat.category} className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center justify-between mb-6">
                  {cat.category} Categories
                  {isMobile && <ChevronRight className="h-5 w-5 text-gray-400" />}
                </h3>
                <ul className={`space-y-3 ${isMobile ? 'border-l-2 border-primary/20 pl-4' : ''}`}>
                  {cat.subcategories.map((sub) => (
                    <li key={sub}>
                      <Link
                        to={`/category/${cat.category.toLowerCase()}/${sub.toLowerCase()}`}
                        className="group flex items-center text-gray-700 hover:text-primary transition-colors py-1.5 text-[15px]"
                        onClick={onClose}
                      >
                        <span>{sub}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-2 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Featured {cat.category}</h3>
                <ul className={`space-y-3 ${isMobile ? 'border-l-2 border-primary/20 pl-4' : ''}`}>
                  {cat.featured.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/featured/${cat.category.toLowerCase()}/${item.toLowerCase()}`}
                        className="group flex items-center text-gray-700 hover:text-primary transition-colors py-1.5 text-[15px]"
                        onClick={onClose}
                      >
                        <span>{item}</span>
                        <ChevronRight className="h-4 w-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-2 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {!isMobile && (
                <>
                  {cat.image && (
                    <div className="mt-4">
                      <img
                        src={cat.image}
                        alt={cat.category}
                        className="rounded-lg w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Popular in {cat.category}</h4>
                    <p className="text-sm text-gray-600">
                      Discover our most loved {cat.category.toLowerCase()} options and latest trends.
                    </p>
                    <Link
                      to={`/category/${cat.category.toLowerCase()}`}
                      className="inline-flex items-center mt-3 text-sm font-medium text-primary hover:text-primary/80"
                      onClick={onClose}
                    >
                      Browse All {cat.category}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
