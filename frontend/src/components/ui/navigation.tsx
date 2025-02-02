import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MegaMenu } from './mega-menu';
import { Menu, X, ChevronDown, ChevronRight, Search, ShoppingCart, User, Phone } from "lucide-react";

interface NavigationProps {
  userRole?: 'customer' | 'employee';
}

const flooringCategories = [
  {
    category: 'Tile',
    subcategories: ['Porcelain', 'Ceramic', 'Natural Stone', 'Glass', 'Mosaic'],
    featured: ['New Arrivals', 'Best Sellers', 'Clearance']
  },
  {
    category: 'Wood',
    subcategories: ['Hardwood', 'Engineered Wood', 'Bamboo', 'Cork'],
    featured: ['Waterproof Wood', 'Wide Plank', 'Hand Scraped']
  },
  {
    category: 'Laminate',
    subcategories: ['Water Resistant', 'Wood Look', 'Stone Look', 'Premium'],
    featured: ['Commercial Grade', 'Pet-Friendly', 'Moisture Resistant']
  },
  {
    category: 'Vinyl',
    subcategories: ['Luxury Vinyl Plank', 'Sheet Vinyl', 'Vinyl Tile', 'Waterproof'],
    featured: ['SPC Core', 'Click-Lock', 'Peel & Stick']
  }
];

export function Navigation({ userRole }: NavigationProps): React.JSX.Element {
  const location = useLocation();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  // Close menus when route changes
  React.useEffect(() => {
    // Close menus immediately when route changes
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    
    // Also handle browser back/forward navigation
    const handlePopState = () => {
      setMobileMenuOpen(false);
      setMegaMenuOpen(false);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  
  // Check auth state on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    checkAuth();
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleMouseEnter = () => !isMobile && setMegaMenuOpen(true);
  const handleMouseLeave = () => !isMobile && setMegaMenuOpen(false);
  const toggleMegaMenu = () => setMegaMenuOpen(!megaMenuOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  
  React.useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;
      setIsMobile(newIsMobile);
      if (!newIsMobile) {
        setMobileMenuOpen(false);
        setMegaMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <nav className="bg-white border-b border-gray-200 relative shadow-nav" role="navigation" aria-label="Main navigation">
      {/* Top banner with improved accessibility */}
      <div className="bg-primary px-4 py-2 text-white text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="tel:1-800-FLOORING" className="flex items-center hover:text-accent transition-colors" aria-label="Call our support line">
              <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
              <span className="font-medium">1-800-FLOORING</span>
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/store-locator" className="hover:text-accent transition-colors flex items-center">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Find a Store
            </Link>
            <Link to="/contact" className="hover:text-accent transition-colors flex items-center">
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2.5 bg-white hover:bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-sm border border-gray-200 relative z-50"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              onClick={toggleMobileMenu}
            >
              <div className="relative w-6 h-6">
                <div className={`absolute inset-0 transform transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-180 scale-110 text-primary' : 'text-gray-700 hover:text-primary'
                }`}>
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </div>
              </div>
            </button>
            
            {/* Logo with improved visibility */}
            <Link 
              to="/" 
              className="text-2xl font-bold text-primary mx-4 py-2 flex items-center space-x-2 hover:text-primary-dark transition-colors"
              aria-label="Flooring CRM Home"
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Flooring CRM</span>
            </Link>
          </div>

          {/* Navigation links */}
          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <label htmlFor="search-products" className="sr-only">Search products</label>
              <input
                id="search-products"
                type="search"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                aria-label="Search products"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" aria-hidden="true" />
              <kbd className="absolute right-3 top-2.5 hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Main navigation items */}
          <div
            className={`${
              isMobile
                ? mobileMenuOpen
                  ? 'fixed inset-x-0 top-[8rem] bottom-0 z-40 flex flex-col items-start p-6 bg-white border-t border-gray-200 shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0'
                  : 'fixed inset-x-0 top-[8rem] bottom-0 z-40 flex flex-col items-start p-6 bg-white border-t border-gray-200 shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-full'
                : 'flex'
            } lg:relative lg:items-center lg:space-x-6 transition-transform duration-300 ease-in-out`}
          >
            <div className="w-full space-y-6">
              <nav className="flex flex-col space-y-4" role="navigation" aria-label="Main menu">
                <Link 
                  to="/" 
                  className={`text-gray-700 font-medium hover:text-primary transition-colors block relative ${
                    isActive('/') ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''
                  } ${isMobile ? 'w-full py-3 text-lg hover:bg-gray-50 rounded-md px-3' : 'py-2'}`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Home</span>
                  </span>
                </Link>
                
                {/* Products Mega Menu Trigger */}
                <div
                  className={`relative group ${isMobile ? 'w-full' : ''}`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleMegaMenu();
                    }}
                    className={`text-gray-700 font-medium hover:text-primary transition-colors block relative ${
                      isActive('/products') ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''
                    } ${isMobile ? 'w-full py-3 text-lg hover:bg-gray-50 rounded-md px-3' : 'py-2'} flex items-center space-x-2`}
                  >
                    <span>Products</span>
                    <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                  </Link>
                  {!isMobile && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  )}
                  {megaMenuOpen && (
                    <MegaMenu
                      categories={flooringCategories}
                      onClose={isMobile ? toggleMegaMenu : handleMouseLeave}
                      isMobile={isMobile}
                    />
                  )}
                </div>
                
                {/* Customer-facing links with hover effects */}
                <div className={`relative group ${isMobile ? 'w-full border-b border-gray-200' : ''}`}>
                  <Link 
                    to="/shop-by-room"
                    className={`text-gray-700 font-medium hover:text-primary transition-colors block relative ${
                      isActive('/shop-by-room') ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''
                    } ${isMobile ? 'w-full py-3 text-lg hover:bg-gray-50 rounded-md px-3' : 'py-2'}`}
                    aria-label="Shop by Room - Browse flooring options by room type"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                      </svg>
                      <span>Shop by Room</span>
                    </span>
                  </Link>
                </div>
                
                <div className={`relative group ${isMobile ? 'w-full border-b border-gray-200' : ''}`}>
                  <Link 
                    to="/project-gallery"
                    className={`text-gray-700 font-medium hover:text-primary transition-colors block relative ${
                      isActive('/project-gallery') ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''
                    } ${isMobile ? 'w-full py-3 text-lg hover:bg-gray-50 rounded-md px-3' : 'py-2'}`}
                    aria-label="Project Gallery - View our completed flooring projects"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <span>Project Gallery</span>
                    </span>
                  </Link>
                </div>
                
                {/* Featured Call-to-Action Links */}
                <div className={`relative group ${isMobile ? 'w-full border-b border-gray-200' : ''}`}>
                  <Link 
                    to="/design-services"
                    className={`text-gray-700 font-medium hover:text-primary transition-colors block relative ${
                      isActive('/design-services') ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : ''
                    } ${isMobile ? 'w-full py-3 text-lg hover:bg-gray-50 rounded-md px-3' : 'py-2'}`}
                    aria-label="Design Services - Professional flooring design consultation"
                  >
                    <span className="flex items-center space-x-2">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                      <span>Design Services</span>
                    </span>
                  </Link>
                </div>
                
                <div className={`relative group ${isMobile ? 'w-full' : ''}`}>
                  <Link 
                    to="/request-quote"
                    className={`inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors w-full justify-center ${
                      isActive('/request-quote') ? 'ring-2 ring-primary ring-offset-2' : ''
                    } ${isMobile ? 'text-lg' : ''}`}
                  >
                    Request Quote
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>

            {/* Employee Management Section */}
                {userRole === 'employee' && (
                  <div className={`${isMobile ? 'flex flex-col space-y-2' : 'lg:ml-4 flex space-x-4'}`}>
                    <div className={`relative group ${isMobile ? 'w-full' : ''}`}>
                      <Link 
                        to="/manage-materials"
                        className={`inline-flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors w-full justify-center ${
                          isActive('/manage-materials') ? 'ring-2 ring-secondary ring-offset-2' : ''
                        } ${isMobile ? 'text-lg' : ''}`}
                      >
                        Manage Materials
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className={`relative group ${isMobile ? 'w-full' : ''}`}>
                      <Link 
                        to="/manage-services"
                        className={`inline-flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 transition-colors w-full justify-center ${
                          isActive('/manage-services') ? 'ring-2 ring-secondary ring-offset-2' : ''
                        } ${isMobile ? 'text-lg' : ''}`}
                      >
                        Manage Services
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </div>
          
          {/* User actions */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/cart"
              className="text-gray-700 hover:text-primary transition-colors relative group"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-6 w-6" aria-hidden="true" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center group-hover:bg-primary-dark transition-colors" aria-label="Cart items">0</span>
            </Link>
            
            {isLoggedIn ? (
              <div className="relative">
                <Link 
                  to="/account"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary transition-colors group"
                  aria-label="My account"
                >
                  <User className="h-6 w-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                  <span className="hidden lg:inline font-medium">My Account</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login"
                  className="text-gray-700 hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link 
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm hover:shadow-md"
                >
                  <span className="text-sm font-medium">Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="hidden lg:block border-t border-gray-200">
        <div className="container mx-auto">
          <div className="flex items-center space-x-8 py-2">
            {flooringCategories.map((category) => (
              <div
                key={category.category}
                className="relative group"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link 
                  to={`/category/${category.category.toLowerCase()}`}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary py-2"
                  onClick={() => {
                    if (isMobile) {
                      setMobileMenuOpen(false);
                      setMegaMenuOpen(false);
                    }
                  }}
                >
                  <span>{category.category}</span>
                  <ChevronDown className="h-4 w-4" />
                </Link>
                {megaMenuOpen && (
                  <div className="absolute top-full left-0 w-screen bg-white shadow-lg border-t border-gray-200">
                    <div className="container mx-auto py-6">
                      <div className="grid grid-cols-4 gap-8">
                        <div>
                          <h3 className="font-semibold mb-4">{category.category} Categories</h3>
                          <ul className="space-y-2">
                            {category.subcategories.map((sub) => (
                              <li key={sub}>
                                <Link 
                                  to={`/category/${category.category.toLowerCase()}/${sub.toLowerCase()}`} 
                                  className="text-gray-600 hover:text-primary"
                                  onClick={() => {
                                    if (isMobile) {
                                      setMobileMenuOpen(false);
                                      setMegaMenuOpen(false);
                                    }
                                  }}
                                >
                                  {sub}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-4">Featured</h3>
                          <ul className="space-y-2">
                            {category.featured.map((item) => (
                              <li key={item}>
                                <Link 
                                  to={`/featured/${item.toLowerCase()}`} 
                                  className="text-gray-600 hover:text-primary"
                                  onClick={() => {
                                    if (isMobile) {
                                      setMobileMenuOpen(false);
                                      setMegaMenuOpen(false);
                                    }
                                  }}
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
