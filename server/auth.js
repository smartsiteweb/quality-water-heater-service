const { createHash } = require('crypto');

function hashAndVerify(pw) {
  const salt = process.env.SALT;
  const toHash = salt + pw;
  const hash = createHash('sha256').update(toHash).digest('base64');
  return hash === process.env.HASH;
}


module.exports = {
  hashAndVerify
}