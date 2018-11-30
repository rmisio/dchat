import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

class AppWrap extends Component {
  render() {
    return (
      <Router basename="/dchat"><App /></Router>
    );
  }
}

export default AppWrap;