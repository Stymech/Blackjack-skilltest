// src/App.tsx
import { useReducer, useEffect } from 'react';
import { gameReducer, initialState } from './reducer/gameReducer';
import Table from './components/Table';
import { calculateHandValue } from './reducer/gameReducer';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, initialState);

  useEffect(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  function isBlackjackHand(cards: any[]) {
    return cards.length === 2 && calculateHandValue(cards) === 21;
  }

  useEffect(() => {
    if (state.phase === 'DEALER_TURN') {
      const t = setTimeout(() => dispatch({ type: 'DEALER_HIT_STEP' }), 500);
      return () => clearTimeout(t);
    }

    if (state.phase === 'DEALER_TURN_END') {
      const t = setTimeout(() => dispatch({ type: 'DEALER_END' }), 800);
      return () => clearTimeout(t);
    }

    if (state.phase === 'BUST_DELAY') {
      // ensure final card animation plays, then finalize bust
      const t = setTimeout(() => dispatch({ type: 'PLAYER_BUST_END' }), 700);
      return () => clearTimeout(t);
    }

    if (state.phase === 'BLACKJACK_DELAY') {
      const t = setTimeout(() => {
        // if player has natural blackjack and dealer does not -> finalize as player blackjack
        if (isBlackjackHand(state.player) && !isBlackjackHand(state.dealer)) {
          dispatch({ type: 'PLAYER_BLACKJACK_END' });
        } else {
          // otherwise evaluate normally (dealer may also have blackjack)
          dispatch({ type: 'DEALER_END' });
        }
      }, 700);
      return () => clearTimeout(t);
    }
  }, [state.phase, state.dealer, state.player]);

  return (
    <Table
      state={state}
      onHit={() => dispatch({ type: 'PLAYER_HIT' })}
      onStand={() => dispatch({ type: 'PLAYER_STAND' })}
      onNew={() => dispatch({ type: 'NEW_GAME' })}
    />
  );
}