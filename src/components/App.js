import React, { Component } from 'react';
import {
  Route,
  Redirect,
  withRouter,
} from 'react-router-dom';
import uuid4 from 'uuid/v4';
import crypto from 'crypto';
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

    // this.state.chats = {
    //   'QmVjLM8ieNfQfXGoA3E616qnQVziDk1J1Sbz2PCkFeGAay': {
    //     messages: [
    //       {
    //         id: uuid4(),
    //         outgoing: true,
    //         msg: 'You feelin the funk or what?',
    //         sending: false,
    //         failed: false,
    //       },
    //       {
    //         id: uuid4(),
    //         outgoing: true,
    //         msg: 'Hey!',
    //         sending: false,
    //         failed: false,
    //       },          
    //       {
    //         id: uuid4(),
    //         outgoing: false,
    //         msg: 'No doubt trey bingo. Why dont you try it on the west end so you could see if you could consolidate the peach trea with the left-over minutia? Eh!',
    //         sending: false,
    //         failed: false,
    //       },
    //     ],
    //     isTyping: false,
    //   },
    // }

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
    // return '/dns4/webchat.ob1.io/tcp/9999/wss/ipfs/QmSAumietCn85sF68xgCUtVS7UuZbyBi5LQPWqLe4vfwYb';
    return '/ip4/127.0.0.1/tcp/4003/ws/ipfs/QmSykrDTzsUy7SMvKaZwg6gewrd2mFkbmqH5AWprAzy2HJ';
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
            
            console.log(`connecting to the relay peer at ${this.ipfsRelayPeer}`);
            node.swarm.connect(this.ipfsRelayPeer, err => {
              if (err) {
                alert('Unable to connect to the relay peer. Are you sure it\'s ' +
                  ' running?');
                return console.error(err);
              }

              console.log('connected to relay peer');
            });

            // handle incoming messages
            node._libp2pNode.handle('dabears/1', (protocol, conn) => {
              console.log('pulling in incoming message');

              pull(
                conn,
                pull.collect((err, data) => {
                  if (err) {
                    return console.error('There was an error pulling in an incoming chat ' +
                      'message:', err);
                  }

                  // try {
                  //   const decodedChatMsg = this.ChatPB.decode(data[0]);
                  //   console.dir(decodedChatMsg);
                  // } catch (e) {
                  //   console.error('There was an error decoding the incoming message:', err);
                  // }

                  const msg = JSON.parse(data[0]);
                  console.dir(msg);
                  const curChatState = this.state.chats[msg.peerId] || this.defaultChat;

                  const chatState = {
                    ...curChatState,
                    messages: [
                      ...curChatState.messages,
                      {
                        id: msg.messageId,
                        outgoing: false,
                        msg: msg.message,
                        sending: false,
                        failed: false,
                      },
                    ],
                  }

                  this.setState({
                    chats: {
                      ...this.state.chats,
                      [msg.peerId]: chatState,
                    }
                  });
                  console.dir({
                    chats: {
                      ...this.state.chats,
                      [msg.peerId]: chatState,
                    }
                  });
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

    const msgId = uuid4();
    const peerIdFrom = this.state.userId;

    this.setState({
      chats: {
        ...this.state.chats,
        [peerId]: {
          ...chatState,
          messages: [
            ...chatState.messages,
            {
              id: msgId,
              outgoing: true,
              msg,
              sending: true,              
            }
          ]
        }
      },
    });

    const updateAfterSend = (failed=false) => {
      this.setState({
        chats: {
          ...this.state.chats,
          [peerId]: {
            ...this.state.chats[peerId],
            messages: this.state.chats[peerId].messages.map(msg => {
              if (msg.id === msgId) {
                return {
                  ...msg,
                  failed,
                  sending: false,
                }
              } else {
                return msg;
              }
            }),
          }
        },
      });      
    }

    const peer = `/p2p-circuit/ipfs/${peerId}`;
    console.log(`will send to ${peerId} at ${peer}`);

    this.node.swarm.connect(peer, err => {
      if (err) { 
        updateAfterSend(true);
        return console.error(err);
      }

      console.log(`connected to ${peerId}`);

      this.node._libp2pNode.dialProtocol(peer, 'dabears/1', (err, conn) => {
        if (err) { 
          updateAfterSend(true);
          return console.error(err);
        }

        const payload = this.getChatPayload(msg);
        // const Chat = this.ChatPB;
        // const chat = Chat.create(payload);
        // const serializedChat = Chat.encode(chat).finish();
        const serializedChat = JSON.stringify({
          ...payload,
          peerId: peerIdFrom,
        });

        console.log('pushing outgoing message');
        
        pull(
          pull.once(serializedChat),
          conn,
          pull.collect((err, data) => {
            if (err) { 
              // updateAfterSend(true);
              return console.error(err);
            }
            console.log('received echo:', data.toString())
            // updateAfterSend();
          }),            
        );

        updateAfterSend();
      });
    });
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
      messages: [],
    };
  }

  render() {
    const indexRedirectPath = this.isLoggedIn ?
      '/start-chat/' : '/login/';
    const chats = this.state.chats;

    return (
      <div className="App">
        <SiteNav chats={Object.keys(chats)} />
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
                <Redirect to="/start-chat/" /> :
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
            path="/start-chat/"
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
