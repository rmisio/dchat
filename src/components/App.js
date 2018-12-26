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
  relayConnect,
  openDirectMessage,
  sendChatMessage,
  sendOfflineChatMessage,
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
    //         offline: false,
    //         failed: false,
    //       },
    //       {
    //         id: uuid4(),
    //         outgoing: true,
    //         msg: 'Hey!',
    //         sending: false,
    //         offline: false,
    //         failed: false,
    //       },          
    //       {
    //         id: uuid4(),
    //         outgoing: false,
    //         msg: 'No doubt trey bingo. Why dont you try it on the west end so you could see if you could consolidate the peach trea with the left-over minutia? Eh!',
    //         sending: false,
    //         offline: false,
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
    this.updateChat(
      peerId,
      { unread: 0 },
      () => this.updateTitleCount()
    );
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
      },
      repo: `./ipfs/${peerId}`,
      init: { privateKey },
    }
  }

  handleInbounChatMessage(message, sender) {
    if (message.type !== 'CHAT') return;

    if (!message.message) return;

    const curChatState = this.state.chats[sender] || this.defaultChat;
    const curUnreadCount = curChatState.unread || 0;

    const chatState = {
      ...curChatState,
      unread: this.props.location.pathname
        .startsWith(`/chat/${sender}`) && document.hasFocus() ?
          0 : curUnreadCount + 1,
      messages: [
        ...curChatState.messages,
        {
          id: message.messageId,
          outgoing: false,
          msg: message.message,
          sending: false,
          failed: false,
        },
      ],
    }

    // TODO - make add chat message state function

    this.setState({
      chats: {
        ...this.state.chats,
        [sender]: chatState,
      }
    });

    if (!document.hasFocus()) {
      this.updateTitleCount();
    }
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
          node.libp2p.start(() => {
            this.node = node;
            console.log('the node is erode.');
            window.node = node;

            // todo: create a custom node class that extends the ipfs one so stuff like the identity
            // key can be added in, in a better way than a private prop.
            this.node.__identity = identity;

            this.setState({ userId: peerId });

            relayConnect(this.node);
            
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

                  console.log('this incoming data is moo:');
                  window.moo = data;

                  conn.getPeerInfo((err, peerInfo) => {
                    console.log('got the peer info.');

                    if (err) {
                      console.error(`Unable to obtain the peerInfo for a direct message: ${err}`);
                      return;
                    }

                    const sender = createFromBytes(peerInfo.id.id).toB58String();
                    const messages = [];
                    
                    data.forEach(msg => {
                      console.log('processing incoming msg');
                      console.dir(msg);

                      try {
                        messages.push(openDirectMessage(msg, sender, this.node));
                      } catch (e) {
                        console.error('Unable to open direct message');
                        console.error(e.stack);
                      }
                    });

                    if (!messages.length) return;

                    messages.forEach(msg => {
                      if (msg.type === 'CHAT') {
                        this.handleInbounChatMessage(msg, sender);
                      } else if (msg.type === 'ERROR') {
                        console.error(`Received an ERROR message: ${msg}`);
                      }
                    });
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
    const encoded = multihashes.encode(idBytesBuffer, 0x12);

    return {
      messageId: multihashes.toB58String(encoded),
      subject,
      message,
      timestamp: { seconds: Math.floor(timestamp / 1000), nanos: 0},
      flag: 0
    };
  }

  updateChat(peerId, state, cb) {
    if (!this.state.chats || !!this.state.chats.peerId) return;

    this.setState({
      chats: {
        ...this.state.chats,
        [peerId]: {
          ...this.state.chats[peerId],
          ...state,
        }
      }
    }, cb);
  }

  updateChatMessage(peerId, state, cb) {
    if (!state.id) {
      throw new Error('The state must include an id.');
    }

    if (!this.state.chats || !!this.state.chats.peerId) return;

    this.setState({
      chats: {
        ...this.state.chats,
        [peerId]: {
          ...this.state.chats[peerId],
          messages: this.state.chats[peerId].messages.map(msg => {
            if (msg.id === state.id) {
              return {
                ...msg,
                ...state,
              }
            } else {
              return msg;
            }
          }),
        }
      },
    }, cb);    
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

    // todo: make addMessage function
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

    const updateAfterSend = (failed = false) => {
      this.updateChatMessage(peerId, {
        id: msgId,
        failed,
        sending: false,
      });
    }

    const chatPayload = this.getChatPayload(msg);
    let onlineFailed = false;

    sendChatMessage(this.node, peerId, chatPayload)
      .then(() => {
        updateAfterSend();        
      })
      .catch(e => {
        // updateAfterSend(true);
        onlineFailed = true;
        console.error('Unable to send the message directly');
        console.error(e.stack);        
        console.log('Attempting to send offline.');
        return sendOfflineChatMessage(this.node, peerId, chatPayload);
      })
      .then(() => {
        if (!onlineFailed) return;
      })
      .catch(e => {
        console.error('There was an error sending the offline message.');
        console.error(e.stack);
      });

    // new Promise((resolve, reject) => {
    //   this.relayConnect()
    //     .then(() => {
    //       return this.node.swarm.connect(peer);
    //     })
    //     .then(() => {
    //       console.log(`connected to ${peerId}`);

    //       this.node._libp2pNode.dialProtocol(peer, '/openbazaar/app/1.0.0',
    //         (err, conn) => {
    //           if (err) reject(err);

    //           generateChatMessage(
    //             peerId,
    //             chatPayload,
    //             this.node.__identity,
    //           )
    //             .then(chatMsg => {
    //               resolve({ conn, chatMsg });
    //             })
    //             .catch(e => reject(e));
    //         });
    //     })
    //       .catch(e => reject(e));
    // })
    //   .then(data => {
    //     console.log('pushing outgoing message bam');
    //     window.bam = data.chatMsg;
            
    //     pull(
    //       pull.once(data.chatMsg),
    //       data.conn,
    //       pull.collect((err, data) => {
    //         if (err) { 
    //           return console.error(err);
    //         }
    //         console.log('received echo:', data.toString())
    //         window.echo = data;
    //       }),            
    //     );

    //     updateAfterSend();
    //   })

  }

  handleConvoDidMount(receiver) {
    this.updateChat(receiver, { unread: 0 });
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
