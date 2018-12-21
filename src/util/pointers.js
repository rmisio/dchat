import BitArray from 'node-bitarray';
import { createHash } from 'crypto';
import { encode, decode } from 'multihashes';

export function createPointerKey(multihash, prefixLen = 14) {
  // var digest = [176, 125, 168, 103, 115, 91, 9, 159, 41, 122, 141, 24, 201, 155, 147, 163, 240, 213, 104, 110, 99, 113, 89, 69, 20, 136, 28, 193, 13, 93, 157, 163]
  const decodedMh = decode(multihash);
  const digest = decodedMh.digest;
  const truncatedPrefix = digest.slice(0,8);
  const prefix = new Buffer(new Uint8Array(truncatedPrefix));

  let bits = BitArray.fromBuffer(prefix);
  bits = bits.slice(0, prefixLen);
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

  const checksum = createHash('sha256').update(new Buffer(ids)).digest();

  return encode(Buffer.from(checksum), 'sha2-256');
}