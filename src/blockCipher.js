const { dec2Bin, printBinary, ensureNBits, asciiToBits, chopString, binaryToAsciiChar } = require('./utils');

/*
* fiestel block encryption helper
* relies heavily on javascripts charCodeAt and fromCharCode.
* assumes 8bit ascii alphabet
*/
class BlockCipher {
  /*
  * @param {Number} n word size in bits
  * @param {Number} m number of keywords
  */
  constructor(n, m) {
    if (!n || !m) throw new Error('missing initialization parameters');
    console.log(`creating block cipher with block size: ${2*n} key size: ${m*n}`);
    this.m = m;
    this.n = n;
    this.MAX_KEY = Math.pow(2, m * n);
    this.MAX_WORD = Math.pow(2, n);
    this.ALPHABET_SIZE = 8;
  }

  _checkKeyWords(keyWords) {
    if (!Array.isArray(keyWords) || keyWords.length !== this.m) throw new Error('bad key words');
    keyWords.forEach(key => {
      if (isNaN(key) || key > this.MAX_WORD) throw new Error('bad key word', key);
    })
  }

  /*
  * @param {Array<Number>} keyWords a list of key words containing numbers up to word size
  * @returns {Array<Number>} round keys: a list of round keys
  */
  _expandKey(keyWords) {
    this._checkKeyWords(keyWords);
    // override
  }

  /*
  * @param {Array<Number>} words a list of 2 words (a block)
  * @param {Array<Number>} rKeys: a list of round keys
  */
  _encrypt(words, rKeys) {
    // override
    throw new Error('not implemented');
  }

  /*
  * @param {Array<Number>} words a list of 2 words (a block)
  * @param {Array<Number>} rKeys: a list of round keys
  */
  _decrypt(words, rKeys) {
    // override
    throw new Error('not implemented');
  }

  /*
  * converts text to word sized integer blocks
  * @param {string} text ascii text to encrypt (8bit encoded)
  */
  _textToNumericBlocks(text) {
    // prepare the text
    let bits = asciiToBits(text);
    // console.log(bits);
    let inputWords = chopString(bits, this.n)
      .map(word => parseInt(word, 2));
    // console.log('input words', inputWords);

    // account for odd number of words
    if (inputWords.length % 2 !== 0) inputWords.push(0);

    // encrypt each block and gather the results
    let blocks = []
    while (inputWords.length) {
      blocks.push([inputWords.shift(), inputWords.shift()]);
    }
    return blocks;
  }

  /*
  * converts word sized integer blocks to text
  * @param {Array<Number>} encWords converts a list of word integers into text
  */
  _numericBlocksToText(intWords) {
    // ensure each word is alphabet size
    let bitsStr =  intWords
      .map(w => dec2Bin(w)) // convert to bin string repr
      .map(w => ensureNBits(w, this.n))
      .join('');
    // console.log(bitsStr);

    // convert it back to ascii
    console.assert(bitsStr.length % this.ALPHABET_SIZE === 0);
    return chopString(bitsStr, this.ALPHABET_SIZE)
      .map(binaryChar => binaryToAsciiChar(binaryChar))
      .join('');
  }

  /*
  * @param {string} text ascii text to encrypt (8bit encoded)
  * @param {Array<Number>} keyWords a list of key words containing numbers up to word size
  */
  encryptAscii(text, keyWords) {
    if (text === undefined) throw new Error('bad input');

    // prepare the round keys
    let roundKeys = this._expandKey(keyWords);
    // console.log(roundKeys);

    let encWords = [];
    let blocks = this._textToNumericBlocks(text);
    blocks.forEach(block => {
       encWords.push(...this._encrypt(block, roundKeys));
    })
    // console.log('enc words', encWords);

    return this._numericBlocksToText(encWords);
  }

  /*
  * @param {string} text ascii text to encrypt (8bit encoded)
  * @param {Array<Number>} keyWords a list of key words containing numbers up to word size
  */
  decryptAscii(text, keyWords) {
    if (text === undefined) throw new Error('bad input');

    // prepare the round keys
    let roundKeys = this._expandKey(keyWords);
    // console.log(roundKeys);

    let encWords = [];
    let blocks = this._textToNumericBlocks(text);
    blocks.forEach(block => {
       encWords.push(...this._decrypt(block, roundKeys));
    })
    // console.log('enc words', encWords);

    return this._numericBlocksToText(encWords);
  }
}

module.exports = BlockCipher;