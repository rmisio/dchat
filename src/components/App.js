import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';
import IPFS from 'ipfs';
import { createFromB58String, createFromBytes } from 'peer-id'
import { fromByteArray } from 'base64-js';
import {
  generatePeerId,
  identityKeyFromSeed,
} from '../util/crypto';
import './App.scss';
import SiteNav from './SiteNav';
import Login from './Login';
import Register from './Register';
import StartConvo from './StartConvo';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registerSeed: null,
      registerSeedError: null,
      peerId: null,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);

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

  handleLogin(seed) {
    if (!seed || typeof seed !== 'string') {
      alert('I\'m gonna need a seed slick willy!');
    }

    identityKeyFromSeed(seed)
      .then(data => {
        const peerId = createFromBytes(data.peerId).toB58String();
        const privateKey = fromByteArray(data.privateKey);
        console.log(`A seed of "${seed.slice(0, 25)}…" gets you this peerId: ${peerId}`);
        const ipfsInitOpts = this.getIpfsNodeInitOpts(peerId, privateKey)
        const node = new IPFS(ipfsInitOpts);

        node.on('ready', () => {
        });
      })
      .catch(e => {
        alert(`There was an error generating your peerId: ${e.message}`);
      });
  }

  handleRegenerate() {
    this.generateRegisterSeed();
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
    return !!this.state.peerId;
  }

  render() {
    const indexRedirectPath = this.isLoggedIn ?
      '/start-convo/' : '/login/';

    return (
      <Router>
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
                props => <Login onLogin={this.handleLogin} />
              } />
            <Route path="/register/"
              exact
              render={
                props => <Register
                  seed={this.state.registerSeed}
                  onRegenerate={this.handleRegenerate} />
              } />
            <Route path="/start-convo/"
              exact
              component={StartConvo} />
              {/*
              render={
                props => <Register
                  seed={this.state.registerSeed}
                  onRegenerate={this.handleRegenerate} />
              } />
              */}
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
