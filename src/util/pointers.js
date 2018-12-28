import BitArray from 'node-bitarray';
import { createHash } from 'crypto';
import { encode, decode, toB58String } from 'multihashes';
import multiaddr from 'multiaddr';
import PeerInfo from 'peer-info';
import CID from 'cids';

function createPointerKey(multihash) {
  const decodedMh = decode(multihash);
  const digest = decodedMh.digest;
  const truncatedPrefix = digest.slice(0,8);
  const prefix = new Buffer(new Uint8Array(truncatedPrefix));

  let bits = BitArray.fromBuffer(prefix);
  bits = bits.slice(0, 14);
  bits = new Buffer(bits);

  for (let i=0; i<50; i++) {
    bits = Buffer.concat([new Buffer([0]), bits]);
  }

  // Construct uint8array from binary strings
  const ids = [];
  for(let i=0; i < 8; i++) {
    let tmpX = '';
    for (let j=0; j < 8; j++) {
      tmpX += bits[i * 8 + j]
    }
    ids.push(parseInt(tmpX, 2));
  }

  const checkSum = createHash('sha256').update(new Buffer(ids)).digest();

  return encode(Buffer.from(checkSum), 'sha2-256');
}

const MAGIC = "000000000000000000000000";

function getMagicId(bytes) {
  const hash = createHash('sha256').update(new Buffer(bytes)).digest();
  const magicBytes = new Buffer(MAGIC, 'hex');
  const prefixedBytes = Buffer.concat([magicBytes, hash.slice(0, 20)]);
  const mh = encode(prefixedBytes, 'sha2-256');
  return toB58String(mh);
}

// func NewPointer(mhKey multihash.Multihash, prefixLen int, addr ma.Multiaddr, entropy []byte) (Pointer, error) {
export function newPointer(multihash, mAddr, contentBytes) {
  const key = createPointerKey(multihash);
  const magicId = getMagicId(contentBytes);
  const pi = new PeerInfo(magicId);
  pi.multiaddrs.add(mAddr);
  console.log(`the pointer key is ${key}`);
  return {
    Cid: (new CID(key))
      .toV0()
      .toBaseEncodedString(),
    Value: pi,
  }
}