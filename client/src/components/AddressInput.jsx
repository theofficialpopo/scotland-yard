import { useState } from 'react';
import { generateGameBoard, validateGameBoard } from '../services/stationGenerator';

/**
 * AddressInput - Component for entering an address and generating a game board
 *
 * Props:
 * - onGameBoardGenerated: Callback when game board is successfully generated
 */
function AddressInput({ onGameBoardGenerated }) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validation, setValidation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);
    setValidation(null);

    try {
      console.log('Generating game board for:', address);

      // Generate the game board
      const gameBoard = await generateGameBoard(address);

      // Validate it
      const validationResult = validateGameBoard(gameBoard);
      setValidation(validationResult);

      // Call parent callback
      if (onGameBoardGenerated) {
        onGameBoardGenerated(gameBoard);
      }

    } catch (err) {
      console.error('Failed to generate game board:', err);
      setError(err.message || 'Failed to generate game board');
    } finally {
      setLoading(false);
    }
  };

  const handleTryExample = (exampleAddress) => {
    setAddress(exampleAddress);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '30px',
      background: 'rgba(30, 25, 20, 0.95)',
      borderRadius: '12px',
      border: '2px solid #8B4513',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
    }}>
      <h2 style={{
        color: '#FFD700',
        marginBottom: '10px',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Generate Game Board
      </h2>

      <p style={{
        color: '#ccc',
        marginBottom: '25px',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        Enter any address worldwide. The system will automatically find intersections
        and place stations for a Scotland Yard game.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address (e.g., '10 Downing Street, London')"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #8B4513',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#f5f5f5',
            marginBottom: '15px',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: loading ? '#555' : '#FFD700',
            color: loading ? '#999' : '#1e1914',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Generating...' : 'Generate Game Board'}
        </button>
      </form>

      {/* Example addresses */}
      <div style={{ marginTop: '20px' }}>
        <p style={{ color: '#999', fontSize: '12px', marginBottom: '8px' }}>
          Try these examples:
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            '10 Downing Street, London',
            '1600 Amphitheatre Parkway, Mountain View, CA',
            'Times Square, New York',
            'Shibuya Crossing, Tokyo'
          ].map((example) => (
            <button
              key={example}
              onClick={() => handleTryExample(example)}
              disabled={loading}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'rgba(139, 69, 19, 0.3)',
                color: '#FFD700',
                border: '1px solid #8B4513',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {example.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(220, 53, 69, 0.2)',
          border: '1px solid #dc3545',
          borderRadius: '6px',
          color: '#ff6b7a'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Validation warnings */}
      {validation && validation.warnings.length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(255, 193, 7, 0.2)',
          border: '1px solid #ffc107',
          borderRadius: '6px',
          color: '#ffc107'
        }}>
          <strong>Warnings:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            {validation.warnings.map((warning, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success stats */}
      {validation && validation.valid && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(40, 167, 69, 0.2)',
          border: '1px solid #28a745',
          borderRadius: '6px',
          color: '#28a745'
        }}>
          <strong>Success!</strong> Generated {validation.stats.stationCount} stations.
          <br />
          <span style={{ fontSize: '12px' }}>
            Avg distance: {validation.stats.avgStationDistance}m •
            Min distance: {validation.stats.minStationDistance}m
          </span>
        </div>
      )}
    </div>
  );
}

export default AddressInput;
