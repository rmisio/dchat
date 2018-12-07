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
import {
  generateChatMessage,
  openMessage,
} from '../util/messaging';
import jsonDescriptor from '../message.json';
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

    this.handleWindowFocus = this.handleWindowFocus.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);
    this.handleStartChat = this.handleStartChat.bind(this);
    this.handleChatSend = this.handleChatSend.bind(this);

    this.generateRegisterSeed();
  }

  get baseDocTitle() {
    return 'dChat';
  }

  handleWindowFocus() {
    const url = new URL(window.location.href);

    if (window.location.pathname.startsWith('/chat/')) {
      const split = window.location.pathname.split('/');
      const peerId = split[2];
      this.clearUnreadCount(peerId);
    }
  }

  updateTitleCount() {
    let totalUnreads = 0;

    Object.keys(this.state.chats)
      .forEach(chat => totalUnreads += this.state.chats[chat].unread || 0);

    if (totalUnreads) {
      document.title = `${this.baseDocTitle} - ${totalUnreads}`;
    } else {
      document.title = this.baseDocTitle;
    }
  }

  componentDidMount() {
    window.addEventListener('focus', this.handleWindowFocus);
  }

  componentWillUnmount() {
    window.removeEventListener('focus', this.handleWindowFocus);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.location.pathname !== this.props.location.pathname &&
      this.props.location.pathname.startsWith('/chat/')
    ) {
      const split = this.props.location.pathname.split('/');
      const peerId = split[2];
      this.clearUnreadCount(peerId);
    }
  }

  clearUnreadCount(peerId) {
    if (peerId && this.state.chats[peerId]) {
      this.setState({
        chats: {
          ...this.state.chats,
          [peerId]: {
            ...this.state.chats[peerId],
            unread: 0,
          }
        }
      },
      () => this.updateTitleCount());
    }
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
    return '/dns4/webchat.ob1.io/tcp/9999/wss/ipfs/QmSAumietCn85sF68xgCUtVS7UuZbyBi5LQPWqLe4vfwYb';
  }

  relayConnect() {
    if (this._relayConnectPromise) {
      return this._relayConnectPromise;
    }

    return new Promise((res, rej) => {
      const always = () => this._relayConnectPromise = null;
      const resolve = (...args) => {
        always();
        res(...args);
      };
      const reject = (...args) => {
        always();
        resolve(...args);
      };

      if (!this.moo || this.moo < 3) {
        this.moo = this.moo ? this.moo++ : 0;
        reject();
      }

      if (!this.node) {
        reject(new Error('There is no active IPFS node.'));
        return;
      }

      this.node._libp2pNode.dialFSM(this.ipfsRelayPeer, '/openbazaar/app/1.0.0', (err, connFSM) => {
        if (err) {
          alert('Unable to connect to the relay peer. Are you sure it\'s ' +
            'running?');
          console.error(`Unable to connect to the relay peer at ${this.ipfsRelayPeer}.`);
          console.error(err);
          reject(err);
          return;
        }

        console.log('connected to the relay');
        connFSM.on('close', () => this.relayConnect());
        resolve();
      });
    });
  }

  handleLogin(seed) {
    if (!seed || typeof seed !== 'string') {
      alert('I\'m gonna need a seed slick willy!');
    }

    // todo: need some isLoggingIn state.
    identityKeyFromSeed(seed)
      .then(identity => {
        const peerId = createFromBytes(identity.peerId).toB58String();
        const privateKey = fromByteArray(identity.privateKey);
        console.log(`A seed of "${seed.slice(0, 25)}…" gets you this peerId: ${peerId}`);
        const ipfsInitOpts = this.getIpfsNodeInitOpts(peerId, privateKey)
        const node = new IPFS(ipfsInitOpts);

        node.on('ready', () => {
          node.libp2p.start((...args) => {
            this.node = node;
            this.identity = identity;
            this.setState({ userId: peerId });

            this.relayConnect();
            
            // handle incoming messages
            node._libp2pNode.handle('/openbazaar/app/1.0.0', (protocol, conn) => {
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

                  console.log('this incoming data is:');
                  console.dir(data);

                  let msg;

                  try {
                    msg = openMessage(data, this.identity);
                  } catch (e) {
                    console.error('Unable to open the incoming message.');
                    console.error(e);
                    return;
                  }

                  console.log('gotz me an new incoming msg:');
                  console.dir(msg);

                  if (msg.type !== 'CHAT') return;

                  const curChatState = this.state.chats[msg.receiverId] || this.defaultChat;
                  const curUnreadCount = curChatState.unread || 0;

                  const chatState = {
                    ...curChatState,
                    unread: this.props.location.pathname
                      .startsWith(`/chat/${msg.peerId}`) && document.hasFocus() ?
                        0 : curUnreadCount + 1,
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

                  if (!document.hasFocus()) {
                    this.updateTitleCount();
                  }
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

    this.relayConnect()
      .then(() => {
        this.node.swarm.connect(peer, err => {
          if (err) { 
            updateAfterSend(true);
            return console.error(err);
          }

          console.log(`connected to ${peerId}`);

          this.node._libp2pNode.dialProtocol(peer, '/openbazaar/app/1.0.0', (err, conn) => {
            if (err) { 
              updateAfterSend(true);
              return console.error(err);
            }

            generateChatMessage(
              peerId,
              this.identity,
              this.getChatPayload(msg),
            ).then(
              encodedChatMsg => {
                console.log('pushing outgoing message');
                console.log(encodedChatMsg);
                
                pull(
                  pull.once(encodedChatMsg),
                  conn,
                  pull.collect((err, data) => {
                    if (err) { 
                      return console.error(err);
                    }
                    console.log('received echo:', data.toString())
                  }),            
                );

                updateAfterSend();
              },
              err => {
                console.error(err);
                updateAfterSend(true);
              }
            );
          });
        });
      })
      .catch(e => {
        console.error(e);
        updateAfterSend(true)
      });
  }

  handleConvoDidMount(receiver) {
    const receiverChatState = this.state.chats[receiver];

    if (receiverChatState) {
      this.setState({
        chats: {
          ...this.state.chats,
          [receiver]: {
            ...receiverChatState,
            unread: 0,
          }
        }
      })
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
      messages: [],
    };
  }

  render() {
    const indexRedirectPath = this.isLoggedIn ?
      '/start-chat/' : '/login/';
    const chats = this.state.chats;
    const siteNavChats = Object.keys(chats)
      .map(peerId => ({
        peerId,
        unread: chats[peerId].unread,
      }));

    return (
      <div className="App">
        <SiteNav chats={siteNavChats} userId={this.state.userId} />
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
                  componentDidMount: () => this.handleConvoDidMount(receiver),
                })(props);
              }
            } />
        </div>
      </div>
    );
  }
}

export default withRouter(App);
