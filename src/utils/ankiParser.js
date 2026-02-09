import JSZip from 'jszip';
import initSqlJs from 'sql.js';

export const parseAnkiApkg = async (file) => {
    try {
        const zip = new JSZip();
        const content = await zip.loadAsync(file);

        const collectionFile = content.file('collection.anki2');
        if (!content) {
            throw new Error('Invalid Anki apkg file: collection.anki2 not found');
        }

        const arrayBuffer = await collectionFile.async('arraybuffer');
        const SQL = await initSqlJs({
            // locateFile: file => `https://sql.js.org/dist/${file}` 
            locateFile: () => `/sql-wasm.wasm`
        });

        const db = new SQL.Database(new Uint8Array(arrayBuffer));

        // Query for notes.
        // The 'flds' column contains the fields separated by \x1f (unit separator).
        // Usually, the first field is Front and the second is Back, but this depends on the note type.
        // For simple flashcards, we assume index 0 is Front and index 1 is Back.
        // We might want to verify maping using 'col' table but that's complex for MVP.
        const result = db.exec("SELECT flds FROM notes");

        if (!result || result.length === 0) {
            return [];
        }

        const rows = result[0].values;
        const cards = rows.map((row, index) => {
            const flds = row[0].split('\x1f');
            const front = flds[0] || '';
            const back = flds[1] || '';

            // Clean up HTML tags if desired, or keep them if the app supports HTML.
            // For now, let's do a simple text extraction or keep simple HTML.
            // The Bubble Game might prefer plain text, while flashcards might support some HTML.
            // Let's strip basic HTML for safety/simplicity for now, or just leave it.
            // Let's stripping HTML to be safe for the Bubble Game which might rely on text length.

            const cleanText = (html) => {
                const tmp = document.createElement("DIV");
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText || "";
            };

            return {
                id: Date.now() + index, // Temporary ID
                front: cleanText(front).trim(),
                back: cleanText(back).trim(),
                proficiency: 0,
                timesSeen: 0,
                lastSeen: null
            };
        }).filter(card => card.front && card.back); // Filter out empty cards

        return cards;

    } catch (error) {
        console.error("Error parsing Anki file:", error);
        throw error;
    }
};
