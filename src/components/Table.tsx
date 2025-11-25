// src/components/Table.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandView } from './HandView';
import { BettingControls } from './BettingControls';
import type { GameState } from '../types';
import { calculateHandValue, calculateWinnings } from '../reducer/gameReducer';
import './Table.css';

type Props = {
  state: GameState;
  onHit: () => void;
  onStand: () => void;
  onNew: () => void;
  onContinue: () => void;
  onBet: (amount: number) => void;
  onStartDeal: () => void;
};

// --- STYLES ---
const typographyStyle: React.CSSProperties = {
  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '24px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  color: '#f0f0f0',
  textShadow: '0 2px 4px rgba(0,0,0,0.6)',
  margin: '0',
  marginBottom: '8px',
  userSelect: 'none',
};

const labelStyle: React.CSSProperties = {
  ...typographyStyle,
  fontSize: '14px',
  color: '#bbb',
  fontWeight: '500',
  marginBottom: '4px',
  letterSpacing: '1px',
  userSelect: 'none',
};

const totalStyle: React.CSSProperties = {
  ...typographyStyle,
  fontSize: '18px',
  color: '#bbb',
  fontWeight: '500',
  letterSpacing: '1px',
  marginBottom: '5px',
  userSelect: 'none',
};

const moneyLineStyle: React.CSSProperties = {
  ...labelStyle,
  color: '#f0f0f0',
  marginTop: '0',
  cursor: 'default',
  userSelect: 'none',
};

// --- HELPERS (Confetti, getGlowAnimation, WinFlash) ---
function Confetti() {
  const pieces = Array.from({ length: 72 });
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
            transition={{ duration: 4.5, delay }}
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

const WinFlash: React.FC = () => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: 0 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 10002,
      pointerEvents: 'none',
    }}
  />
);

type GlowAnimation = { boxShadow: string[]; rotate?: number[] };

const getGlowAnimation = (glow: 'gold' | 'red' | 'rainbow'): GlowAnimation | undefined => {
  switch (glow) {
    case 'gold':
      return {
        boxShadow: [
          '0 0 30px rgba(255,215,0,0.6)',
          '0 0 50px rgba(255,215,0,1)',
          '0 0 30px rgba(255,215,0,0.6)',
        ],
      };
    case 'red':
      return {
        boxShadow: [
          '0 0 30px rgba(255,0,0,0.6)',
          '0 0 50px rgba(255,0,0,1)',
          '0 0 30px rgba(255,0,0,0.6)',
        ],
      };
    case 'rainbow':
      return {
        boxShadow: [
          '0 0 30px rgba(255,100,200,0.7)',
          '0 0 55px rgba(100,200,255,0.95)',
          '0 0 35px rgba(255,200,0,0.9)',
        ],
        rotate: [0, 2, -2, 0],
      };
    default:
      return undefined;
  }
};

// --- MAIN COMPONENT ---
export default function Table({ state, onHit, onStand, onNew, onContinue, onBet, onStartDeal }: Props) {
  const [delayedPlayerTotal, setDelayedPlayerTotal] = useState(0);
  const [delayedDealerTotal, setDelayedDealerTotal] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDelayedPlayerTotal(calculateHandValue(state.player));

      if (state.dealerHidden && state.dealer.length >= 2) {
        setDelayedDealerTotal(calculateHandValue([state.dealer[1]]));
      } else {
        setDelayedDealerTotal(calculateHandValue(state.dealer));
      }
    }, 500);
    return () => clearTimeout(t);
  }, [state.player, state.dealer, state.dealerHidden]);

  const msg = (state.message || '').toLowerCase();
  const playerHasWin = msg.includes('you win') && !msg.includes('dealer has blackjack');
  const playerNatural =
    msg.includes('natural') || (msg.includes('blackjack') && msg.includes('you win'));
  const dealerWins =
    msg.includes('you lose') ||
    msg.includes('dealer has blackjack') ||
    (!msg.includes('you win') && msg.includes('dealer'));

  const showConfetti = (playerHasWin || playerNatural) && state.phase === 'RESULT';
  const showFlash = playerNatural && state.phase === 'BLACKJACK_DELAY';

  let glow: 'none' | 'gold' | 'red' | 'rainbow' = 'none';
  if (playerNatural) glow = 'rainbow';
  else if (playerHasWin) glow = 'gold';
  else if (dealerWins) glow = 'red';

  const glowAnimationProps = glow !== 'none' ? getGlowAnimation(glow) : undefined;

  let statusText = '';
  switch (state.phase) {
    case 'BETTING': statusText = 'Place Your Bet'; break;
    case 'PLAYER_TURN': statusText = 'Your Turn'; break;
    case 'DEALER_TURN': statusText = "Dealer's Turn"; break;
    case 'DEALER_TURN_END': statusText = 'Dealer Finished'; break;
    case 'BLACKJACK_DELAY': statusText = 'Blackjack!'; break;
    case 'BUST_DELAY': statusText = 'Bust!'; break;
    case 'RESULT': statusText = 'Round Over'; break;
    default: statusText = 'Waiting...';
  }

  const getOverlayColor = () => {
    if (dealerWins) return '#8B0000';
    if (playerNatural) return '#7a02cfff';
    return 'black';
  };

  // --- Animation Props for Main Content ---
  let mainContentAnimateProps: any = {};
  let mainContentTransitionProps: any = {};

  if (playerNatural && state.phase === 'BLACKJACK_DELAY') {
    mainContentAnimateProps = { scale: [1, 1.3, 1] };
    mainContentTransitionProps = {
        scale: { duration: 0.5, delay: 1.0 }
    };
  }
  else if (state.phase === 'BUST_DELAY') {
    mainContentAnimateProps = { x: [-6, 6, -6, 6, 0] };
    mainContentTransitionProps = { duration: 0.35 };
  }
  else if (playerHasWin && state.phase === 'RESULT') {
    mainContentAnimateProps = { scale: [1, 1.015, 1] };
    mainContentTransitionProps = { scale: { duration: 0.25 } };
  }

  // Determine if Hit/Stand buttons or Betting controls should be shown
  const showBettingControls = state.phase === 'BETTING';
  const showGameActions = state.phase === 'PLAYER_TURN';
  const showHandViews = state.phase !== 'BETTING'; 

  // Calculate what the player's money will be after payout (for display on Continue button)
  const moneyAfterPayout = state.phase === 'RESULT'
    ? state.playerMoney + calculateWinnings(state)
    : state.playerMoney;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      cursor: 'default',
    }}>
      {/* HANDS CONTAINER: Only manages Dealer/Player layout at top of screen */}
      <motion.div
        animate={mainContentAnimateProps}
        transition={mainContentTransitionProps}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          padding: '20px',
          boxSizing: 'border-box', 
          maxWidth: '700px',
          margin: '0 auto',
          textAlign: 'center',
          justifyContent: 'flex-start',
          opacity: state.phase === 'RESULT' ? 0.4 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <AnimatePresence>
          {showHandViews && (
            <motion.div
              key="dealer-hand"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '50px' }} 
            >
              <div style={typographyStyle}>Dealer</div>
              <div style={totalStyle}>
                Total: {delayedDealerTotal}
              </div>
              <HandView cards={state.dealer} dealerHidden={state.dealerHidden} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showHandViews && (
            <motion.div
              key="player-hand"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div style={{ ...typographyStyle, marginTop: '30px' }}>You</div>
              <div style={totalStyle}>
                Total: {delayedPlayerTotal}
              </div>
              <HandView cards={state.player} dealerHidden={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* --- SECTION 2: BETTING & GAME CONTROLS (ABSOLUTE ELEVATOR) --- */}
      <motion.div 
        initial={false}
        animate={{ 
          y: showHandViews ? '-25vh' : '-50vh' 
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25
        }}
        style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          zIndex: 10,
        }}
      >
          {/* Player Money/Bet Display */}
          <div style={moneyLineStyle}>
            Money: <strong>${state.playerMoney.toFixed(0)}</strong> | Current Bet: <strong>${state.currentBet.toFixed(0)}</strong>
          </div>

          {/* Buttons Area */}
          <div style={{ minHeight: '40px', display: 'flex', justifyContent: 'center' }}>
            {showBettingControls ? (
              <BettingControls
                playerMoney={state.playerMoney}
                currentBet={state.currentBet}
                onBet={onBet}
                onClear={() => onBet(-state.currentBet)}
                onDeal={onStartDeal}
                isReadyToDeal={state.currentBet > 0}
              />
            ) : showGameActions ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
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
            ) : null}
          </div>
      </motion.div>
      
      {/* --- SECTION 3: FIXED STATUS BAR --- */}
      <motion.div
        key="status-bar"
        style={{
          position: 'fixed',
          bottom: '20px', 
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100, 
          textAlign: 'center',
          minHeight: '50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '10px 20px',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <span style={labelStyle}>Current game state:</span>
        <span style={{ ...typographyStyle, color: '#FFD700', fontSize: '22px' }}>
          {statusText}
        </span>
      </motion.div>

      {/* --- SECTION 4: OVERLAYS (Confetti, Flash, Results) --- */}
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
      <AnimatePresence>{showFlash && <WinFlash />}</AnimatePresence>

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
              pointerEvents: 'auto',
            }}
          >
            {/* RESULT OVERLAY (TINT) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: getOverlayColor(),
              }}
            />

            {/* RESULT MESSAGE BOX */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                ...(glowAnimationProps && { ...glowAnimationProps }),
              }}
              transition={{
                type: 'spring',
                stiffness: 160,
                damping: 18,
                boxShadow: { duration: 1.6, repeat: Infinity },
                rotate: { duration: 1.6, repeat: Infinity },
              }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                position: 'relative',
                zIndex: 10000,
                backgroundColor: 'white',
                padding: '28px 36px',
                borderRadius: '10px',
                border: '3px solid #222',
                minWidth: '360px',
                textAlign: 'center',
                overflow: 'visible',
              }}
            >
              <h2
                style={{
                  fontSize: '28px',
                  marginBottom: '24px',
                  color: playerNatural ? '#b8860b' : '#111',
                }}
              >
                {state.message}
              </h2>

              {/* Two Button Options */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexDirection: 'column'
              }}>
                <button
                  onClick={onContinue}
                  className="action-button deal-button"
                  style={{ width: '100%' }}
                >
                  Continue Playing (${moneyAfterPayout.toFixed(0)})
                </button>

                <button
                  onClick={onNew}
                  className="action-button clear-button"
                  style={{ width: '100%' }}
                >
                  Reset Game ($1000)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}