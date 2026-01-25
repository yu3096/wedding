/**
 * Checks the last character of the word to determine the correct postposition (Josa).
 * @param {string} word - The target word
 * @param {string} josa - The josa pair string (e.g., '은/는', '이/가', '을/를', '과/와')
 * @returns {string} The correct josa based on the word's final consonant (batchim).
 */
export function getJosa(word, josa) {
    if (!word) return "";

    const lastChar = word.charCodeAt(word.length - 1);
    const [withBatchim, withoutBatchim] = josa.split("/");

    // Hangul Syllables range: AC00(가) - D7A3(힣)
    if (lastChar < 0xAC00 || lastChar > 0xD7A3) {
        // For non-Hangul, default to the 'withoutBatchim' case (e.g., '와', '를')
        // This is a simplification; handling English/Numbers strictly is more complex.
        return withoutBatchim;
    }

    // (Code - Base) % 28 > 0 means there is a final consonant (Jongseong)
    const hasBatchim = (lastChar - 0xAC00) % 28 > 0;

    return hasBatchim ? withBatchim : withoutBatchim;
}
