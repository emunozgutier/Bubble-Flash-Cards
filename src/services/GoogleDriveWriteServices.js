import { jsonToCsv } from './JsonToCsv';

export const createFolder = async (name, parentId = null) => {
    const metadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
        metadata.parents = [parentId];
    }

    const accessToken = window.gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form
        });
        return await response.json();
    } catch (err) {
        console.error("Error creating folder", err);
        throw err;
    }
};

export const saveFile = async (filename, content, fileId = null, parentId = null) => {
    let finalContent = content;
    let mimeType = 'application/json';
    let finalFileName = filename;

    // Convert to CSV if it's a deck
    if (content && (content.cards || Array.isArray(content))) {
        const cards = Array.isArray(content) ? content : content.cards;
        finalContent = jsonToCsv(cards);
        mimeType = 'text/csv';
        // Ensure extension is .csv
        if (finalFileName.endsWith('.json')) {
            finalFileName = finalFileName.replace('.json', '.csv');
        } else if (!finalFileName.endsWith('.csv')) {
            finalFileName += '.csv';
        }
    }

    const fileContent = typeof finalContent === 'string' ? finalContent : JSON.stringify(finalContent, null, 2);
    const file = new Blob([fileContent], { type: mimeType });
    const metadata = {
        name: finalFileName,
        mimeType: mimeType,
    };
    if (parentId) {
        metadata.parents = [parentId];
    }

    const accessToken = window.gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    try {
        let response;
        if (fileId) {
            // Update existing file
            response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
                method: 'PATCH',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form
            });
        } else {
            // Create new file
            response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
                body: form
            });
        }
        return await response.json();
    } catch (err) {
        console.error("Error saving file", err);
        throw err;
    }
};

export const deleteFile = async (fileId) => {
    const accessToken = window.gapi.auth.getToken().access_token;
    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error.message || 'Failed to delete file');
        }
        return true;
    } catch (err) {
        console.error("Error deleting file", err);
        throw err;
    }
};
