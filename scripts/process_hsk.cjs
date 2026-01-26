const fs = require('fs');
const path = require('path');

const decksDir = path.join(__dirname, '../src/data/decks');
const files = ['HSK1.json', 'HSK2.json', 'HSK3.json', 'HSK4.json', 'HSK5.json'];

files.forEach(file => {
    const filePath = path.join(decksDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    try {
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const deckName = file.replace('.json', '');

        const processedCards = rawData.map((item, index) => {
            const form = item.forms && item.forms[0];
            const pinyin = form && form.transcriptions && form.transcriptions.pinyin ? form.transcriptions.pinyin : '';
            const meanings = form && form.meanings ? form.meanings.join('; ') : '';

            // Ensure unique ID
            const id = `${deckName}_${Date.now()}_${index}`;

            return {
                id: id,
                chinese: item.simplified,
                pinyin: pinyin,
                english: meanings,
                proficiency: 1,
                lastSeen: null
            };
        });

        // Wrap in a "cards" object as expected by the new structure
        const output = {
            cards: processedCards
        };

        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
        console.log(`Processed ${file}: ${processedCards.length} cards.`);

    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
});
