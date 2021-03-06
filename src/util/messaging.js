import axios from 'axios';
import pull from 'pull-stream';
// import toPull from 'stream-to-pull-stream';
import CID from 'cids';
import protobuf from 'protobufjs';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
// to do just import the functions you're using not the whole thing
import crypto from 'crypto';
// to do just import the functions you're using not the whole thing
import libp2pCrypto from 'libp2p-crypto';
import {
  toB58String,
  fromB58String,
} from 'multihashes';
import multiaddr from 'multiaddr'
import { createFromPubKey } from 'peer-id';
// import { toByteArray } from 'base64-js';
import jsonDescriptor from '../message.json';
import { IPNS_BASE_URL } from './constants';
import { encrypt } from './crypto';
import { newPointer } from './pointers';

let protoRoot;

function getProtoRoot() {
  if (protoRoot) return protoRoot;

  return protobuf.Root.fromJSON(jsonDescriptor);
}

// todo: validate args
// value should be a pb serialized payload for the given messageType
// used for offline messages
// change identityKey to identity
// export function generateMessageEnvelope(peerId, identityKey, messagePayload, options = {}) {
//   const opts = {
//     pubkeyUrl: `${IPNS_BASE_URL}/${peerId}`,
//     ...options,
//   }

//   return new Promise((resolve, reject) => {
//     // axios.get(opts.pubkeyUrl)
//     Promise.resolve({
//       data: {
//         pubkey: 'CAESIOd4zikCvE0qQdb1ie7HsQIcmhORXddTm7FHgZrS1qWN',
//       }
//     })
//       .then(resp => {
//         const hexKey = resp && resp.data && resp.data.pubkey;

//         if (typeof hexKey !== 'string') {
//           reject(new Error('Unable to obtain the receiver\'s public key.'));
//           return;
//         }

//         // const pubkeyBytes = Buffer.from(hexKey, 'hex');
//         // const pubkeyBytes = Buffer.from(hexKey, 'base64');
//         const pubkeyBytes = Buffer.from(identityKey.publicKey);
//         const receiverPubKey = libp2pCrypto.keys.unmarshalPublicKey(pubkeyBytes);

//         const Message = getProtoRoot().lookupType('Message');
//         const messagePb = generateMessage(messagePayload);
//         const serializedMessage = Message.encode(messagePb).finish();

//         const signature = nacl.sign.detached(serializedMessage, identityKey.privateKey);

//         const Envelope = getProtoRoot().lookupType('Envelope');
//         const envelopePayload = {
//           message: messagePb,
//           pubkey: identityKey.publicKey,
//           signature,
//         };        

//         const envErr = Envelope.verify(envelopePayload);

//         if (envErr) {
//           reject(new Error(`The envelope payload does not verify: ${envErr}`));
//           return;
//         }

//         const envelope = Envelope.create(envelopePayload);
//         const serializedEnvelope = Envelope.encode(envelope).finish();

//         // Generate ephemeral key
//         const ephemKeypair = nacl.box.keyPair();
        
//         // Convert to curve25519 pubkey
//         const pubkeyCurve = ed2curve.convertPublicKey(receiverPubKey._key);
        
//         // 24 bit random nonce
//         const nonce = new Uint8Array(crypto.randomBytes(24));
        
//         // Create ciphertext
//         const cipherText = nacl.box(serializedEnvelope, nonce, pubkeyCurve, ephemKeypair.secretKey);

//         const jointCiphertext = Buffer.concat([
//           Buffer.from(nonce),
//           Buffer.from(ephemKeypair.publicKey),
//           Buffer.from(cipherText)
//         ]);

//         resolve(jointCiphertext.toString('base64'));
//       })
//       .catch(err => reject(err));
//   });
// }

function generateMessage(payload, options = {}) {
  const opts = {
    encode: false,
    ...options,
  };

  const Message = getProtoRoot().lookupType('Message');
  const messageErr = Message.verify(payload);
  
  if (messageErr) {
    throw new Error(`The message payload does not verify: ${messageErr}`);
  }

  const message = Message.create(payload);

  return opts.encode ?
    Message.encodeDelimited(message).finish() :
    message;
}

function getMessagePayload(messageType, urlType, value) {
  return {
    messageType,
    payload: {
      type_url: `type.googleapis.com/${urlType}`,
      value,
    }
  }
}

export function generateChatMessage(peerId, payload, identityKey, options) {
  // const opts = {
  //   encode: true,
  //   ...options,
  // };

  return new Promise((resolve, reject) => {
    const Chat = getProtoRoot().lookupType('Chat');
    const chatErr = Chat.verify(payload);
    
    if (chatErr) {
      reject(new Error(`The chat payload does not verify: ${chatErr}`));
      return;
    }

    const chat = Chat.create(payload);
    const serializedChat = Chat.encode(chat).finish();
    const messagePayload = getMessagePayload(1, 'Chat', serializedChat);

    resolve(generateMessage(messagePayload, options));

    // if (!opts.offline) {
    //   resolve(generateMessage(messagePayload, { encode: true }));
    // } else {
    //   return generateMessageEnvelope(peerId, identityKey, messagePayload, options)
    //     .then(
    //       (...args) => resolve(...args),
    //       (...args) => reject(...args)
    //     );
    // }
  });  
}

// Perhaps the following handlers should be in a seperate messageHandlers file?
// also they could probably be abstracted
function openChatMessage(message) {
  const Chat = getProtoRoot().lookupType('Chat');
  return Chat.decode(message);
}

function openErrorMessage(message) {
  const Err = getProtoRoot().lookupType('Error');
  return Err.decode(message);
}

async function handleStoreMessage(message, peerId, node) {
  // TODO - match with request ID
  const CidList = getProtoRoot().lookupType('CidList');
  const decodedMsg = CidList.decode(message);

  for (const cid of decodedMsg.cids) {
    const blockRes = await node.block.get(cid);
    console.log(`sending block with cid ${cid} to ${peerId}`);
    await sendBlockMessage(node, peerId, {
      cid,
      rawData: blockRes.data,
    });
  }
}

export function openDirectMessage(messagePb, peerId, node) {
  const Message = getProtoRoot().lookupType('Message');
  let message;

  try {
    message = Message.decode(messagePb);
  } catch (e) {
    console.error(`Unable to decode message in an undelimted way - ${e}. ` +
      'Will try delimited.');
    message = Message.decodeDelimited(messagePb);
  }

  console.log('decoded the message slick');
  window.slick = message;

  switch (message.messageType) {
    case 1:
      // chat message
      return {
        type: 'CHAT',
        ...openChatMessage(message.payload.value),
      };
    case 18:
      // store message
      handleStoreMessage(message.payload.value, peerId, node)
        .catch(e => {
          console.error('There was an error processing a Store message:', e);
        });

      return {
        type: 'STORE',
      };
    case 500:
      // error message
      return {
        type: 'ERROR',
        ...openErrorMessage(message.payload.value),
      };
    default:
      throw new
        Error(`Message type ${message.messageType} is not supported at this time.`)
  }
}

// todo: change identityKey to identity
// expecting b64 message
// export function openOfflineMessage(message, identityKey) {
//   return new Promise((resolve, reject) => {
//     const messageBytes = Buffer.from(message, 'base64');
//     const nonce = messageBytes.slice(0,24);
//     const pubKey = messageBytes.slice(24,56);
//     const cipherText = messageBytes.slice(56, messageBytes.length);
//     const privKey = ed2curve.convertSecretKey(identityKey.privateKey);

//     const out = nacl.box.open(cipherText, nonce, pubKey, privKey);
    
//     if (!out) {
//       reject(new Error('Unable to decrypt.'));
//     } else {
//       // console.log('zip - Decrypted ciphertext:', out);
//       // window.zip = out;
//     }

//     const EnvelopePb = getProtoRoot().lookupType('Envelope');
//     const envelope = EnvelopePb.decode(out);

//     createFromPubKey(Buffer.from(envelope.pubkey), (err, data) => {
//       if (err) {
//         reject(err);
//         return;
//       }

//       const receiverId = toB58String(data.id);

//       switch (envelope.message.messageType) {
//         case 1:
//           // chat message
//           resolve({
//             type: 'CHAT',
//             receiverId,
//             ...openChatMessage(envelope.message.payload.value),
//           });
//           break;
//         default:
//           reject(
//             new Error(
//               `Message type ${envelope.message.messageType} is not supported at this time.`
//             )
//           );
//       }
//     });
//   });
// }

const ipfsRelayPeer =
  '/dns4/webchat.ob1.io/tcp/9999/wss/ipfs/QmSAumietCn85sF68xgCUtVS7UuZbyBi5LQPWqLe4vfwYb';
let relayConnectPromise;

export function relayConnect(node) {
  if (relayConnectPromise) {
    return relayConnectPromise;
  }

  if (!node) {
    throw new Error('Please provide an ipfs node.');
  }

  return new Promise((res, rej) => {
    const always = () => relayConnectPromise = null;
    const resolve = (...args) => {
      always();
      res(...args);
    };
    const reject = (...args) => {
      always();
      resolve(...args);
    };

    node._libp2pNode.dialFSM(ipfsRelayPeer, '/openbazaar/app/1.0.0', (err, connFSM) => {
      if (err) {
        console.error(`Unable to connect to the relay peer at ${ipfsRelayPeer}.`);
        console.error(err);
        reject(err);
        return;
      }

      console.log('connected to the relay');
      connFSM.on('close', () => relayConnect(node));
      resolve();
    });
  });
}

function _sendMessage(node, peerId, message, options = {}) {
  if (!node) {
    throw new Error('Please provide an ipfs node.');
  }

  const opts = {
    timeout: 1000 * 60 * 2,
    waitForResponse: false,
    ...options,
  }

  const peer = `/p2p-circuit/ipfs/${peerId}`;
  console.log(`will send to ${peerId} at ${peer}`);

  let timeout;

  return new Promise((resolve, reject) => {
    if (opts.waitForResponse) {
      timeout = setTimeout(() => {
        reject(new Error('Timed-out waiting for reponse.'));
      }, opts.timeout);
    }

    relayConnect(node)
      .then(() => {
        return node.swarm.connect(peer);
      })
      .then(() => {
        console.log(`connected to ${peerId}`);

        node._libp2pNode.dialProtocol(peer, '/openbazaar/app/1.0.0',
          (err, conn) => {
            if (err) reject(err);

            console.log('pushing outgoing message bam');
            window.bam = message;

            let getResponse = null;

            if (opts.waitForResponse) {
              getResponse = pull.collect((err, data) => {
                if (err) { 
                  reject(err);
                }
                console.log('received echo:', data.toString())
                window.echo = data;
                resolve(data);
              });
            }

            // const duplexConn = toPull.duplex(conn);
                
            // pull(
            //   pull.once(message),
            //   duplexConn,
            //   pull.drain(function (data) {
            //     console.log('i got a sassy response');
            //     window.sassy = data;
            //   }, function (err) {
            //     console.error('No sass here boy.');
            //     window.sass = err;
            //     if(err) console.error(err);
            //   })
            // );

            pull(
              pull.once(message),
              conn,
              getResponse
            );            

            if (!opts.waitForResponse) {
              resolve();
            }
          });
      })
        .catch(e => reject(e));
  })
    .finally(() => clearTimeout(timeout));
}

function sendMessage(node, peerId, message, options = {}) {
  return _sendMessage(node, peerId, message, {
    ...options,
    waitForResponse: false,
  });
}

export async function sendChatMessage(node, peerId, payload) {
  const chatMsg = await generateChatMessage(
    peerId,
    payload,
    node.__identity,
    {
      encode: true,
    }
  );

  return sendMessage(node, peerId, chatMsg);
}

export async function sendBlockMessage(node, peerId, data) {
  const Block = getProtoRoot().lookupType('Block');
  const blockErr = Block.verify(data);

  if (blockErr) {
    throw new Error(`The Block payload does not verify: ${blockErr}`);
  }

  const block = Block.create(data);
  const payload =
    getMessagePayload(19, 'Block', Block.encode(block).finish());
  const message = generateMessage(payload, { encode: true });

  return sendMessage(
    node,
    peerId,
    message
  );
}

const pushNode = 'QmSEAdeDTUGMkuaqXCe7z3kfkLqrqwadMexRo9JfUJTCh5';

function sendStoreMessage(node, peerId, data) {
  const CidList = getProtoRoot().lookupType('CidList');
  const cidListErr = CidList.verify(data);

  if (cidListErr) {
    throw new Error(`The cidList payload does not verify: ${cidListErr}`);
  }

  const cidList = CidList.create(data);
  const payload =
    getMessagePayload(18, 'CidList', CidList.encode(cidList).finish());
  const message = generateMessage(payload, { encode: true });

  return sendMessage(node, peerId, message);
}

export function sendRequest(node, peerId, message, options = {}) {
  return _sendMessage(node, peerId, message, {
    ...options,
    waitForResponse: true,
  });
}

// export async function sendOfflineChatMessage(node, peerId, payload, options = {}) {
//   // const envelope = await generateChatMessage(peerId, payload, node.__identity, {
//   //   ...options,
//   //   offline: true,
//   // });



//   const envDigest = crypto.createHash('sha256').update(envelope).digest();
//   const hexEnvDigest = envDigest.toString('hex');
//   const envBuffer = Buffer.from(hexEnvDigest, 'hex');
//   const { repoPath } = await node.repo.stat();
//   const filePath = `${repoPath}/outbox/${hexEnvDigest}`;
//   const files = await node.add([{
//     path: filePath,
//     content: envBuffer,
//   }]);
  
//   const file = files.find(file => file.path === filePath); 

//   if (!file || !file.hash) {
//     throw new Error('Unable to obtain the file hash of the offline message.');
//   }

//   console.log(`the file hash is ${file.hash}`);

//   await sendStoreMessage(node, pushNode, { cids: [file.hash] });

//   // const pointer = ipfs.NewPointer(
//   //   fromB58String(peerId),
//   //   DefaultPointerPrefixLength, addr, ciphertext)

//   // const pointerKey = createPointerKey(fromB58String(file.hash));
//   // const cid = new CID(pointerKey);
//   // console.log('the cid is manner');
//   // window.manner = cid;
// }

async function storeOfflineMessage(node, peerId, msgBytes) {
  const envDigest = crypto.createHash('sha256').update(msgBytes).digest();
  const hexEnvDigest = envDigest.toString('hex');
  const envBuffer = Buffer.from(hexEnvDigest, 'hex');
  const { repoPath } = await node.repo.stat();
  const filePath = `${repoPath}/outbox/${hexEnvDigest}`;
  const files = await node.add([{
    path: filePath,
    content: envBuffer,
  }]);
  
  const file = files.find(file => file.path === filePath); 

  if (!file || !file.hash) {
    throw new Error('Unable to obtain the file hash of the offline message.');
  }

  console.log(`the file hash is ${file.hash}`);

  await sendStoreMessage(node, pushNode, { cids: [file.hash] });

  return multiaddr(`/ipfs/${file.hash}/`);
}

export async function sendOfflineMessage(node, peerId, pubKeyBytes, messagePb) {
  const serializedMessage = getProtoRoot()
    .lookupType('Message')
    .encode(messagePb).finish();
  console.log('the node is mode');
  window.mode = node;
  const signature = nacl.sign.detached(serializedMessage, node.__identity.privateKey);

  const Envelope = getProtoRoot().lookupType('Envelope');
  const envelopePayload = {
    message: messagePb,
    pubkey: node.__identity.publicKey,
    signature,
  };        
  const envErr = Envelope.verify(envelopePayload);

  if (envErr) {
    throw new Error(`The envelope payload does not verify: ${envErr}`);
  }

  const envelope = Envelope.create(envelopePayload);
  const serializedEnvelope = Envelope.encode(envelope).finish();
  const cipherText = encrypt(pubKeyBytes, serializedEnvelope);

  const mAddr = await storeOfflineMessage(node, peerId, cipherText);
  console.log(`the addr is skipper: ${mAddr}`);
  window.skipper = mAddr;
  
  let pointer = newPointer(fromB58String(peerId), mAddr, cipherText);
  pointer = {
    Purpose: 1,
    CancelID: peerId,
    ...pointer,
  }

  console.log('the pointer is point');
  window.point = pointer;
}

export async function sendOfflineChatMessage(node, peerId, data, options = {}) {
  const messagePb = await generateChatMessage(peerId, data, node.__identity, { encode: false });
  const pubkeyBytes = Buffer.from('CAESIOd4zikCvE0qQdb1ie7HsQIcmhORXddTm7FHgZrS1qWN', 'base64');
  return sendOfflineMessage(node, peerId, pubkeyBytes, messagePb);
}
