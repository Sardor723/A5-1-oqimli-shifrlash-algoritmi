function encrypt() {
    const key = document.getElementById('inputKey').value;
    const binaryText = document.getElementById('inputText').value;
    const encryptedTextElement = document.getElementById('encryptedText');

    if (key.length !== 8) {
        encryptedTextElement.innerText = "Kalit 8 ta belgi bo'lishi kerak!";
        return;
    }

    if (!/^[01]+$/.test(binaryText)) {
        encryptedTextElement.innerText = "Matn faqat 0 va 1 lardan iborat bo'lishi kerak!";
        return;
    }

    const binaryKey = stringToBinary(key);
    const keystream = generateKeystream(binaryKey, binaryText.length);
    const encryptedText = xorBinaryStrings(binaryText, keystream);

    encryptedTextElement.innerText = encryptedText;
}

function stringToBinary(str) {
    return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function xorBinaryStrings(bin1, bin2) {
    return bin1.split('').map((bit, i) => bit === bin2[i] ? '0' : '1').join('');
}

function generateKeystream(key, length) {
    let lfsr1 = new LFSR([0, 2, 3, 5], key.slice(0, 19).split('').map(Number));
    let lfsr2 = new LFSR([0, 1], key.slice(19, 41).split('').map(Number));
    let lfsr3 = new LFSR([0, 1, 3, 4], key.slice(41, 64).split('').map(Number));

    let keystream = '';
    for (let i = 0; i < length; i++) {
        const majority = majorityBit(lfsr1.state[8], lfsr2.state[10], lfsr3.state[10]);
        if (lfsr1.state[8] === majority) lfsr1.shift();
        if (lfsr2.state[10] === majority) lfsr2.shift();
        if (lfsr3.state[10] === majority) lfsr3.shift();
        keystream += (lfsr1.state[18] ^ lfsr2.state[21] ^ lfsr3.state[22]).toString();
    }
    return keystream;
}

function majorityBit(x, y, z) {
    return (x & y) | (y & z) | (z & x);
}

class LFSR {
    constructor(taps, initialState) {
        this.taps = taps;
        this.state = initialState;
    }

    shift() {
        const feedback = this.taps.reduce((acc, tap) => acc ^ this.state[tap], 0);
        this.state.pop();
        this.state.unshift(feedback);
    }
}
