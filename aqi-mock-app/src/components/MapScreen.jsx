import React from 'react'
import sriLankaMap from '@svg-maps/sri-lanka'

export default function MapScreen({ citiesData, onSelectCity }) {
  return (
    <div className="map-screen">
      <h1 className="map-title">SentinelAQ</h1>
      <p className="map-subtitle">Tap a city to view detailed pollutant metrics.</p>
      
      <div className="map-container">
        <svg viewBox={sriLankaMap.viewBox} className="sl-map-svg">
          {/* Render all districts */}
          {sriLankaMap.locations.map(location => (
            <path 
              key={location.id} 
              id={location.id}
              d={location.path} 
              fill="#1f2937" 
              stroke="#374151" 
              strokeWidth="1.5"
            />
          ))}

          {/* Colombo Dot */}
          <g className="map-marker" onClick={() => onSelectCity('colombo')}>
            <circle cx="60" cy="590" r="16" className="pulse-circle moderate" />
            <circle cx="60" cy="590" r="10" className="marker-bead moderate" />
            <circle cx="60" cy="590" r="4" fill="#ffffff" />
            
            {/* Tooltip Box */}
            <rect x="15" y="515" width="90" height="46" rx="8" fill="rgba(255,255,255,0.8)" style={{backdropFilter: 'blur(10px)'}} />
            <text x="60" y="535" fontSize="16" fill="var(--primary)" textAnchor="middle" fontWeight="700">AQI {citiesData.colombo.aqi}</text>
            <text x="60" y="552" fontSize="12" fill="var(--on-surface-variant)" textAnchor="middle">Colombo</text>
          </g>

          {/* Kandy Dot */}
          <g className="map-marker" onClick={() => onSelectCity('kandy')}>
            <circle cx="210" cy="495" r="16" className="pulse-circle good" />
            <circle cx="210" cy="495" r="10" className="marker-bead good" />
            <circle cx="210" cy="495" r="4" fill="#ffffff" />
            
            {/* Tooltip Box */}
            <rect x="165" y="420" width="90" height="46" rx="8" fill="rgba(255,255,255,0.8)" style={{backdropFilter: 'blur(10px)'}} />
            <text x="210" y="440" fontSize="16" fill="var(--primary)" textAnchor="middle" fontWeight="700">AQI {citiesData.kandy.aqi}</text>
            <text x="210" y="457" fontSize="12" fill="var(--on-surface-variant)" textAnchor="middle">Kandy</text>
          </g>

          {/* Jaffna Dot */}
          <g className="map-marker">
            <circle cx="98" cy="39" r="10" fill="#9ca3af" />
            <circle cx="98" cy="39" r="5" fill="#111827" />
            
            {/* Tooltip Box (positioned below for Jaffna) */}
            <rect x="53" y="54" width="90" height="46" rx="8" fill="white" />
            <text x="98" y="74" fontSize="13" fill="#111827" textAnchor="middle" fontWeight="700">Coming Soon</text>
            <text x="98" y="91" fontSize="12" fill="#6b7280" textAnchor="middle">Jaffna</text>
          </g>

          {/* Batticaloa Dot */}
          <g className="map-marker">
            <circle cx="377" cy="406" r="10" fill="#9ca3af" />
            <circle cx="377" cy="406" r="5" fill="#111827" />
            
            {/* Tooltip Box */}
            <rect x="332" y="331" width="90" height="46" rx="8" fill="white" />
            <text x="377" y="351" fontSize="13" fill="#111827" textAnchor="middle" fontWeight="700">Coming Soon</text>
            <text x="377" y="368" fontSize="12" fill="#6b7280" textAnchor="middle">Batticaloa</text>
          </g>
        </svg>
      </div>
    </div>
  )
}
