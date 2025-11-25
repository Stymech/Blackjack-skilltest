// src/types.ts

// Revised Suit type to use file name letters
export type Suit = 'S' | 'H' | 'D' | 'C'; // Spades, Hearts, Diamonds, Clubs
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type Card = { 
  id: string; 
  suit: Suit; 
  rank: Rank; 
};
export type Hand = Card[];

export type Phase =
  | 'IDLE'
  | 'BETTING'
  | 'PLAYER_TURN'
  | 'DEALER_TURN'
  | 'DEALER_TURN_END'
  | 'BLACKJACK_DELAY'
  | 'BUST_DELAY'
  | 'RESULT';

export type GameState = {
  shoe: Card[];
  player: Hand;
  dealer: Hand;
  phase: Phase;
  message?: string;
  dealerHidden: boolean;
  decks: number;
  playerMoney: number;    // Player's total chip stack
  currentBet: number;     // Amount currently wagered
};

export type Action =
  | { type: 'NEW_GAME'; decks?: number }
  | { type: 'PLACE_BET'; amount: number } // <-- NEW Action
  | { type: 'START_DEAL' }                // <-- NEW Action to start dealing after bet
  | { type: 'PLAYER_HIT' }
  | { type: 'PLAYER_STAND' }
  | { type: 'DEALER_HIT_STEP' }
  | { type: 'DEALER_END' }
  | { type: 'REVEAL_DEALER' }
  | { type: 'PLAYER_BUST_END' }
  | { type: 'GAME_DELAY_END' }
  | { type: 'PAYOUT' };