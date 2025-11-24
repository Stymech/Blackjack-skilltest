// src/types.ts

export type Suit = '♠' | '♥' | '♦' | '♣';

export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6'
  | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type Hand = Card[];

export type Phase =
  | 'IDLE'
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
};

export type Action =
  | { type: 'NEW_GAME'; decks?: number }
  | { type: 'PLAYER_HIT' }
  | { type: 'PLAYER_STAND' }
  | { type: 'DEALER_HIT_STEP' }
  | { type: 'DEALER_END' }
  | { type: 'PLAYER_BUST_END' }
  | { type: 'PLAYER_BLACKJACK_END' };
