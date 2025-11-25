// src/App.tsx
import { useReducer, useEffect } from 'react';
import { gameReducer, initialState } from './reducer/gameReducer';
import Table from './components/Table';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);

  // Start game on mount
  useEffect(() => {
    // Only call NEW_GAME on initial mount to set the shoe and initial money
    if (state.phase === 'IDLE') {
        dispatch({ type: 'NEW_GAME' });
    }
  }, [state.phase]);

  // --- Game Loop Effects ---
  useEffect(() => {
    switch (state.phase) {
      
      // 1. Dealer Drawing
      case 'DEALER_TURN': {
        const t = setTimeout(() => dispatch({ type: 'DEALER_HIT_STEP' }), 800);
        return () => clearTimeout(t);
      }

      // 2. Dealer Finished Drawing -> Evaluate
      case 'DEALER_TURN_END': {
        const t = setTimeout(() => dispatch({ type: 'DEALER_END' }), 800);
        return () => clearTimeout(t);
      }

      // 3. Player Bust -> Wait for card animation, then proceed to result/payout
      case 'BUST_DELAY': {
        const t = setTimeout(() => dispatch({ type: 'PLAYER_BUST_END' }), 800);
        return () => clearTimeout(t);
      }

      // 4. Instant Blackjack Detected
      case 'BLACKJACK_DELAY': {
        // Step A: If dealer is still hidden, reveal it after 800ms to start animation
        if (state.dealerHidden) {
           const t = setTimeout(() => {
               dispatch({ type: 'REVEAL_DEALER' });
           }, 800);
           return () => clearTimeout(t);
        }
        // Step B: Wait for the reveal animation to finish, then go to Result Modal/Payout
        else {
          const t = setTimeout(() => dispatch({ type: 'GAME_DELAY_END' }), 1400); 
          return () => clearTimeout(t);
        }
      }

    }
  }, [state.phase, state.dealerHidden, state.dealer]);

  // --- Prop Handlers ---
  const handleBet = (amount: number) => dispatch({ type: 'PLACE_BET', amount });
  const handleStartDeal = () => dispatch({ type: 'START_DEAL' });
  const handleHit = () => dispatch({ type: 'PLAYER_HIT' });
  const handleStand = () => dispatch({ type: 'PLAYER_STAND' });
  const handleNew = () => dispatch({ type: 'NEW_GAME' }); // Reset to $1000
  const handleContinue = () => dispatch({ type: 'PAYOUT' }); // Continue with current money

  return (
    <Table
      state={state}
      onHit={handleHit}
      onStand={handleStand}
      onNew={handleNew}
      onContinue={handleContinue}
      onBet={handleBet}
      onStartDeal={handleStartDeal}
    />
  );
}