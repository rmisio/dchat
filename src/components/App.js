import React, { Component } from 'react';
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import { generatePeerID } from '../util/crypto';
import './App.scss';
import SiteNav from './SiteNav';
import Login from './Login';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
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
      <Router>
        <div className="App">
          <SiteNav />
          <div className="mainContent">
            <Route
              path="/"
              exact
              render={props => <Login onLogin={this.handleLogin} />} />
            { /*
            <Route path="/about/" component={About} />
            <Route path="/users/" component={Users} />
            */ }
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
