import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import HandsFreeGame from './HandsFreeGame';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock stores
const mockNavigateTo = vi.fn();
const mockMarkCorrect = vi.fn();
const mockMarkIncorrect = vi.fn();

vi.mock('../../stores/useNavigationStore', () => ({
    default: () => ({
        navigateTo: mockNavigateTo,
    }),
}));

// Mock Audio Manager and Keyboard Manager
vi.mock('../../utils/AudioManager', () => ({
    SILENT_MP3: 'silent.mp3',
    speak: vi.fn(),
    initMediaSession: vi.fn(() => vi.fn()), // Returns cleanup function
    updateMediaMetadata: vi.fn(),
}));

vi.mock('../../utils/KeyboardManager', () => ({
    setupKeyboardListeners: vi.fn(() => vi.fn()), // Returns cleanup function
}));

// Mock useGameStore
const mockGameStore = {
    gameState: 'playing',
    lives: 3,
    score: 0,
    cardsLeft: 5,
    currentCard: {
        id: 1,
        displayQuestion: 'Question 1',
        displayAnswer: 'Answer 1',
    },
    markCorrect: mockMarkCorrect,
    markIncorrect: mockMarkIncorrect,
    practiceMode: false,
    sessionResults: [],
};

vi.mock('../../stores/useGameStore', () => ({
    default: vi.fn(() => mockGameStore),
}));

describe('HandsFreeGame', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        // Default mocks
        vi.mocked(await import('../../stores/useGameStore')).default.mockReturnValue(mockGameStore);

        // Mock SpeechSynthesis
        window.speechSynthesis = {
            cancel: vi.fn(),
            speak: vi.fn(),
        };
        window.SpeechSynthesisUtterance = vi.fn();

        // Mock Audio
        window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
        window.HTMLMediaElement.prototype.pause = vi.fn();
    });

    it('renders start screen when game not started', () => {
        // HandsFreeGame renders start screen initially because gameStarted local state is false
        render(<HandsFreeGame />);
        expect(screen.getByText('Hands Free - Ready?')).toBeInTheDocument();
        expect(screen.getByText('START GAME')).toBeInTheDocument();
    });

    it('starts game and shows question', async () => {
        render(<HandsFreeGame />);

        const startButton = screen.getByText('START GAME');
        await act(async () => {
            fireEvent.click(startButton);
        });

        expect(screen.getByText('Question 1')).toBeInTheDocument();
        // Answer should be hidden initially
        expect(screen.getByText('Answer 1')).toHaveClass('hidden');
    });

    it('shows answer after delay', async () => {
        vi.useFakeTimers();
        render(<HandsFreeGame />);

        await act(async () => {
            fireEvent.click(screen.getByText('START GAME'));
        });

        expect(screen.getByText('Answer 1')).toHaveClass('hidden');

        act(() => {
            vi.runAllTimers();
        });

        expect(screen.getByText('Answer 1')).toHaveClass('visible');
        vi.useRealTimers();
    });

    it('handles Correct action via button', async () => {
        render(<HandsFreeGame />);
        await act(async () => {
            fireEvent.click(screen.getByText('START GAME'));
        });

        const correctButton = screen.getByText(/Next \/ Correct/i);
        fireEvent.click(correctButton);

        expect(mockMarkCorrect).toHaveBeenCalled();
    });

    it('handles Incorrect action via button', async () => {
        render(<HandsFreeGame />);
        await act(async () => {
            fireEvent.click(screen.getByText('START GAME'));
        });

        const incorrectButton = screen.getByText(/Skip \/ Wrong/i);
        fireEvent.click(incorrectButton);

        expect(mockMarkIncorrect).toHaveBeenCalled();
    });

    it('shows game summary when game is over (won or game_over)', async () => {
        // Override store for this test
        vi.mocked(await import('../../stores/useGameStore')).default.mockReturnValue({
            ...mockGameStore,
            gameState: 'won'
        });

        render(<HandsFreeGame />);
        expect(screen.getByText('Hands Free Summary')).toBeInTheDocument();
    });
});
