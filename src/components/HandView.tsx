// src/components/HandView.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { Hand } from '../types';
import CardView from './CardView'; 

interface HandViewProps {
  cards: Hand;
  dealerHidden: boolean; 
}

export const HandView: React.FC<HandViewProps> = ({ cards, dealerHidden }) => {
  return (
    <motion.div
      layout
      style={{ 
        display: 'flex', 
        gap: '18px', 
        justifyContent: 'center',
        perspective: '1000px', 
      }}
    > 
      {cards.map((card, index) => {
        const isHidden = dealerHidden && index === 0; 
        
        return (
          <CardView 
            key={card.id} 
            card={card} 
            index={index}
            hidden={isHidden} 
          />
        );
      })}
    </motion.div>
  );
};