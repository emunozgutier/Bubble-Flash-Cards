import { csvToJson } from './JsonToCsv';
import { saveFile } from './GoogleDriveWriteServices';
import { DEFAULT_DECKS } from '../utils/deckData';

export const findFile = async (filename, parentId = null) => {
    try {
        let query = `name = '${filename}' and trashed = false`;
        if (parentId) {
            query += ` and '${parentId}' in parents`;
        }

        const response = await window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        return response.result.files;
    } catch (err) {
        console.error("Error finding file", err);
        throw err;
    }
};

export const listFiles = async (folderId) => {
    try {
        const query = `'${folderId}' in parents and trashed = false and (mimeType = 'application/json' or mimeType = 'text/csv')`;
        const response = await window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name, size)',
            spaces: 'drive',
        });
        return response.result.files;
    } catch (err) {
        console.error("Error listing files", err);
        throw err;
    }
};

export const loadFile = async (fileId, fileName = '') => {
    let metadata = null;
    if (!fileName) {
        // Fetch metadata to get the name/mimeType if not provided
        const metaResponse = await window.gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType, size'
        });
        metadata = metaResponse.result;
        fileName = metadata.name;
    }

    try {
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });

        let data = response.result;

        // If it's a CSV, convert it
        if (fileName.endsWith('.csv') || (metadata && metadata.mimeType === 'text/csv')) {
            data = { cards: csvToJson(response.body) };
        } else if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                // Not valid JSON
            }
        }

        // --- Empty Deck / Recovery Logic ---
        const deckNameMatch = fileName.match(/HSK[1-5]/);
        const deckName = deckNameMatch ? deckNameMatch[0] : null;

        if (deckName && DEFAULT_DECKS[deckName]) {
            const isEmpty = !data || !data.cards || data.cards.length === 0;

            if (isEmpty) {
                console.warn(`Deck ${fileName} is empty. Loading defaults for ${deckName}`);
                const defaultData = DEFAULT_DECKS[deckName];
                // Save it back to repair the file
                await saveFile(fileName, defaultData, fileId);
                return defaultData;
            }
        }

        return data;
    } catch (err) {
        console.error("Error loading file", err);
        throw err;
    }
};
