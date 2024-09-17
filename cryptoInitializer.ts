import { BytesLike, ethers } from 'ethers';
import crypto, { install } from 'react-native-quick-crypto';

install();
ethers.randomBytes.register((length) => {
  return new Uint8Array(crypto.randomBytes(length));
});

ethers.computeHmac.register((algo, key, data) => {
  return crypto.createHmac(algo, key).update(data).digest();
});

ethers.pbkdf2.register((passwd, salt, iter, keylen, algo) => {
  return crypto.pbkdf2Sync(passwd, salt, iter, keylen, algo) as BytesLike;
});

ethers.sha256.register((data) => {
  return crypto.createHash('sha256').update(data).digest();
});

ethers.sha512.register((data) => {
  return crypto.createHash('sha512').update(data).digest();
});
