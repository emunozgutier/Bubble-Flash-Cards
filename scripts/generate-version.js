import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../src/version.json');

console.log('Generating version info from local git...');

try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    const date = execSync('git log -1 --format=%cI').toString().trim();
    const title = execSync('git log -1 --format=%s').toString().trim();
    const message = execSync('git log -1 --format=%b').toString().trim();

    const versionInfo = {
        hash,
        date,
        title,
        message,
        source: 'Local Git'
    };

    fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
    console.log('version.json generated successfully from local git.');
    console.log(versionInfo);
} catch (error) {
    console.error('Error generating version info from git:', error.message);

    // Fallback if git fails (e.g., not a git repo or git not installed)
    if (!fs.existsSync(outputPath)) {
        const fallbackInfo = {
            hash: 'unknown',
            date: new Date().toISOString(),
            title: 'No Git Info',
            message: 'Could not retrieve git metadata.',
            source: 'Fallback'
        };
        fs.writeFileSync(outputPath, JSON.stringify(fallbackInfo, null, 2));
    }
}
