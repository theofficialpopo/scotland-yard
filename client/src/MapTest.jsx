import { useState } from 'react';
import CitySelector from './components/CitySelector';
import MapDisplay from './components/MapDisplay';

/**
 * MapTest - Test page for map selection and display
 *
 * This is a standalone page for testing the map infrastructure
 * before integrating it into the main game.
 *
 * Features:
 * - City selection screen
 * - Map display with bounded viewport
 * - Toggle between selection and map view
 */
function MapTest() {
  const [selectedCity, setSelectedCity] = useState('london');
  const [showMap, setShowMap] = useState(false);

  const handleCityChange = (cityId) => {
    setSelectedCity(cityId);
  };

  const handleMapLoad = (map) => {
    console.log('Map loaded successfully:', map);
    // You can add custom map interactions here
  };

  // City selection view
  if (!showMap) {
    return (
      <div style={{
        background: 'rgba(30, 25, 20, 0.95)',
        minHeight: '100vh'
      }}>
        <CitySelector
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          compact={false}
        />

        {/* Action Buttons */}
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '15px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowMap(true)}
            disabled={!selectedCity}
            style={{
              padding: '15px 40px',
              background: selectedCity ? '#FFD700' : '#666',
              color: '#1e1914',
              border: '3px solid #8B4513',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: selectedCity ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              if (selectedCity) {
                e.currentTarget.style.background = '#FFC700';
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCity) {
                e.currentTarget.style.background = '#FFD700';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            View Map
          </button>
        </div>
      </div>
    );
  }

  // Map display view
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Map Display */}
      <MapDisplay
        cityId={selectedCity}
        onMapLoad={handleMapLoad}
      >
        {/* Future: Add station markers, player positions, etc. here */}
      </MapDisplay>

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 1000
      }}>
        {/* Compact City Selector */}
        <CitySelector
          selectedCity={selectedCity}
          onCityChange={handleCityChange}
          compact={true}
        />

        {/* Back Button */}
        <button
          onClick={() => setShowMap(false)}
          style={{
            padding: '12px 20px',
            background: 'rgba(30, 25, 20, 0.9)',
            color: '#FFD700',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(50, 45, 40, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(30, 25, 20, 0.9)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Back to Selection
        </button>
      </div>

      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(30, 25, 20, 0.9)',
        border: '2px solid #8B4513',
        borderRadius: '8px',
        padding: '15px 30px',
        color: '#f5f5f5',
        fontSize: '14px',
        textAlign: 'center',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: '5px', color: '#FFD700', fontWeight: 'bold' }}>
          🎮 Map Test Mode
        </div>
        <div style={{ color: '#ccc' }}>
          This is a preview of the bounded map display. Station placement will be added later.
        </div>
      </div>
    </div>
  );
}

export default MapTest;
