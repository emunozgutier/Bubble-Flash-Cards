import hsk1Data from '../data/decks/HSK1.json';
import hsk2Data from '../data/decks/HSK2.json';
import hsk3Data from '../data/decks/HSK3.json';
import hsk4Data from '../data/decks/HSK4.json';
import hsk5Data from '../data/decks/HSK5.json';

export { DECK_NAMES } from '../services/GoogleDriveConstants';

export const DEFAULT_DECKS = {
    'HSK1': hsk1Data,
    'HSK2': hsk2Data,
    'HSK3': hsk3Data,
    'HSK4': hsk4Data,
    'HSK5': hsk5Data
};
