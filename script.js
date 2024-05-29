const targetTypes = [ "명사", "형용사" ];

let nouns = "value";
let adjectives = "value";

const valueSet = new Set();

document.getElementById('fileInput').addEventListener('change', async function(event) {
    const file = event.target.files[0];

    const nounsOutputElement = document.getElementById('nounsOutput');
    const adjectivesOutputElement = document.getElementById('adjectivesOutput');

    const minLength = document.getElementById('minLength').value;

    oboe({
        url: URL.createObjectURL(file),
        method: 'GET',
        withCredentials: false
    })
    .node('!.LexicalResource.Lexicon.LexicalEntry.*', function(chunk) {
        try {
            // 유형
            const type = chunk.feat.filter(feat => feat.att === "partOfSpeech")[0].val;
            if (!targetTypes.includes(type)) return;

            // 단어
            let value;
            if (type === "명사") {
                value = chunk.Lemma.feat.val;
                if (value.endsWith("적")) return;       // 형용사적 명사 제외
            } else if (type === "형용사") {
                value = chunk.WordForm[1].feat.filter(feat => feat.att === "writtenForm")[0].val;
            }

            // Skip if value is too short
            if (value.length < minLength) return;

            if (valueSet.has(value)) {
                return;
            } else {
                valueSet.add(value);

                // Append each chunk to output
                if (type === "명사") {
                    nouns += value + "\n";
                } else if (type === "형용사") {
                    adjectives += value + "\n";
                }
            }
    
            nounsOutputElement.value = nouns;
            adjectivesOutputElement.value = adjectives;
        } catch (error) {
            // do nothing
        }
    })
    .done(function() {
        // All data has been processed
        console.log('All data has been processed');
    });
});

document.getElementById('saveNouns').addEventListener('click', function() {
    appendToFile("nouns", nouns);
});

document.getElementById('saveAdjectives').addEventListener('click', function() {
    appendToFile("adjectives", adjectives);
});

function appendToFile(type, value) {
    // Initialize file content if not already done
    if (!window.fileContent) {
        window.fileContent = {
            "nouns": [],
            "adjectives": []
        };
    }

    // Append value to file content
    window.fileContent[type].push(value);

    // Add UTF-8 BOM at the start of the file content
    const fileContentWithBOM = "\uFEFF" + window.fileContent[type].join('\n');

    // Create Blob from file content
    const blob = new Blob([fileContentWithBOM], { type: 'text/csv;charset=utf-8;' });

    // Create URL for Blob
    const url = URL.createObjectURL(blob);

    // Create link for download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}.csv`;

    // Append link to body
    document.body.appendChild(link);

    // Automatically click link to start download
    link.click();

    // Remove link from body
    document.body.removeChild(link);
}