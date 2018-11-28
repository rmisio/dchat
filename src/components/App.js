import React, { Component } from 'react';
import { BrowserRouter as Route } from 'react-router-dom';
import { generatePeerID } from '../util/crypto';
import './App.scss';
import SiteNav from './SiteNav';
import Login from './Login';
import Register from './Register';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { registerSeed: '' };
    this.handleLogin = this.handleLogin.bind(this);
    console.dir(props);
  }

  componentDidUpdate(prevProps) {
    console.dir(this.props);
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

  render() {
    return (
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
              props => <Register seed={this.state.registerSeed} />
            } />
          { /*
          <Route path="/users/" component={Users} />
          */ }
        </div>
      </div>
    );
  }
}

export default App;
