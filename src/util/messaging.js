import axios from 'axios';
import protobuf from 'protobufjs';
import nacl from 'tweetnacl';
import ed2curve from 'ed2curve';
import crypto from 'crypto';
import libp2pCrypto from 'libp2p-crypto';
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
function generateMessageEnvelope(peerId, identityKey, messageType, value, options = {}) {
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
        const messagePayload = {
          messageType,
          payload: {
            type_url: 'type.googleapis.com/Chat',
            value,
          }
        };

        const messageErr = Message.verify(messagePayload);
        
        if (messageErr) {
          reject(new Error(`The message payload does not verify: ${messageErr}`));
          return;
        }

        const messagePb = Message.create(messagePayload);
        var serializedMessage = Message.encode(messagePb).finish();

        // todo: why does this bomb if I use the private key and it's forcing me
        // to use a private property?
        const signature = nacl.sign.detached(serializedMessage, identityKey._key);
        const envelopePayload = {
          messagePb,
          pubkey: identityKey.publicKey,
          signature,
        };        

        const envErr = Envelope.verify(envelopePayload)

        if (envErr) {
          reject(new Error(`The envelope payload does not verify: ${envErr}`));
          return;
        }

        const envelopePb = Envelope.create(envelopePayload);
        const serializedEnvelope = Envelope.encode(envelopePb).finish();

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

        resolve(jointCiphertext.toString('base64'));
      })
      .catch(err => reject(err));
  });
}

export function generateChatMessage(peerId, identityKey, payload, options = {}) {
  return new Promise((resolve, reject) => {
    const Chat = getProtoRoot().lookupType('Chat');
    const chatErr = Chat.verify(payload);
    
    if (chatErr) {
      reject(new Error(`The chat payload does not verify: ${chatErr}`));
      return;
    }

    const chatPb = Chat.create(payload);
    const serializedChat = Chat.encode(chatPb).finish();

    return generateMessageEnvelope(peerId, identityKey, 1, serializedChat, options)
      .then(
        (...args) => resolve(...args),
        (...args) => reject(...args)
      );
  });  
}

// Perhaps the following handlers should be in a seperate messageHandlers file?
function openChatMessage(message) {
  const Chat = getProtoRoot().lookupType('Chat');
  return Chat.decode(message);
}

// todo: change identityKey to identity
// expecting b64 message
export function openMessage(message, identityKey) {
  const nonce = message.slice(0,24);
  const pubkey = message.slice(24,56);
  const cipherText = message.slice(56, message.length);
  const privKey = ed2curve.convertSecretKey(identityKey._key);

  const out = nacl.box.open(cipherText, nonce, pubkey, privKey);
  
  if (!out) {
    throw new Error('Unable to decrypt.');
  } else {
    console.log('Decrypted ciphertext:', out);
  }

  const MessagePb = getProtoRoot().lookupType('Message');
  const EnvelopePb = getProtoRoot().lookupType('Envelope');
  const envelope = EnvelopePb.decode(out);
  const deserializedMsg = MessagePb.decode(envelope.message);
  const messageType = deserializedMsg.messageType;
  const receiverId = createFromPubKey(envelope.pubkey);

  switch (messageType) {
    case 1:
      // chat message
      return {
        type: 'CHAT',
        receiverId,
        ...openChatMessage(deserializedMsg),
      };
    default:
      throw new Error(
        `Message type ${messageType} is not supported at this time.`
      );
  }
}