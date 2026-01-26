import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from '../config';

let tokenClient;

export const initGapi = () => {
    return new Promise((resolve, reject) => {
        if (window.gapi) {
            // Already loaded, just init client if needed or resolve
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    gapiInited = true;
                    resolve(); // Resolve immediately
                } catch (err) {
                    reject(err);
                }
            });
            return;
        }

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
                    resolve(); // Resolve immediately
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
        if (window.google && window.google.accounts) {
            tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    if (tokenResponse && tokenResponse.access_token) {
                        onTokenCallback(tokenResponse.access_token);
                    }
                },
            });
            console.log("GIS Initialized (cached), tokenClient set.");
            resolve();
            return;
        }

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
            console.log("GIS Initialized, tokenClient set.");
            resolve();
        };
        script.onerror = (err) => {
            console.error("GIS Script failed to load", err);
            reject(err);
        };
        document.body.appendChild(script);
    });
};

export const signIn = () => {
    console.log("Sign In clicked. TokenClient:", tokenClient);
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        console.error("Token client not initialized");
        alert("Google Sign-In not initialized yet. Please refresh or check console.");
    }
};

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
        const query = `'${folderId}' in parents and trashed = false and mimeType = 'application/json'`;
        const response = await window.gapi.client.drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        return response.result.files;
    } catch (err) {
        console.error("Error listing files", err);
        throw err;
    }
};

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
    const fileContent = JSON.stringify(content, null, 2);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
        name: filename,
        mimeType: 'application/json',
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
