const crypto = require('crypto')

function signed_crc_table() {
  var c = 0,
    table = new Array(256);

  for (var n = 0; n != 256; ++n) {
    c = n;
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
    table[n] = c;
  }

  return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
}

var T = signed_crc_table();

function crc32_str(str, seed) {
  var C = seed ^ -1;
  for (var i = 0, L = str.length, c, d; i < L;) {
    c = str.charCodeAt(i++);
    if (c < 0x80) {
      C = (C >>> 8) ^ T[(C ^ c) & 0xFF];
    } else if (c < 0x800) {
      C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
    } else if (c >= 0xD800 && c < 0xE000) {
      c = (c & 1023) + 64;
      d = str.charCodeAt(i++) & 1023;
      C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xFF];
    } else {
      C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xFF];
      C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
    }
  }
  return Math.abs(C ^ -1).toString(16);
}

function createHash(payload) {
  let sha256 = crypto.createHash('sha256')
  sha256.update(payload)
  return sha256.digest('hex')
}

function createCardHash(payload) {
  let crchash = crc32_str(payload)
  return crchash
}

function hmacHex(data, signingKey) {
  let hmac = crypto.createHmac('sha256', signingKey)
  hmac.update(data)
  return hmac.digest('hex')
}

function derivePublicKey(p) {
  return crypto.createPublicKey(p).export({
    type: 'spki',
    format: 'pem'
  })
}

function encryptToPublic(pub, info) {
  return crypto.publicEncrypt(pub, Buffer(info)).toString('hex')
}

function decryptFromPrivate(priv, hiddenInfo) {
  return crypto.privateDecrypt(priv, Buffer.from(hiddenInfo, 'hex')).toString('latin1')
}

module.exports = {
  createCardHash,
  createHash,
  hmacHex,
  encryptToPublic,
  decryptFromPrivate,
  derivePublicKey
}
