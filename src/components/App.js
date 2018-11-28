import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { generatePeerID } from '../util/crypto';
import './App.scss';
import SiteNav from './SiteNav';
import Login from './Login';
import Register from './Register';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      registerSeed: null,
      registerSeedError: null,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegenerate = this.handleRegenerate.bind(this);

    this.generateRegisterSeed();
  }

  handleLogin(seed) {
    if (!seed || typeof seed !== 'string') {
      alert('I\'m gonna need a seed slick willy!');
    }

    generatePeerID(seed)
      .then(data => {
        console.dir(data);
      })
      .catch(e => {
        alert(`There was an error generating your peerId: ${e.message}`);
      });
  }

  handleRegenerate() {
    this.generateRegisterSeed();
  }

  generateRegisterSeed() {
    generatePeerID()
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
          console.error('There was an error gnerating the register seed.', err);
        }
      );
  }

  render() {
    return (
      <Router>
        <div className="App">
          <SiteNav />
          <div className="mainContent">
            <Route
              path="/"
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
            { /*
            <Route path="/users/" component={Users} />
            */ }
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
