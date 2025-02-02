import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RequestQuote from './components/RequestQuote';
import ManageMaterials from './components/ManageMaterials';
import ManageServices from './components/ManageServices';
import Register from './components/Register';
import Login from './components/Login';

import { Hero } from "./components/ui/hero"
import { ContactSection } from "./components/ui/contact-section"
import { ShopByRoom } from "./components/ui/shop-by-room"
import { ProjectGallery } from "./components/ui/project-gallery"
import { DesignServices } from "./components/ui/design-services"
import { MachineService } from "./components/ui/machine-service"
import { TeamSection } from "./components/ui/team-section"
import { ServiceDepartments } from "./components/ui/service-departments"
import { RoomVisualizer } from "./components/ui/room-visualizer"
import { Navigation } from "./components/ui/navigation"

function App() {
  const [userRole, setUserRole] = useState<'customer' | 'employee' | undefined>(undefined);
  
  useEffect(() => {
    const checkAuthState = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user info');
          }
          
          const userData = await response.json();
          setUserRole(userData.role as 'customer' | 'employee');
          localStorage.setItem('userRole', userData.role);
        } catch (err) {
          console.error('Error fetching user info:', err);
          setUserRole(undefined);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
        }
      } else {
        setUserRole(undefined);
        localStorage.removeItem('userRole');
        localStorage.removeItem('token');
      }
    };

    // Check on mount and when auth changes
    const handler = () => checkAuthState();
    window.addEventListener('auth-change', handler);
    checkAuthState();

    return () => window.removeEventListener('auth-change', handler);
  }, []);

  return (
    <BrowserRouter basename="/">
      <div className="min-h-screen bg-neutral-50">
        <Navigation userRole={userRole} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="request-quote" element={<RequestQuote />} />
            <Route path="manage-materials" element={<ManageMaterials userRole={userRole} />} />
            <Route path="manage-services" element={<ManageServices userRole={userRole} />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            <Route path="shop-by-room" element={<ShopByRoom />} />
            <Route path="project-gallery" element={<ProjectGallery />} />
            <Route path="design-services" element={<DesignServices />} />
            <Route path="/" element={<>
              <Hero />
              <RoomVisualizer />
              <MachineService />
              <TeamSection />
              <ServiceDepartments />
              <ContactSection />
            </>} />
            <Route path="*" element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Return to Home
                </Link>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
