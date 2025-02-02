import * as React from "react"

export function TractorIllustration(): React.JSX.Element {
  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Main Body */}
        <rect x="300" y="250" width="300" height="150" fill="#2B8A3E" rx="20" />
        
        {/* Cabin */}
        <path
          d="M500 200 L600 200 L650 250 L650 400 L500 400 L500 200"
          fill="#40C057"
          stroke="#237032"
          strokeWidth="4"
        />
        
        {/* Windows */}
        <path
          d="M520 220 L580 220 L620 260 L620 380 L520 380 L520 220"
          fill="#E6F7FF"
          opacity="0.6"
        />
        
        {/* Large Wheel */}
        <circle cx="350" cy="400" r="100" fill="#343A40" />
        <circle cx="350" cy="400" r="80" fill="#495057" />
        <circle cx="350" cy="400" r="20" fill="#343A40" />
        
        {/* Small Wheel */}
        <circle cx="650" cy="400" r="60" fill="#343A40" />
        <circle cx="650" cy="400" r="45" fill="#495057" />
        <circle cx="650" cy="400" r="15" fill="#343A40" />
        
        {/* Decorative Elements */}
        <rect x="250" y="300" width="50" height="20" fill="#FCC419" rx="5" />
        <circle cx="280" cy="250" r="15" fill="#FCC419" />
      </svg>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-50/30 to-neutral-50/80" />
    </div>
  )
}
