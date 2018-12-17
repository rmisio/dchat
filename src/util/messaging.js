import axios from 'axios';
import protobuf from 'protobufjs';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import crypto from 'crypto';
import libp2pCrypto from 'libp2p-crypto';
import multihashes from 'multihashes';
import CID from 'cids';
import { createFromPubKey } from 'peer-id';
import jsonDescriptor from '../message.json';
import { IPNS_BASE_URL } from './constants';

let protoRoot;

function getProtoRoot() {
  if (protoRoot) return protoRoot;

  return protobuf.Root.fromJSON(jsonDescriptor);
}

// todo: validate args
// value should be a pb serialized payload for the given messageType
// used for offline messages
function generateMessageEnvelope(peerId, identityKey, messagePayload, options = {}) {
  const opts = {
    pubkeyUrl: `${IPNS_BASE_URL}/${peerId}`,
    ...options,
  }

  return new Promise((resolve, reject) => {
    axios.get(opts.pubkeyUrl)
      .then(resp => {
        const hexKey = resp && resp.data && resp.data.pubkey;

        if (typeof hexKey !== 'string') {
          reject(new Error('Unable to obtain the receiver\'s public key.'));
          return;
        }

        const pubkeyBytes = Buffer.from(hexKey, 'hex');
        const receiverPubKey = libp2pCrypto.keys.unmarshalPublicKey(pubkeyBytes);
        const Message = getProtoRoot().lookupType('Message');
        const Envelope = getProtoRoot().lookupType('Envelope');
        const messagePb = Message.create(messagePayload);
        var serializedMessage = Message.encode(messagePb).finish();

        // todo: why does this bomb if I use the private key and it's forcing me
        // to use a private property?
        const signature = nacl.sign.detached(serializedMessage, identityKey._key);
        const envelopePayload = {
          message: messagePb,
          pubkey: identityKey.publicKey,
          signature,
        };        

        const envErr = Envelope.verify(envelopePayload)

        if (envErr) {
          reject(new Error(`The envelope payload does not verify: ${envErr}`));
          return;
        }

        const envelope = Envelope.create(envelopePayload);
        const serializedEnvelope = Envelope.encode(envelope).finish();

        // TODO: does this make send as an alternate encode function in crypto.js?
        // Generate ephemeral key
        const ephemKeypair = nacl.box.keyPair();
        
        // Convert to curve25519 pubkey
        const pubkeyCurve = ed2curve.convertPublicKey(receiverPubKey._key);
        
        // 24 bit random nonce
        const nonce = new Uint8Array(crypto.randomBytes(24));
        
        // Create ciphertext
        const cipherText = nacl.box(serializedEnvelope, nonce, pubkeyCurve, ephemKeypair.secretKey);

        // END: does this make send as an alternate encode function in crypto.js?
        
        // Append none and key
        const jointCiphertext = Buffer.concat([
          Buffer.from(nonce),
          Buffer.from(ephemKeypair.publicKey),
          Buffer.from(cipherText)
        ]);

        // resolve(jointCiphertext.toString('base64'));
        resolve(jointCiphertext);
      })
      .catch(err => reject(err));
  });
}

function generateMessagePb(payload, options = {}) {
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

function getMessagePayload(messageType, typeUrl, value) {
  return {
    messageType,
    payload: {
      type_url: typeUrl,
      value,
    }
  }
}

export function generateChatMessage(peerId, payload, identityKey, options = {}) {
  const opts = {
    offline: false,
    ...options,
  };

  return new Promise((resolve, reject) => {
    const Chat = getProtoRoot().lookupType('Chat');
    const chatErr = Chat.verify(payload);
    
    if (chatErr) {
      reject(new Error(`The chat payload does not verify: ${chatErr}`));
      return;
    }

    const chat = Chat.create(payload);
    const serializedChat = Chat.encode(chat).finish();
    const messagePayload = {
      messageType: 1,
      payload: {
        type_url: 'type.googleapis.com/Chat',
        value: serializedChat,
      }
    };


    if (!opts.offline) {
      resolve(generateMessagePb(messagePayload, { encode: true }));
    } else {
      return generateMessageEnvelope(peerId, identityKey, payload, options)
        .then(
          (...args) => resolve(...args),
          (...args) => reject(...args)
        );
    }
  });  
}

function sendStoreMessage(peerId, cids) {

}

export async function sendOfflineChatMessage(peerId, payload, node, options = {}) {
  const envelope = await generateChatMessage(peerId, payload, node.__identityKey, {
    ...options,
    offline: true,
  });
  const envDigest = crypto.createHash('sha256').update(envelope).digest();
  const hexEnvDigest = envDigest.toString('hex');
  const envBuffer = Buffer.from(hexEnvDigest, 'hex');
  const { repoPath } = await node.repo.stat();
  const { ipfsHash } = await node.add([{
    path: repoPath,
    content: envBuffer,
  }]);
  const cid = new CID(ipfsHash);
  console.log('hip hopper');
  window.hip = cid;
}

// Perhaps the following handlers should be in a seperate messageHandlers file?
function openChatMessage(message) {
  const Chat = getProtoRoot().lookupType('Chat');
  return Chat.decode(message);
}

export function openDirectMessage(messagePb) {
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
    default:
      throw new
        Error(`Message type ${message.messageType} is not supported at this time.`)
  }
}

// todo: change identityKey to identity
// expecting b64 message
export function openOfflineMessage(message, identityKey) {
  return new Promise((resolve, reject) => {
    const nonce = message.slice(0,24);
    const pubkey = message.slice(24,56);
    const cipherText = message.slice(56, message.length);
    const privKey = ed2curve.convertSecretKey(identityKey._key);

    const out = nacl.box.open(cipherText, nonce, pubkey, privKey);
    
    if (!out) {
      reject(new Error('Unable to decrypt.'));
    } else {
      // console.log('zip - Decrypted ciphertext:', out);
      // window.zip = out;
    }

    // const MessagePb = getProtoRoot().lookupType('Message');
    const EnvelopePb = getProtoRoot().lookupType('Envelope');
    const envelope = EnvelopePb.decode(out);

    // const deserializedMsg = MessagePb.decode(envelope.message);
    // const messageType = deserializedMsg.messageType;
    const receiverId = createFromPubKey(Buffer.from(envelope.pubkey), (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const receiverId = multihashes.toB58String(data.id);

      switch (envelope.message.messageType) {
        case 1:
          // chat message
          resolve({
            type: 'CHAT',
            receiverId,
            ...openChatMessage(envelope.message.payload.value),
          });
          break;
        default:
          reject(
            new Error(
              `Message type ${envelope.message.messageType} is not supported at this time.`
            )
          );
      }
    });
  });
}
