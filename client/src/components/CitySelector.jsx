import { useState } from 'react';
import { getAvailableCities, getCityArea } from '../data/cityMaps';

/**
 * CitySelector - UI for selecting which city map to display
 *
 * Features:
 * - Visual cards for each city
 * - Shows city name, description, and details
 * - Highlights selected city
 * - Scotland Yard themed styling
 *
 * Props:
 * - selectedCity: Currently selected city ID
 * - onCityChange: Callback when city is selected (cityId) => void
 * - compact: Optional compact mode for smaller UI
 */
function CitySelector({ selectedCity = 'london', onCityChange, compact = false }) {
  const cities = getAvailableCities();

  const handleSelect = (cityId) => {
    if (onCityChange) {
      onCityChange(cityId);
    }
  };

  // Compact dropdown mode
  if (compact) {
    return (
      <div style={{
        background: 'rgba(30, 25, 20, 0.9)',
        border: '2px solid #8B4513',
        borderRadius: '8px',
        padding: '12px',
        minWidth: '200px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          color: '#FFD700',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: 'bold'
        }}>
          Select City
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(50, 45, 40, 0.8)',
            border: '2px solid #8B4513',
            borderRadius: '6px',
            color: '#f5f5f5',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Full card grid mode
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(30, 25, 20, 0.95)',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '42px',
            color: '#FFD700',
            marginBottom: '15px',
            fontWeight: 'bold'
          }}>
            Select Your City
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#ccc',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Choose a city to create your Scotland Yard game board.
            Each city has a unique layout and transit system.
          </p>
        </div>

        {/* City Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {cities.map((city) => {
            const isSelected = city.id === selectedCity;
            const area = getCityArea(city.id).toFixed(1);

            return (
              <div
                key={city.id}
                onClick={() => handleSelect(city.id)}
                style={{
                  background: isSelected
                    ? 'rgba(70, 60, 50, 0.9)'
                    : 'rgba(50, 45, 40, 0.8)',
                  border: `3px solid ${isSelected ? '#FFD700' : '#8B4513'}`,
                  borderRadius: '12px',
                  padding: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isSelected
                    ? '0 8px 24px rgba(255, 215, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.4)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(60, 55, 50, 0.9)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(50, 45, 40, 0.8)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: '#FFD700',
                    color: '#1e1914',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Selected
                  </div>
                )}

                {/* City Emoji/Icon */}
                <div style={{
                  fontSize: '48px',
                  marginBottom: '15px',
                  textAlign: 'center'
                }}>
                  {getCityEmoji(city.id)}
                </div>

                {/* City Name */}
                <h2 style={{
                  fontSize: '28px',
                  color: isSelected ? '#FFD700' : '#f5f5f5',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  {city.name}
                </h2>

                {/* City Description */}
                <p style={{
                  fontSize: '14px',
                  color: '#ccc',
                  marginBottom: '20px',
                  textAlign: 'center',
                  minHeight: '40px'
                }}>
                  {city.description}
                </p>

                {/* City Stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '15px',
                  paddingTop: '15px',
                  borderTop: '1px solid rgba(139, 69, 19, 0.5)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#FFD700',
                      marginBottom: '4px'
                    }}>
                      {city.recommendedStations}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Stations
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#4CAF50',
                      marginBottom: '4px'
                    }}>
                      {area}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      km²
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected City Info */}
        {selectedCity && (
          <div style={{
            background: 'rgba(50, 45, 40, 0.8)',
            border: '2px solid #FFD700',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '16px',
              color: '#FFD700',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              Ready to play in {cities.find(c => c.id === selectedCity)?.name}?
            </div>
            <div style={{
              fontSize: '14px',
              color: '#ccc'
            }}>
              The map will be bounded to this city's area for a consistent game experience.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get emoji icon for each city
 */
function getCityEmoji(cityId) {
  const emojis = {
    london: '🇬🇧',
    newyork: '🗽',
    paris: '🗼',
    berlin: '🐻',
    tokyo: '🗾'
  };
  return emojis[cityId] || '🌍';
}

export default CitySelector;
