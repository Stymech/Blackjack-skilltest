import type { GameState, Card, Action } from '../types';
import { createShoe, draw } from '../utils/deck';

// --- Helpers ---
export function calculateHandValue(hand: Card[]) {
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

const isBlackjack = (h: Card[]) => h.length === 2 && calculateHandValue(h) === 21;
const isBust = (h: Card[]) => calculateHandValue(h) > 21;

// --- Initial State ---
export const initialState = (): GameState => ({
    shoe: createShoe(4),
    player: [],
    dealer: [],
    phase: 'BETTING',
    message: 'Place your bet to start!',
    dealerHidden: true,
    decks: 4,
    playerMoney: 1000,
    currentBet: 0,
});

// Helper function to determine the final result and payout type
const determineResult = (state: GameState) => {
    const pVal = calculateHandValue(state.player);
    const dVal = calculateHandValue(state.dealer);
    const playerBJ = isBlackjack(state.player);
    const dealerBJ = isBlackjack(state.dealer);

    if (playerBJ && !dealerBJ) return 'BLACKJACK';
    if (dealerBJ && !playerBJ) return 'LOSS';
    if (playerBJ && dealerBJ) return 'PUSH';

    if (isBust(state.player)) return 'LOSS'; 
    if (isBust(state.dealer)) return 'WIN'; // Dealer Bust = Player WIN
    
    if (pVal > dVal) return 'WIN';
    if (pVal < dVal) return 'LOSS';
    return 'PUSH';
};

// Helper function to calculate winnings
export function calculateWinnings(state: GameState): number {
    const resultType = determineResult(state);
    
    switch (resultType) {
        case 'BLACKJACK':
            return Math.floor(state.currentBet * 2.5); // 1.5x profit + original bet
        case 'WIN':
            return state.currentBet * 2; // 1x profit + original bet
        case 'PUSH':
            return state.currentBet; // Return original bet
        case 'LOSS':
            return 0; // No return
        default:
            return 0;
    }
}

// --- Reducer ---
export function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        
        case 'PLACE_BET': {
            if (state.phase !== 'BETTING' || typeof action.amount !== 'number') return state;

            const newBet = state.currentBet + action.amount;
            
            if (newBet < 0 || newBet > state.playerMoney) return state; 

            return { 
                ...state, 
                currentBet: newBet, 
                message: newBet > 0 ? undefined : 'Place your bet to start!',
            };
        }

        case 'START_DEAL': {
            if (state.phase !== 'BETTING' || state.currentBet <= 0) return state;

            const { shoe } = state;
            
            // Deduct the bet now
            const playerMoney = state.playerMoney - state.currentBet;
            
            const { drawn: player, shoe: s1 } = draw(shoe, 2);
            const { drawn: dealer, shoe: s2 } = draw(s1, 2);

            const next: GameState = {
                ...state,
                shoe: s2,
                player,
                dealer,
                phase: 'PLAYER_TURN', 
                message: undefined,
                dealerHidden: true,
                playerMoney,
            };

            // Check Instant Blackjack
            const playerBJ = isBlackjack(player);
            const dealerBJ = isBlackjack(dealer);

            if (playerBJ || dealerBJ) {
                next.phase = 'BLACKJACK_DELAY'; 
                if (playerBJ && !dealerBJ) next.message = 'Blackjack! You win!';
                else if (!playerBJ && dealerBJ) next.message = 'Dealer has Blackjack! You lose.';
                else next.message = 'Both have Blackjack — Push.';
            }

            return next;
        }

        case 'PAYOUT': {
            if (state.phase !== 'RESULT') return state;
            
            const resultType = determineResult(state);
            const winnings = calculateWinnings(state);
            let message = '';
            
            switch (resultType) {
                case 'BLACKJACK':
                    message = state.message || `Blackjack! You won $${Math.floor(state.currentBet * 1.5)}.`;
                    break;
                case 'WIN':
                    message = state.message || `You win! You won $${state.currentBet}.`;
                    break;
                case 'PUSH':
                    message = state.message || 'Push. Bet returned.';
                    break;
                case 'LOSS':
                    message = state.message || 'You lost your bet.';
                    break;
            }

            return { 
                ...state, 
                playerMoney: state.playerMoney + winnings, 
                currentBet: 0,
                player: [], 
                dealer: [],
                phase: 'BETTING', 
                message: message,
                dealerHidden: true,
            };
        }

        case 'NEW_GAME': {
            // This is a complete reset, not preserving any state
            return {
                ...initialState(),
                decks: action.decks ?? state.decks,
                shoe: action.decks && action.decks !== state.decks ? createShoe(action.decks) : createShoe(state.decks),
            };
        }

        case 'PLAYER_HIT': {
            if (state.phase !== 'PLAYER_TURN') return state;
            const { drawn, shoe } = draw(state.shoe, 1);
            const player = [...state.player, ...drawn];

            if (isBust(player)) {
                return {
                    ...state, shoe, player,
                    phase: 'BUST_DELAY',
                    dealerHidden: false,
                    message: `Bust! You lose (${calculateHandValue(player)}).`,
                };
            }
            return { ...state, shoe, player };
        }

        case 'PLAYER_STAND':
            return { ...state, phase: 'DEALER_TURN', dealerHidden: false };

        case 'DEALER_HIT_STEP': {
            if (state.phase !== 'DEALER_TURN') return state;
            const val = calculateHandValue(state.dealer);
            
            // Dealer must hit on 16 or less, stand on 17 or more (soft or hard)
            if (val >= 17) {
                return { ...state, phase: 'DEALER_TURN_END' };
            }
            
            const { drawn, shoe } = draw(state.shoe, 1);
            const dealer = [...state.dealer, ...drawn];

            // Check if dealer busted immediately after the hit
            if (isBust(dealer)) {
                return {
                    ...state, shoe, dealer,
                    phase: 'RESULT',
                    message: `Dealer Bust! (${calculateHandValue(dealer)}). You win!`,
                };
            }

            return { ...state, shoe, dealer };
        }

        case 'REVEAL_DEALER':
            return { ...state, dealerHidden: false };

        case 'DEALER_END': {
            // This is only reached if the dealer stopped drawing (>= 17 and not bust)
            const resultType = determineResult(state);
            let message = '';
            
            switch (resultType) {
                case 'WIN':
                    message = `You win! Dealer ${calculateHandValue(state.dealer)} vs your ${calculateHandValue(state.player)}.`;
                    break;
                case 'LOSS':
                    message = `Dealer ${calculateHandValue(state.dealer)} beats your ${calculateHandValue(state.player)}. You lose.`;
                    break;
                case 'PUSH':
                    message = `Push — both ${calculateHandValue(state.player)}.`;
                    break;
                // 'BLACKJACK' and 'LOSS' from player bust were handled earlier.
                // Dealer bust is handled in DEALER_HIT_STEP now.
                default:
                    message = state.message || 'Round Over.';
            }

            return { ...state, phase: 'RESULT', message };
        }

        case 'PLAYER_BUST_END':
        case 'GAME_DELAY_END':
            return { ...state, phase: 'RESULT', dealerHidden: false };

        default:
            return state;
    }
}