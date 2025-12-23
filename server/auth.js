const { createHash } = require('crypto');
const ellipticcurve = require("starkbank-ecdsa");
const Ecdsa = ellipticcurve.Ecdsa;

function hashAndVerify(pw) {
  const salt = process.env.SALT;
  const toHash = salt + pw;
  const hash = createHash('sha256').update(toHash).digest('base64');
  return hash === process.env.HASH;
}

// function verifyEventSig(sig, timestamp, body) {

//   Buffer.from(sig, 'base64').toString('ascii');
// }


module.exports = {
  hashAndVerify
}