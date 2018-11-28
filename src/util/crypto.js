import bip39 from 'bip39';
import sha256 from 'js-sha256';
import { hmac, keys } from 'libp2p-crypto';
import PeerId from 'peer-id';
import naclUtil from 'tweetnacl-util';

export function generatePeerId(mnemonic) {
  return new Promise(function(resolve, reject) {
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic();
    }

    const bip39seed = bip39.mnemonicToSeed(mnemonic, 'da-bears-da-champs');
    const hmac = sha256.hmac.create('fat-ass-seed');
    hmac.update(bip39seed);
    const seed = new Uint8Array(hmac.array());
    keys.generateKeyPairFromSeed('ed25519', seed, (err, keypair) => {
      PeerId.createFromPubKey(keys.marshalPublicKey(keypair.public),
        (err, key) => {
          resolve({
            mnemonic,
            peerId: key._idB58String,
          });
        });
    });     
  });
}

/*
 * Returns a Uint8Array(64) hash of the given text.
 */
export const hash = async (text, options = {}) => {
  const opts = {
    hash: 'SHA256',
    hmacSeed: 'ob-hash',
    ...options
  };

  return new Promise((resolve, reject) => {
    hmac.create(opts.hash, naclUtil.decodeUTF8(opts.hmacSeed), (err, hmac) => {
      if (!err) {
        hmac.digest(naclUtil.decodeUTF8(text), (err, sig) => {
          if (!err) {
            resolve(sig);
            return;
          }

          reject(err);
        });
        return;
      }

      reject(err);
    });
  });
};

export function identityKeyFromSeed(seed, bits = 4096) {
  return new Promise((resolve, reject) => {
    hash(seed, {
      hmacSeed: 'ob-identity'
    }).then(
      sig => {
        keys.generateKeyPairFromSeed('ed25519', sig, bits, (err, keypair) => {
          if (!err) {
            PeerId.createFromPubKey(keys.marshalPublicKey(keypair.public),
              (err, peerId) => {
                resolve({
                  peerId: peerId.toBytes(),
                  publicKey: keypair.public.bytes,
                  privateKey: keypair.bytes,
                });
              });
          } else {
            reject(err);
          }
        });
      },
      e => reject(e)
    );
  });
}
