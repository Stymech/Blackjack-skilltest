import React from 'react';
import { motion } from 'framer-motion';

interface BettingControlsProps {
  playerMoney: number;
  currentBet: number;
  onBet: (amount: number) => void;
  onClear: () => void;
  onDeal: () => void;
  isReadyToDeal: boolean;
}

const CHIP_VALUES = [5, 25, 100, 500];

export const BettingControls: React.FC<BettingControlsProps> = ({
  playerMoney,
  currentBet,
  onBet,
  onClear,
  onDeal,
  isReadyToDeal,
}) => {
  const canDeal = isReadyToDeal && playerMoney >= 0; // Ensure money check is safe

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      
      {/* 1. Chip Selection Area */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '15px' }}>
        {CHIP_VALUES.map(value => (
          <motion.button
            key={value}
            onClick={() => onBet(value)}
            // Check if betting this amount exceeds player's available funds
            disabled={playerMoney - currentBet < value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: getColorForChip(value),
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '3px solid #f0f0f0',
              cursor: 'pointer',
              opacity: (playerMoney - currentBet < value) ? 0.5 : 1,
              // Disable selection/text cursor
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
            }}
          >
            {value}
          </motion.button>
        ))}
      </div>
      
      {/* 2. Current Bet & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
        
        {/* CLEAR BUTTON */}
        <button 
            onClick={onClear} 
            disabled={currentBet === 0}
            className="action-button clear-button"
        >
            Clear Bet
        </button>

        {/* DEAL BUTTON */}
        <button
          onClick={onDeal}
          disabled={!canDeal}
          className="action-button deal-button"
        >
          Deal
        </button>
      </div>

    </div>
  );
};

// Simple helper to assign chip colors
function getColorForChip(value: number): string {
  if (value === 5) return '#27ae60';
  if (value === 25) return '#2980b9';
  if (value === 100) return '#c0392b';
  if (value === 500) return '#f1c40f';
  return '#ccc';
}