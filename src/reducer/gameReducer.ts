// src/reducer/gameReducer.ts
import type { GameState, Card, Action } from '../types';
import { createShoe, draw } from '../utils/deck';

// ---------- Scoring Helpers ----------
function handValue(hand: Card[]) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      total += 1;
    } else if (['J', 'Q', 'K'].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }

  while (aces > 0 && total + 10 <= 21) {
    total += 10;
    aces--;
  }

  return total;
}

export function calculateHandValue(cards: Card[]) {
  return handValue(cards);
}

function isBlackjack(hand: Card[]) {
  return hand.length === 2 && handValue(hand) === 21;
}

function isBust(hand: Card[]) {
  return handValue(hand) > 21;
}

// ---------- Initial State ----------
export function initialState(): GameState {
  const decks = 4;
  const shoe = createShoe(decks);

  return {
    shoe,
    player: [],
    dealer: [],
    phase: 'IDLE',
    message: undefined,
    dealerHidden: true,
    decks,
  };
}

// ---------- Reducer ----------
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    // NEW GAME
    case 'NEW_GAME': {
      const decks = action.decks ?? state.decks;
      const shoe = createShoe(decks);

      const { drawn: playerCards, shoe: s1 } = draw(shoe, 2);
      const { drawn: dealerCards, shoe: s2 } = draw(s1, 2);

      const next: GameState = {
        ...state,
        shoe: s2,
        player: playerCards,
        dealer: dealerCards,
        phase: 'PLAYER_TURN',
        message: undefined,
        dealerHidden: true,
        decks,
      };

      // Instant blackjack -> delay and set message (no "Natural" word)
      if (isBlackjack(playerCards) || isBlackjack(dealerCards)) {
        next.phase = 'BLACKJACK_DELAY';
        next.dealerHidden = false;
        if (isBlackjack(playerCards) && !isBlackjack(dealerCards)) {
          next.message = 'Blackjack! You win 3:2';
        } else if (!isBlackjack(playerCards) && isBlackjack(dealerCards)) {
          next.message = 'Dealer has Blackjack. You lose.';
        } else {
          next.message = 'Both have Blackjack — Push.';
        }
      }

      return next;
    }

    // PLAYER HIT
    case 'PLAYER_HIT': {
      if (state.phase !== 'PLAYER_TURN') return state;

      const { drawn, shoe } = draw(state.shoe, 1);
      const player = [...state.player, ...drawn];

      if (isBust(player)) {
        // go to BUST_DELAY so last card animation can finish BEFORE showing overlay
        return {
          ...state,
          shoe,
          player,
          phase: 'BUST_DELAY',
          dealerHidden: false,
          message: `Bust! You lose (value ${handValue(player)}).`,
        };
      }

      return { ...state, shoe, player };
    }

    // PLAYER STAND
    case 'PLAYER_STAND': {
      if (state.phase !== 'PLAYER_TURN') return state;

      return {
        ...state,
        phase: 'DEALER_TURN',
        dealerHidden: false,
      };
    }

    // DEALER_HIT_STEP - draw exactly one card for dealer
    case 'DEALER_HIT_STEP': {
      if (state.phase !== 'DEALER_TURN') return state;

      let dealer = [...state.dealer];
      let shoe = [...state.shoe];

      if (handValue(dealer) >= 17) {
        return { ...state, phase: 'DEALER_TURN_END' };
      }

      const { drawn, shoe: newShoe } = draw(shoe, 1);
      dealer = [...dealer, ...drawn];
      return { ...state, dealer, shoe: newShoe };
    }

    // DEALER_END -> evaluate result after dealer finishes hitting
    case 'DEALER_END': {
      const playerVal = handValue(state.player);
      const dealerVal = handValue(state.dealer);

      let message = '';

      if (dealerVal > 21) {
        message = `Dealer busts (${dealerVal}). You win!`;
      } else if (dealerVal > playerVal) {
        message = `Dealer ${dealerVal} beats your ${playerVal}. You lose.`;
      } else if (dealerVal < playerVal) {
        message = `You win! Dealer ${dealerVal} vs your ${playerVal}.`;
      } else {
        message = `Push — both ${playerVal}.`;
      }

      return {
        ...state,
        phase: 'RESULT',
        dealerHidden: false,
        message,
      };
    }

    // PLAYER_BUST_END -> finalize bust WITHOUT re-evaluating
    case 'PLAYER_BUST_END': {
      return {
        ...state,
        phase: 'RESULT',
        dealerHidden: false,
        message: state.message,
      };
    }

    // PLAYER_BLACKJACK_END -> finalize player's blackjack win (no re-eval)
    case 'PLAYER_BLACKJACK_END': {
      return {
        ...state,
        phase: 'RESULT',
        dealerHidden: false,
        message: state.message,
      };
    }

    default:
      return state;
  }
}
