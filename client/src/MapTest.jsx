import { useState, useRef } from 'react';
import { Marker } from 'react-map-gl';
import AddressInput from './components/AddressInput';
import MapDisplay from './components/MapDisplay';
import { geocodeAddress } from './services/geocoding';
import { generateGameBoardFromBounds } from './services/stationGenerator';

/**
 * MapTest - Test page for automated game board generation
 *
 * Flow:
 * 1. Enter address → shows map centered on location
 * 2. User adjusts zoom/pan to desired game area
 * 3. Click "Generate Stations" → creates stations based on current viewport
 * 4. Stations snap to actual roads
 */
function MapTest() {
  const [gameBoard, setGameBoard] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [generating, setGenerating] = useState(false);
  const mapRef = useRef(null);

  const handleAddressSubmit = async (address) => {
    try {
      console.log('Geocoding address:', address);
      const geocoded = await geocodeAddress(address);

      setLocationData({
        address: geocoded.address,
        center: geocoded.coordinates
      });
      setShowMap(true);
      setGameBoard(null); // Clear any previous game board

    } catch (error) {
      console.error('Failed to geocode address:', error);
      alert('Failed to find location. Please try again.');
    }
  };

  const handleGenerateStations = async () => {
    if (!mapRef.current) return;

    setGenerating(true);

    try {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();

      // Convert bounds to array format
      const boundsArray = [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()]
      ];

      // Get map center
      const center = map.getCenter();
      const centerObj = { lng: center.lng, lat: center.lat };

      console.log('Generating stations for current viewport:', boundsArray);

      const generatedGameBoard = await generateGameBoardFromBounds(
        boundsArray,
        centerObj,
        locationData.address
      );

      setGameBoard(generatedGameBoard);

    } catch (error) {
      console.error('Failed to generate game board:', error);
      alert('Failed to generate stations. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    setShowMap(false);
    setGameBoard(null);
    setLocationData(null);
  };

  const handleMapLoad = (map) => {
    console.log('Map loaded successfully');
  };

  // Address input view
  if (!showMap || !locationData) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 25, 20, 0.98), rgba(50, 40, 30, 0.98))',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#FFD700',
            fontSize: '48px',
            marginBottom: '10px',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}>
            Scotland Yard
          </h1>
          <p style={{
            color: '#ccc',
            fontSize: '18px'
          }}>
            Automated Game Board Generation
          </p>
        </div>

        <AddressInput onGameBoardGenerated={handleAddressSubmit} />

        <div style={{
          marginTop: '40px',
          maxWidth: '600px',
          padding: '20px',
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          color: '#ccc',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h3 style={{ color: '#FFD700', marginBottom: '10px' }}>How it works:</h3>
          <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Enter any address worldwide</li>
            <li>Map displays centered on your location</li>
            <li>Zoom in/out to set your game area size</li>
            <li>Click "Generate Stations" to create the board</li>
            <li>Stations automatically snap to real roads</li>
          </ol>
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
        ref={mapRef}
        cityId="generated"  // Not using predefined cities
        onMapLoad={handleMapLoad}
        generatedCenter={locationData.center}
      >
        {/* Station Markers (only if game board exists) */}
        {gameBoard && gameBoard.stations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.coordinates[0]}
            latitude={station.coordinates[1]}
          >
            <div style={{
              background: '#FFD700',
              border: '3px solid #8B4513',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1e1914',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={station.name}
          >
            {station.id}
          </div>
          </Marker>
        ))}
      </MapDisplay>

      {/* Top Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        display: 'flex',
        gap: '12px',
        zIndex: 1000
      }}>
        <button
          onClick={handleBack}
          style={{
            padding: '12px 24px',
            background: 'rgba(30, 25, 20, 0.95)',
            color: '#FFD700',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
          }}
        >
          ← New Address
        </button>

        <button
          onClick={handleGenerateStations}
          disabled={generating}
          style={{
            padding: '12px 24px',
            background: generating ? 'rgba(100, 100, 100, 0.95)' : 'rgba(255, 215, 0, 0.95)',
            color: generating ? '#ccc' : '#1e1914',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: generating ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            animation: generating ? 'pulse 1.5s ease-in-out infinite' : 'none'
          }}
        >
          {generating ? '⏳ Generating...' : (gameBoard ? '🔄 Regenerate Stations' : '🎲 Generate Stations')}
        </button>
      </div>

      {/* Info Panel */}
      {!gameBoard ? (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 25, 20, 0.95)',
          border: '2px solid #8B4513',
          borderRadius: '12px',
          padding: '20px 30px',
          color: '#f5f5f5',
          zIndex: 1000,
          maxWidth: '600px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '8px'
          }}>
            {locationData.address}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#ccc',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '8px 0' }}>Zoom in/out to set your game area size</p>
            <p style={{ margin: '8px 0' }}>Click "Generate Stations" when ready</p>
          </div>
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 25, 20, 0.95)',
          border: '2px solid #8B4513',
          borderRadius: '12px',
          padding: '20px 30px',
          color: '#f5f5f5',
          zIndex: 1000,
          maxWidth: '600px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '8px'
          }}>
            {gameBoard.address}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#ccc',
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <span>
              <strong style={{ color: '#FFD700' }}>{gameBoard.stations.length}</strong> stations
            </span>
            <span>
              <strong style={{ color: '#FFD700' }}>{gameBoard.metadata.snappedStations}</strong> snapped to roads
            </span>
            <span>
              Template: <strong style={{ color: '#FFD700' }}>Classic Scotland Yard</strong>
            </span>
          </div>
        </div>
      )}

      {/* Station List (Overlay) - Only show when game board exists */}
      {gameBoard && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(30, 25, 20, 0.95)',
          border: '2px solid #8B4513',
          borderRadius: '8px',
          padding: '15px',
          maxWidth: '250px',
          maxHeight: '70vh',
          overflowY: 'auto',
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{
            color: '#FFD700',
            fontSize: '16px',
            marginBottom: '10px',
            borderBottom: '1px solid #8B4513',
            paddingBottom: '8px'
          }}>
            Stations ({gameBoard.stations.length})
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {gameBoard.stations.map((station) => (
              <div
                key={station.id}
                style={{
                  padding: '8px 10px',
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#f5f5f5'
                }}
              >
                <div style={{
                  fontWeight: 'bold',
                  color: '#FFD700',
                  marginBottom: '4px'
                }}>
                  #{station.id}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#ccc'
                }}>
                  {station.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapTest;
