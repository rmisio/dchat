import BitArray from 'node-bitarray';
import { createHash } from 'crypto';
import { encode, decode, toB58String } from 'multihashes';

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

// export function newPointer(mh, )

// const bytes = [18, 32, 196, 96, 35, 47, 245, 119, 199, 180, 82, 68, 139, 38, 25, 77, 36, 132, 22, 147, 127, 102, 173, 50, 180, 83, 141, 247, 164, 33, 106, 196, 58, 253];
// const buf = new Buffer(bytes);
// console.log(buf);
// // const magicBuf = new Buffer(MAGIC, 'hex');
// // console.log(magicBuf);
// // // const mh = encode(buf, 'sha2-256');
// // const theGoods = getMagicId(buf);
// // console.log(theGoods);
// const pointerKey = createPointerKey(encode(buf, 'sha2-256'), 14);
// console.log(pointerKey);

const poo = Buffer.from('CAESIOd4zikCvE0qQdb1ie7HsQIcmhORXddTm7FHgZrS1qWN', 'base64');
console.log('poo in de shoe!');
window.poo = poo;