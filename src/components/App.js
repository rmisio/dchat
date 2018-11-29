import React, { Component } from 'react';
import {
  Route,
  Redirect,
  withRouter,
} from 'react-router-dom';
import uuid4 from 'uuid/v4';
import protobuf from 'protobufjs';
import IPFS from 'ipfs';
import { createFromBytes } from 'peer-id'
import { fromByteArray } from 'base64-js';
import multihashes from 'multihashes';
import pull from 'pull-stream';
import {
  generatePeerId,
  identityKeyFromSeed,
} from '../util/crypto';
import jsonDescriptor from './message.json';
import './App.scss';
import SiteNav from './SiteNav';
import Login from './Login';
import Register from './Register';
import StartConvo from './StartConvo';
import Conversation from './Conversation';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registerSeed: null,
      registerSeedError: null,
      userId: null,
      chats: {},
    };

    this.state.chats = {
      'QmSizzle': {
        messages: [
          {
            id: uuid4(),
            outgoing: true,
            msg: 'Hey there slick willy!',
          },
          {
            id: uuid4(),
            outgoing: true,
            msg: 'You feelin the funk or what?',
          },
          {
            id: uuid4(),
            outgoing: false,
            msg: 'No doubt trey bingo. Why dont you try it on the west end so you could see if you could consolidate the peach trea with the left-over minutia? Eh!',
          },          
        ],
        isTyping: false,
      },
    }

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);
    this.handleStartChat = this.handleStartChat.bind(this);
    this.handleChatSend = this.handleChatSend.bind(this);

    this.generateRegisterSeed();
  }

  // need base58 peerId, base64 privateKey
  getIpfsNodeInitOpts(peerId, privateKey) {
    if (typeof peerId !== 'string') {
      throw new Error('Please provide a peerId as a string.');
    }

    if (typeof privateKey !== 'string') {
      throw new Error('Please provide a privateKey as a string.');
    }    

    return {
      EXPERIMENTAL: {
        pubsub: true
      },
      relay: {
        "enabled": true,
        "hop": {
          "enabled": true
        }
      },
      repo: `./ipfs/${peerId}`,
      init: { privateKey },
    }
  }

  get ipfsRelayPeer() {
    return '/dns4/webchat.ob1.io/tcp/9999/wss/ipfs/QmVc37Xishzc8R3ZXn1p4Mm27nkSWhGSVdRr9Zi3NPRq8V';
  }

  handleLogin(seed) {
    if (!seed || typeof seed !== 'string') {
      alert('I\'m gonna need a seed slick willy!');
    }

    // todo: need some isLoggingIn state.
    identityKeyFromSeed(seed)
      .then(data => {
        const peerId = createFromBytes(data.peerId).toB58String();
        const privateKey = fromByteArray(data.privateKey);
        console.log(`A seed of "${seed.slice(0, 25)}…" gets you this peerId: ${peerId}`);
        const ipfsInitOpts = this.getIpfsNodeInitOpts(peerId, privateKey)
        const node = new IPFS(ipfsInitOpts);

        node.on('ready', () => {
          node.libp2p.start((...args) => {
            this.node = node;
            this.setState({ userId: peerId });
            node.swarm.connect(this.ipfsRelayPeer, err => {
              if (err) {
                return console.error(err)
              }
            });

            // handle incoming messages
            node._libp2pNode.handle('dabears/1', (protocol, conn) => {
              pull(
                conn,
                pull.collect((...args) => {
                  const [err, data] = args;
                  if (err) { throw err };
                  console.log('received echo:', data.toString());
                }),
              );
            });            
          });
        });
      })
      .catch(e => {
        alert(`There was an error generating your peerId: ${e.message}`);
      });
  }

  handleRegenerate() {
    this.generateRegisterSeed();
  }

  handleStartChat(peerId) {
    if (typeof peerId !== 'string' || !peerId.startsWith('Qm')) {
      alert('Please provide a valid peer id.');
    } else if (peerId === this.state.userId) {
      alert('We cannot condone chatting with yourself. Please try again.');
    } else {
      this.props.history.push(`/chat/${peerId}`);
    }
  }

  get root() {
    if (!this._rootPB) {
      this._rootPB = protobuf.Root.fromJSON(jsonDescriptor);  
    }

    return this._rootPB;
  }

  get ChatPB() {
    if (!this._ChatPB) {
      this._ChatPB = this.root.lookupType('Chat');
    }

    return this._ChatPB;
  }

  getChatPayload(message) {
    if (typeof message !== `string`) {
      throw new Error('Please provide a message as a string.');
    }

    const subject = ''; // Empty subject for chat message
    const timestamp = new Date();
    const combinationString = `${subject}!${timestamp.toISOString()}`;

    const idBytes = crypto.createHash('sha256').update(combinationString).digest();
    const idBytesArray = new Uint8Array(idBytes);
    const idBytesBuffer =  new Buffer(idBytesArray.buffer);
    const encoded = multihashes.encode(idBytesBuffer,0x12);

    return {
      messageId: multihashes.toB58String(encoded),
      subject,
      message,
      timestamp: { seconds: Math.floor(timestamp / 1000), nanos: 0},
      flag: 0
    };
  }  

  handleChatSend(peerId, msg) {
    if (typeof peerId !== 'string' || !peerId.startsWith('Qm')) {
      throw new Error('I need a peerId to send to.');
    }

    if (typeof msg !== 'string' || !msg) {
      alert('Please provide a message.');
      return;
    }

    const chatState = this.state.chats[peerId];

    if (!chatState) return;

    this.setState({
      chats: {
        ...this.state.chats,
        [peerId]: {
          ...chatState,
          isSendingMsg: true,
        }
      },
    });

    const updateSendAfter = () => {
      this.setState({
        chats: {
          ...this.state.chats,
          [peerId]: {
            ...chatState,
            isSendingMsg: false,
            messages: [
              ...this.state.chats[peerId].messages,
              {
                id: uuid4(),
                outgoing: true,
                msg,
              },
            ],
          }
        },
      });      
    }

    const peer = `/p2p-circuit/ipfs/${peerId}`;
    console.log(`will send to ${peerId}`);

    try {
      this.node.swarm.connect(peer, err => {
        if (err) { throw err }

        console.log(`connected to ${peerId}`);

        this.node._libp2pNode.dialProtocol(peer, 'dabears/1', (err, conn) => {
          if (err) { throw err }

          const payload = this.getChatPayload(msg);
          const Chat = this.ChatPB;
          const chat = Chat.create(payload);
          const serializedChat = Chat.encode(chat).finish();

          pull(
            pull.once(serializedChat),
            conn,
          );
          updateSendAfter();
        });
      });
    } catch (e) {
      alert(`Unable to send the chat message: ${e.message}`);
      updateSendAfter();
      throw e;
    }
  }

  generateRegisterSeed() {
    generatePeerId()
      .then(
        data => this.setState({
          registerSeed: data.mnemonic,
          registerSeedError: null,
        }),
        err => {
          this.setState({
            registerSeed: null,
            registerSeedError: err,
          });
          console.error('There was an error generating the register seed.', err);
        }
      );
  }

  get isLoggedIn() {
    return !!this.state.userId;
  }

  requiresLogin(Component, userProps) {
    return props => {
      const mergedProps = {
        ...props,
        ...userProps,
      };

      return this.isLoggedIn ?
        <Component {...mergedProps} /> :
        <Login onLogin={this.handleLogin} />;
    }
  }

  get defaultChat() {
    return {
      isTyping: false,
      isSendingMsg: false,
      messages: [],
    };
  }

  render() {
    const indexRedirectPath = this.isLoggedIn ?
      '/start-convo/' : '/login/';

    return (
      <div className="App">
        <SiteNav />
        <div className="mainContent">
          <Route
            path="/"
            exact
            render={() => <Redirect to={indexRedirectPath} />} />
          <Route
            path="/login/"
            exact
            render={
              () => this.isLoggedIn ?
                <Redirect to="/start-convo/" /> :
                <Login onLogin={this.handleLogin} />
            } />
          <Route path="/register/"
            exact
            render={
              props => <Register
                seed={this.state.registerSeed}
                onRegenerate={this.handleRegenerate} />
            } />
          <Route
            path="/start-convo/"
            exact
            render={this.requiresLogin(StartConvo,
              { onStartChat: this.handleStartChat })} />
          <Route
            path="/chat/:receiver"
            exact
            render={
              props => {
                const receiver = props.match.params.receiver;
                const convoState = this.state.chats[receiver] = 
                  this.state.chats[receiver] ||
                  this.defaultChat;

                return this.requiresLogin(Conversation, {
                  ...props,
                  ...convoState,
                  receiver,
                  onChatSend: this.handleChatSend,
                })(props);
              }
            } />
        </div>
      </div>
    );
  }
}

export default withRouter(App);
