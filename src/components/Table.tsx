// src/components/Table.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HandView from './HandView';
import type { GameState } from '../types';
import { calculateHandValue } from '../reducer/gameReducer';

// 1. IMPORT THE NEW CSS FILE HERE
import './Table.css'; 

type Props = {
  state: GameState;
  onHit: () => void;
  onStand: () => void;
  onNew: () => void;
};

// Light confetti, no pointer events (player-only wins)
function Confetti() {
  const pieces = Array.from({ length: 24 });
  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        inset: 0,
        zIndex: 10001,
        overflow: 'hidden',
      }}
    >
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const size = 6 + Math.random() * 10;
        const bg = ['#ffd700', '#ff6b6b', '#6bffb1', '#6bb0ff'][i % 4];
        return (
          <motion.div
            key={i}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 800, opacity: 1, rotate: Math.random() * 360 }}
            transition={{ duration: 2.2, delay }}
            style={{
              position: 'absolute',
              left: `${left}%`,
              width: size,
              height: size * 0.6,
              background: bg,
              borderRadius: 2,
            }}
          />
        );
      })}
    </div>
  );
}

export default function Table({ state, onHit, onStand, onNew }: Props) {
  const [delayedPlayerTotal, setDelayedPlayerTotal] = useState(0);
  const [delayedDealerTotal, setDelayedDealerTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDelayedPlayerTotal(calculateHandValue(state.player));
      if (!state.dealerHidden) {
        setDelayedDealerTotal(calculateHandValue(state.dealer));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [state.player, state.dealer, state.dealerHidden]);

  const msg = (state.message || '').toLowerCase();
  const playerHasWin = msg.includes('you win') && !msg.includes('dealer has blackjack');
  const playerNatural = msg.includes('natural') || (msg.includes('blackjack') && msg.includes('you win'));
  const dealerWins = msg.includes('you lose') || msg.includes('dealer has blackjack') || (!msg.includes('you win') && msg.includes('dealer'));

  // Confetti only for player wins (including natural), NOT for dealer blackjack
  const showConfetti = playerHasWin || playerNatural;

  // Determine glow style: 'none' | 'gold' | 'rainbow' | 'black'
  let glow: 'none' | 'gold' | 'rainbow' | 'black' = 'none';
  if (playerNatural) glow = 'rainbow';
  else if (playerHasWin) glow = 'gold';
  else if (dealerWins) glow = 'black';

  // overlay content style will be pointer-events enabled; glow layers will be pointer-events none
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.div
          // Removed the bust shake animation here, as it shakes the whole table unnecessarily.
          // If you want the shake, keep the animate/transition properties, but the jump fix is below.
          style={{
            opacity: state.phase === 'RESULT' ? 0.4 : 1, 
            transition: 'opacity 0.4s ease',
          }}
        >
          <h2>Dealer</h2>
          <div style={{ fontSize: '18px', marginBottom: '5px' }}>
            {state.dealerHidden ? 'Total: ?' : 'Total: ' + delayedDealerTotal}
          </div>
          <HandView cards={state.dealer} hideFirst={state.dealerHidden} />

          <h2>You</h2>
          <div style={{ fontSize: '18px', marginBottom: '5px' }}>
            Total: {delayedPlayerTotal}
          </div>
          <HandView cards={state.player} />
        

          <div style={{ marginTop: '10px', fontSize: '18px', color: 'white', minHeight: '20px' }}> {/* ADDED minHeight to prevent collapse */}
            {state.phase === 'PLAYER_TURN' && 'Your turn'}
            {state.phase === 'DEALER_TURN' && "Dealer's turn"}
            {state.phase === 'DEALER_TURN_END' && 'Dealer finished'}
            {state.phase === 'BLACKJACK_DELAY' && 'Blackjack!'}
            {state.phase === 'RESULT' && 'Round Over'}
          </div>

        </motion.div> {/* <--- THIS CLOSING TAG IS MOVED DOWN to wrap the status message */}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {/* Buttons are now outside the fading/shaking div, keeping their position stable */}
          <button
            onClick={onHit} 
            disabled={state.phase !== 'PLAYER_TURN'}
            className="action-button hit-button"
          >
            Hit
          </button>
          <button 
            onClick={onStand} 
            disabled={state.phase !== 'PLAYER_TURN'}
            className="action-button stand-button"
          >
            Stand
          </button>
        </div>
      </div>
      {/* confetti for player wins only */}
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      {/* RESULT overlay */}
      <AnimatePresence>
        {state.phase === 'RESULT' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999,
              // overlay should capture clicks so underlying UI is inert
              pointerEvents: 'auto',
            }}
          >
            {/* dim background - captures clicks */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
              }}
            />

            {/* glow layer (purely visual) - pointerEvents none */}
            {glow !== 'none' && (
              <motion.div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: -14,
                  borderRadius: 18,
                  pointerEvents: 'none',
                  zIndex: 9998,
                }}
                animate={
                  glow === 'gold'
                    ? { boxShadow: ['0 0 8px rgba(255,200,0,0.6)', '0 0 18px rgba(255,200,0,0.95)', '0 0 8px rgba(255,200,0,0.6)'] }
                    : glow === 'rainbow'
                    ? {
                        boxShadow: [
                          '0 0 12px rgba(255,100,200,0.6)',
                          '0 0 40px rgba(100,200,255,0.95)',
                          '0 0 18px rgba(255,200,0,0.9)',
                        ],
                        rotate: [0, 2, -2, 0],
                      }
                    : {
                        // black pulsing evil vibe
                        boxShadow: ['0 0 6px rgba(0,0,0,0.6)', '0 0 18px rgba(0,0,0,0.95)', '0 0 6px rgba(0,0,0,0.6)'],
                      }
                }
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            )}

            {/* modal content - pointerEvents auto so clickable */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18 }}
              style={{
                position: 'relative',
                zIndex: 10000,
                backgroundColor: 'white',
                padding: '28px 36px',
                borderRadius: '10px',
                border: '3px solid #222',
                minWidth: '320px',
                textAlign: 'center',
                pointerEvents: 'auto', // ensure button clickable
              }}
            >
              <h2
                style={{
                  fontSize: '28px',
                  marginBottom: '18px',
                  color: playerNatural ? '#b8860b' : '#111',
                }}
              >
                {state.message}
              </h2>

              {/* NEW GAME BUTTON - uses external CSS classes */}
              <button
                onClick={onNew}
                className="new-game-button"
              >
                New Game
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}