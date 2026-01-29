import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BubbleGame from './BubbleGame';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock stores
const mockNavigateTo = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockNextRound = vi.fn();

vi.mock('../stores/useNavigationStore', () => ({
    default: () => ({
        navigateTo: mockNavigateTo,
    }),
}));

vi.mock('../stores/useDataStore', () => ({
    default: () => ({
        cards: [],
        currentDeckName: 'Test Deck',
    }),
}));

const mockBubbleGameStore = {
    lives: 3,
    cardsLeft: 5,
    currentCard: {
        id: 1,
        displayQuestion: 'Question',
        front: 'Question',
        back: 'Answer',
        chinese: 'Question'
    },
    options: [
        { id: 1, text: 'Option 1', isCorrect: false },
        { id: 2, text: 'Option 2', isCorrect: true },
        { id: 3, text: 'Option 3', isCorrect: false },
    ],
    score: 0,
    gameState: 'playing',
    gameQueue: [{}, {}],
    submitAnswer: mockSubmitAnswer,
    continueGame: vi.fn(),
    nextRound: mockNextRound,
    enableDrawing: false,
    sessionResults: [],
};

vi.mock('../stores/useGameStore', () => ({
    default: vi.fn(() => mockBubbleGameStore),
}));

vi.mock('./submodules1/BubbleGameBubble', () => ({
    default: ({ text, onClick, className }) => (
        <div data-testid="bubble" onClick={onClick} className={className}>
            {text}
        </div>
    )
}));

// Mock submodules
vi.mock('./CharacterDraw', () => ({ default: () => <div data-testid="character-draw" /> }));

describe('BubbleGame', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        vi.mocked(await import('../stores/useGameStore')).default.mockReturnValue(mockBubbleGameStore);
    });

    it('renders game board with bubbles', () => {
        render(<BubbleGame />);
        expect(screen.getByText('Bubble Game - Test Deck')).toBeInTheDocument();
        expect(screen.getByText('Question')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles option click (correct)', () => {
        mockSubmitAnswer.mockReturnValue(true);
        render(<BubbleGame />);

        fireEvent.click(screen.getByText('Option 2'));

        expect(mockSubmitAnswer).toHaveBeenCalledWith(expect.objectContaining({ text: 'Option 2' }));
        // Depending on logic, it might wait for animation before nextRound
    });

    it('handles option click (incorrect)', () => {
        mockSubmitAnswer.mockReturnValue(false);
        render(<BubbleGame />);

        fireEvent.click(screen.getByText('Option 1'));

        expect(mockSubmitAnswer).toHaveBeenCalledWith(expect.objectContaining({ text: 'Option 1' }));
    });

    it('shows summary when game over', async () => {
        vi.mocked(await import('../stores/useGameStore')).default.mockReturnValue({
            ...mockBubbleGameStore,
            gameState: 'game_over'
        });

        render(<BubbleGame />);
        expect(screen.getByText('Bubble Game Summary')).toBeInTheDocument();
    });

    it('redirects if idle', async () => {
        vi.mocked(await import('../stores/useGameStore')).default.mockReturnValue({
            ...mockBubbleGameStore,
            gameState: 'idle'
        });

        render(<BubbleGame />);
        expect(mockNavigateTo).toHaveBeenCalledWith('bubbleSetup');
    });
});
