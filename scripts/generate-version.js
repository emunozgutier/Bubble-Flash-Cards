import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../src/version.json');
const repo = 'emunozgutier/Bubble-Flash-Cards';
const branch = 'gh-pages';
const url = `https://api.github.com/repos/${repo}/commits/${branch}`;

console.log(`Fetching version info from ${url}...`);

const options = {
    headers: {
        'User-Agent': 'node.js-script'
    }
};

https.get(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200) {
            try {
                const commit = JSON.parse(data);

                // Parse the message to get title (first line) and body (rest)
                const fullMessage = commit.commit.message;
                const messageLines = fullMessage.split('\n');
                const title = messageLines[0];
                const messageBody = messageLines.slice(1).join('\n').trim();

                const versionInfo = {
                    hash: commit.sha.substring(0, 7), // Short hash
                    date: commit.commit.committer.date,
                    title: title,
                    message: messageBody,
                    source: 'GitHub API (gh-pages)'
                };

                fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
                console.log('version.json generated successfully from GitHub API.');
                console.log(versionInfo);
            } catch (e) {
                console.error('Error parsing GitHub response:', e);
                // Don't overwrite if parsing fails, might be rate limit message
            }
        } else {
            console.error(`Failed to fetch from GitHub. Status Code: ${res.statusCode}`);
            console.error('Response:', data);

            // Fallback to local file if it exists, roughly speaking, or just leave it
            if (!fs.existsSync(outputPath)) {
                const fallbackInfo = {
                    hash: 'offline',
                    date: new Date().toString(),
                    title: 'Offline Build',
                    message: 'Could not fetch version from GitHub.',
                    source: 'Offline'
                };
                fs.writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2));
            }
        }
    });

}).on('error', (err) => {
    console.error('Error fetching from GitHub:', err.message);
    if (!fs.existsSync(outputPath)) {
        const fallbackInfo = {
            hash: 'error',
            date: new Date().toString(),
            title: 'Error Fetching Version',
            message: err.message,
            source: 'Error'
        };
        fs.writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2));
    }
});
