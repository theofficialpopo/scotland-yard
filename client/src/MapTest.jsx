import { useState, useRef } from 'react';
import { Marker } from 'react-map-gl';
import AddressInput from './components/AddressInput';
import MapDisplay from './components/MapDisplay';
import StationSymbol, { getStationSymbol } from './components/StationSymbol';
import { geocodeAddress } from './services/geocoding';
import { generateGameBoardFromBounds } from './services/stationGenerator';
import { researchTransitAvailability, fetchTransitStationsForGameBoard } from './services/transitDataFetcher';

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
  const [researching, setResearching] = useState(false);
  const [hoveredStation, setHoveredStation] = useState(null);
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

  const handleResearchTransit = async () => {
    if (!mapRef.current) return;

    setResearching(true);

    try {
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();
      const center = map.getCenter();

      // Convert bounds to array format
      const boundsArray = [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()]
      ];

      const centerObj = { lng: center.lng, lat: center.lat };

      console.clear();
      console.log('\n\n');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║  TRANSIT DATA RESEARCH MODE - CHECK CONSOLE FOR DETAILED LOGS  ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('\n');

      // Comprehensive transit research
      await fetchTransitStationsForGameBoard(boundsArray, centerObj);

      console.log('\n');
      console.log('╔════════════════════════════════════════════════════════════════╗');
      console.log('║  RESEARCH COMPLETE - SHARE THESE LOGS FOR ANALYSIS            ║');
      console.log('╚════════════════════════════════════════════════════════════════╝');
      console.log('\n\n');

      alert('✅ Transit research complete! Check the browser console for detailed logs. You can copy and share these logs.');

    } catch (error) {
      console.error('❌ Research failed:', error);
      alert('Failed to research transit data. Check console for details.');
    } finally {
      setResearching(false);
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

  // Get station symbol configuration (moved to StationSymbol component)

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
        {/* Station Markers with authentic Scotland Yard symbols */}
        {gameBoard && gameBoard.stations.map((station) => {
          const symbol = getStationSymbol(station.types || ['taxi']);
          const isHovered = hoveredStation === station.id;

          return (
            <Marker
              key={station.id}
              longitude={station.coordinates[0]}
              latitude={station.coordinates[1]}
            >
              <div
                style={{
                  position: 'relative',
                  zIndex: isHovered ? 100 : symbol.zIndex
                }}
                onMouseEnter={() => setHoveredStation(station.id)}
                onMouseLeave={() => setHoveredStation(null)}
                title={`Station ${station.id}: ${station.name}\n${symbol.label}`}
              >
                <StationSymbol station={station} isHovered={isHovered} />
              </div>
            </Marker>
          );
        })}
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
          onClick={handleResearchTransit}
          disabled={researching || generating}
          style={{
            padding: '12px 24px',
            background: researching ? 'rgba(100, 100, 100, 0.95)' : 'rgba(70, 130, 180, 0.95)',
            color: '#fff',
            border: '2px solid #4682B4',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (researching || generating) ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            animation: researching ? 'pulse 1.5s ease-in-out infinite' : 'none'
          }}
        >
          {researching ? '🔍 Researching...' : '🔬 Research Transit Data'}
        </button>

        <button
          onClick={handleGenerateStations}
          disabled={generating || researching}
          style={{
            padding: '12px 24px',
            background: generating ? 'rgba(100, 100, 100, 0.95)' : 'rgba(255, 215, 0, 0.95)',
            color: generating ? '#ccc' : '#1e1914',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (generating || researching) ? 'not-allowed' : 'pointer',
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
            <p style={{ margin: '8px 0', color: '#87CEEB' }}>🔬 Click "Research Transit Data" to analyze available underground/bus stations (check console)</p>
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
            gap: '15px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '16px' }}>🚇</span>
              <strong style={{ color: '#FF0000' }}>{gameBoard.metadata.undergroundStations}</strong>
              <span style={{ fontSize: '12px' }}>underground</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '16px' }}>🚌</span>
              <strong style={{ color: '#00CC00' }}>{gameBoard.metadata.busStations}</strong>
              <span style={{ fontSize: '12px' }}>bus</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '16px' }}>🚕</span>
              <strong style={{ color: '#FFD700' }}>{gameBoard.metadata.taxiOnlyStations}</strong>
              <span style={{ fontSize: '12px' }}>taxi</span>
            </span>
            <span style={{ borderLeft: '1px solid #666', paddingLeft: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <strong style={{ color: '#87CEEB' }}>{gameBoard.metadata.realTransitStations}</strong>
              <span style={{ fontSize: '12px' }}>real transit</span>
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
            {gameBoard.stations.map((station) => {
              const symbol = getStationSymbol(station.types || ['taxi']);

              // Get icon based on station type
              const getIcon = () => {
                if (symbol.type === 'underground-bus-taxi') return '🚇';
                if (symbol.type === 'bus-taxi') return '🚌';
                return '🚕';
              };

              // Use semicircle color for the main color
              const mainColor = symbol.semicircleColor;

              return (
                <div
                  key={station.id}
                  style={{
                    padding: '8px 10px',
                    background: `${mainColor}15`,
                    border: `2px solid ${mainColor}`,
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#f5f5f5',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${mainColor}30`;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${mainColor}15`;
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{ fontSize: '16px' }}>{getIcon()}</span>
                    <span style={{
                      fontWeight: 'bold',
                      color: mainColor
                    }}>
                      #{station.id}
                    </span>
                    {station.realTransit && (
                      <span style={{ fontSize: '10px', color: '#87CEEB' }}>✓</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#ccc',
                    paddingLeft: '24px'
                  }}>
                    {station.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapTest;
