import { useState } from 'react';

/**
 * SettingsModal - Centralized settings panel for game options
 * Includes Leave Game and placeholder for future settings
 */
function SettingsModal({ isOpen, onClose, onLeaveGame }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(30, 25, 20, 0.98)',
            border: '3px solid #8B4513',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw',
            color: '#f5f5f5'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            borderBottom: '2px solid #8B4513',
            paddingBottom: '15px'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              color: '#FFD700'
            }}>
              Settings
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ccc',
                fontSize: '28px',
                cursor: 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ccc'}
            >
              ×
            </button>
          </div>

          {/* Settings Sections */}
          <div style={{ marginBottom: '20px' }}>
            {/* Game Section */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'rgba(50, 45, 40, 0.6)',
              borderRadius: '8px',
              border: '1px solid #8B4513'
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: '#FFD700',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Game
              </h3>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to leave the game?')) {
                    onLeaveGame();
                    onClose();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#dc3545',
                  color: '#fff',
                  border: '2px solid #8B4513',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#c82333';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc3545';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Leave Game
              </button>
            </div>

            {/* Future Settings Section - Placeholder */}
            <div style={{
              padding: '15px',
              background: 'rgba(50, 45, 40, 0.4)',
              borderRadius: '8px',
              border: '1px solid #8B4513',
              opacity: 0.6
            }}>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Audio (Coming Soon)
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                color: '#999'
              }}>
                <span>Sound Effects</span>
                <div style={{
                  width: '48px',
                  height: '24px',
                  background: '#444',
                  borderRadius: '12px',
                  border: '1px solid #666'
                }}></div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#999'
              }}>
                <span>Background Music</span>
                <div style={{
                  width: '48px',
                  height: '24px',
                  background: '#444',
                  borderRadius: '12px',
                  border: '1px solid #666'
                }}></div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(70, 60, 50, 0.8)',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(80, 70, 60, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(70, 60, 50, 0.8)';
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default SettingsModal;
