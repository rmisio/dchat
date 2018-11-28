import bip39 from 'bip39';
import sha256 from 'js-sha256';
import crypto2 from 'libp2p-crypto';
import PeerId from 'peer-id';

export function generatePeerID(mnemonic) {
  return new Promise(function(resolve, reject) {
    if (!mnemonic) {
      mnemonic = bip39.generateMnemonic();
    }

    const bip39seed = bip39.mnemonicToSeed(mnemonic, 'da-bears-da-champs');
    const hmac = sha256.hmac.create('fat-ass-seed');
    hmac.update(bip39seed);
    const seed = new Uint8Array(hmac.array());
    crypto2.keys.generateKeyPairFromSeed('ed25519', seed, (err, keypair) => {
      PeerId.createFromPubKey(crypto2.keys.marshalPublicKey(keypair.public),
        (err, key) => {
          resolve({
            mnemonic,
            peerId: key._idB58String,
          });
        });
    });     
  });
}
