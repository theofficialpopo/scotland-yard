import { useState } from 'react';

/**
 * AddressInput - Component for entering an address
 *
 * Props:
 * - onGameBoardGenerated: Callback when address is submitted (receives address string)
 */
function AddressInput({ onGameBoardGenerated }) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address.trim()) {
      alert('Please enter an address');
      return;
    }

    // Just pass the address to parent
    if (onGameBoardGenerated) {
      onGameBoardGenerated(address.trim());
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
        Enter any address worldwide to center the map, then adjust the zoom and generate stations.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address (e.g., '10 Downing Street, London')"
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
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'rgba(139, 69, 19, 0.3)',
                color: '#FFD700',
                border: '1px solid #8B4513',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {example.split(',')[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddressInput;
