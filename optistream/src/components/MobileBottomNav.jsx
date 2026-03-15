import React from 'react';
import { Home, Upload, Droplets, Leaf, Map } from 'lucide-react';

const MobileBottomNav = ({ activeView, onChange, season }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'citizen', icon: Upload, label: 'Upload' },
    { id: 'flood', icon: Droplets, label: 'Flood' },
    { id: 'sustainability', icon: Leaf, label: 'Sustain' },
    { id: 'watermap', icon: Map, label: 'Map' }
  ];

  return (
    <div className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            <Icon 
              size={24} 
              className="mobile-nav-icon"
            />
            <span className="mobile-nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
