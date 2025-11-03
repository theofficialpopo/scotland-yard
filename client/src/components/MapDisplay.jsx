import { useState, useRef, useCallback, useEffect } from 'react';
import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getCityConfig } from '../data/cityMaps';

/**
 * MapDisplay - Renders a bounded map view for a specific city
 *
 * Features:
 * - Bounded viewport that stays within city limits
 * - Prevents zooming out too far or in too close
 * - Clean map display with POIs permanently hidden
 * - Road filtering (minor roads hidden at lower zoom for cleaner game board)
 * - Minimal UI for focused gameplay
 *
 * Props:
 * - cityId: The city to display (e.g., 'london', 'newyork')
 * - onMapLoad: Callback when map is loaded and ready
 * - children: Optional overlay components (stations, player markers, etc.)
 */
function MapDisplay({ cityId = 'london', onMapLoad, children }) {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get city configuration (if using predefined city)
  const cityConfig = cityId === 'generated' ? null : getCityConfig(cityId);

  // Get Mapbox token from environment
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initial viewport state
  const [viewState, setViewState] = useState({
    longitude: cityConfig ? cityConfig.center[0] : 0,
    latitude: cityConfig ? cityConfig.center[1] : 0,
    zoom: cityConfig ? cityConfig.zoom : 12,
    pitch: 0,    // Keep flat for game board
    bearing: 0   // North up
  });

  // Handle map load
  const handleLoad = useCallback(() => {
    setMapLoaded(true);

    const map = mapRef.current?.getMap();
    if (!map) return;

    // Hide all POI labels permanently for clean game board
    const layersToHide = [
      'poi-label',                      // Points of interest (hotels, restaurants, shops)
      'transit-label',                  // Transit labels (we'll add our own custom stations)
      'airport-label',                  // Airport labels
      'natural-label',                  // Natural features
      'waterway-label',                 // Rivers, streams
      'place-neighborhood',             // Neighborhood names
      'settlement-subdivision-label'    // Subdivision labels
    ];

    layersToHide.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });

    // Filter roads to show only major roads at lower zoom levels
    // This reduces visual clutter for game board view
    const roadLayers = [
      'road-simple',
      'road-street',
      'road-secondary-tertiary',
      'road-primary',
      'road-motorway-trunk'
    ];

    roadLayers.forEach(layerId => {
      const layer = map.getLayer(layerId);
      if (layer) {
        // Show minor roads (residential, service) only at zoom 14+
        if (layerId === 'road-street') {
          map.setLayerZoomRange(layerId, 14, 22);
        }
        // Show secondary/tertiary roads at zoom 13+
        else if (layerId === 'road-secondary-tertiary') {
          map.setLayerZoomRange(layerId, 13, 22);
        }
        // Major roads (primary, motorway, trunk) visible at all zooms
      }
    });

    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  // Ensure viewport stays within bounds (only for predefined cities)
  const handleMove = useCallback((evt) => {
    if (!cityConfig || !cityConfig.bounds) {
      // No bounds clamping for generated maps
      setViewState(evt.viewState);
      return;
    }

    const { longitude, latitude } = evt.viewState;
    const [[swLng, swLat], [neLng, neLat]] = cityConfig.bounds;

    // Clamp coordinates to stay within bounds
    const clampedLng = Math.max(swLng, Math.min(neLng, longitude));
    const clampedLat = Math.max(swLat, Math.min(neLat, latitude));

    setViewState({
      ...evt.viewState,
      longitude: clampedLng,
      latitude: clampedLat
    });
  }, [cityConfig]);

  // Update viewport when city changes (only for predefined cities)
  useEffect(() => {
    if (cityConfig) {
      setViewState({
        longitude: cityConfig.center[0],
        latitude: cityConfig.center[1],
        zoom: cityConfig.zoom,
        pitch: 0,
        bearing: 0
      });
    }
  }, [cityId, cityConfig]);

  // Show error if no token
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(30, 25, 20, 0.95)',
        color: '#f5f5f5',
        padding: '40px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          🗺️
        </div>
        <h2 style={{ color: '#FFD700', marginBottom: '15px' }}>
          Mapbox Token Required
        </h2>
        <p style={{ maxWidth: '500px', lineHeight: '1.6', color: '#ccc' }}>
          To display maps, you need to set up a Mapbox access token.
        </p>
        <ol style={{
          textAlign: 'left',
          maxWidth: '500px',
          margin: '20px 0',
          lineHeight: '1.8'
        }}>
          <li>Create a free account at <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>mapbox.com</a></li>
          <li>Get your access token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700' }}>your account page</a></li>
          <li>Create a <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px' }}>.env</code> file in the client directory</li>
          <li>Add: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '3px' }}>VITE_MAPBOX_TOKEN=your_token_here</code></li>
          <li>Restart the dev server</li>
        </ol>
        <p style={{ fontSize: '14px', color: '#999', marginTop: '20px' }}>
          Free tier: 50,000 map loads per month (plenty for development)
        </p>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#1e1914'
    }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onLoad={handleLoad}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={cityConfig ? cityConfig.style : 'mapbox://styles/mapbox/streets-v12'}
        minZoom={cityConfig ? cityConfig.minZoom : 11}
        maxZoom={cityConfig ? cityConfig.maxZoom : 18}
        maxBounds={cityConfig ? cityConfig.bounds : undefined}
        dragRotate={false}      // Disable rotation for game board
        touchZoomRotate={false} // Disable touch rotation
        doubleClickZoom={true}
        scrollZoom={true}
        dragPan={true}
        keyboard={true}
      >
        {/* Render overlay children (stations, player markers, etc.) */}
        {mapLoaded && children}
      </Map>

      {/* City Name Badge (only for predefined cities) */}
      {cityConfig && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(30, 25, 20, 0.9)',
          border: '2px solid #8B4513',
          borderRadius: '8px',
          padding: '12px 20px',
          color: '#f5f5f5',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FFD700',
            marginBottom: '4px'
          }}>
            {cityConfig.name}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#ccc'
          }}>
            {cityConfig.description}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 25, 20, 0.95)',
          zIndex: 1000
        }}>
          <div style={{
            textAlign: 'center',
            color: '#f5f5f5'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '15px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              🗺️
            </div>
            <div style={{
              fontSize: '18px',
              color: '#FFD700'
            }}>
              Loading {cityConfig ? cityConfig.name : 'map'}...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default MapDisplay;
