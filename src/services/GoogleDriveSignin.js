import { CLIENT_ID, API_KEY, SCOPES, DISCOVERY_DOCS } from '../config';

let tokenClient;

export const initGapi = () => {
    return new Promise((resolve, reject) => {
        if (window.gapi) {
            window.gapi.load('client', async () => {
                try {
                    await window.gapi.client.init({
                        apiKey: API_KEY,
                        discoveryDocs: DISCOVERY_DOCS,
                    });
                    resolve();
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
                    resolve();
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
                        onTokenCallback(tokenResponse.access_token, tokenResponse.expires_in);
                    }
                },
            });
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
                        onTokenCallback(tokenResponse.access_token, tokenResponse.expires_in);
                    }
                },
            });
            resolve();
        };
        script.onerror = (err) => {
            reject(err);
        };
        document.body.appendChild(script);
    });
};

export const signIn = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        alert("Google Sign-In not initialized yet. Please refresh or check console.");
    }
};

export const signOut = () => {
    const token = window.gapi?.client?.getToken();
    if (token && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
            console.log('Token revoked');
        });
    }
    if (window.gapi?.client) {
        window.gapi.client.setToken(null);
    }
};
