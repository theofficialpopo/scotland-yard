import { useState } from 'react';
import { Marker } from 'react-map-gl';
import AddressInput from './components/AddressInput';
import MapDisplay from './components/MapDisplay';

/**
 * MapTest - Test page for automated game board generation
 *
 * Flow:
 * 1. Enter address
 * 2. System generates stations at intersections
 * 3. Display map with stations
 */
function MapTest() {
  const [gameBoard, setGameBoard] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const handleGameBoardGenerated = (generatedGameBoard) => {
    console.log('Game board generated:', generatedGameBoard);
    setGameBoard(generatedGameBoard);
    setShowMap(true);
  };

  const handleBack = () => {
    setShowMap(false);
    setGameBoard(null);
  };

  const handleMapLoad = (map) => {
    console.log('Map loaded successfully');

    // If we have a game board, fit the map to show all stations
    if (gameBoard && gameBoard.bounds) {
      const [[swLng, swLat], [neLng, neLat]] = gameBoard.bounds;
      map.fitBounds(
        [[swLng, swLat], [neLng, neLat]],
        {
          padding: 50,
          duration: 1000
        }
      );
    }
  };

  // Address input view
  if (!showMap || !gameBoard) {
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

        <AddressInput onGameBoardGenerated={handleGameBoardGenerated} />

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
            <li>System finds the area on the map</li>
            <li>Detects road intersections automatically</li>
            <li>Places stations at strategic crossroads</li>
            <li>Generates a playable game board instantly</li>
          </ol>
        </div>
      </div>
    );
  }

  // Map display view with generated stations
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Map Display */}
      <MapDisplay
        cityId="generated"  // Not using predefined cities
        onMapLoad={handleMapLoad}
      >
        {/* Station Markers */}
        {gameBoard.stations.map((station) => (
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
        ))}
      </MapDisplay>

      {/* Back Button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 24px',
          background: 'rgba(30, 25, 20, 0.95)',
          color: '#FFD700',
          border: '2px solid #8B4513',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        ← New Address
      </button>

      {/* Game Board Info Panel */}
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
            <strong style={{ color: '#FFD700' }}>{gameBoard.metadata.intersectionCount}</strong> intersections analyzed
          </span>
          <span>
            Area type: <strong style={{ color: '#FFD700' }}>{gameBoard.metadata.areaTypeDetails.name}</strong>
          </span>
        </div>
      </div>

      {/* Station List (Overlay) */}
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
                #{station.id} - {station.roadCount} roads
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
    </div>
  );
}

export default MapTest;
