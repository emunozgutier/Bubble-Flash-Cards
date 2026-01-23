import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from '../config';

let tokenClient;
let gapiInited = false;
let gisInited = false;

export const initGapi = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    gapiInited = true;
                    if (gisInited) resolve();
                } catch (err) {
                    reject(err);
                }
            });
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

export const initGis = (onTokenCallback) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        onTokenCallback(tokenResponse.access_token);
                    }
                },
            });
            gisInited = true;
            if (gapiInited) resolve();
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });
};

export const signIn = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error("Token client not initialized");
    }
};

export const findFile = async (filename) => {
    try {
        const response = await window.gapi.client.drive.files.list({
            q: `name = '${filename}' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        return response.result.files;
    } catch (err) {
        console.error("Error finding file", err);
        throw err;
    }
};

export const saveFile = async (filename, content, fileId = null) => {
    const fileContent = JSON.stringify(content, null, 2);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
        name: filename,
        mimeType: 'application/json',
    };

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

export const loadFile = async (fileId) => {
    try {
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            alt: 'media',
        });
        return response.result;
    } catch (err) {
        console.error("Error loading file", err);
        throw err;
    }
};
