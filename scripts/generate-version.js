import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.resolve(__dirname, '../src/version.json');
const shouldPush = process.argv.includes('--push');

console.log('Generating version info from local git...');

try {
    if (shouldPush) {
        console.log('Staging all changes...');
        execSync('git add .');
    }

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

    const newContent = JSON.stringify(versionInfo, null, 2);

    // Read existing content to check for changes
    let existingContent = '';
    if (fs.existsSync(outputPath)) {
        existingContent = fs.readFileSync(outputPath, 'utf8');
    }

    if (newContent !== existingContent || shouldPush) {
        if (newContent !== existingContent) {
            fs.writeFileSync(outputPath, newContent);
            console.log('version.json generated successfully from local git.');
            console.log(versionInfo);
        }

        if (shouldPush) {
            console.log('Committing and pushing all changes...');
            try {
                // Ensure version.json is staged even if it was just created/updated
                execSync(`git add "${outputPath}"`);

                // Check if there are staged changes to commit
                const status = execSync('git status --porcelain').toString().trim();
                if (status) {
                    execSync('git commit -m "chore: deploy-time version update"');
                    execSync('git push');
                    console.log('Successfully pushed changes to remote.');
                } else {
                    console.log('No changes to commit.');
                }
            } catch (gitError) {
                console.error('Git operation failed:', gitError.message);
            }
        }
    } else {
        console.log('version.json is already up to date.');
    }
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
