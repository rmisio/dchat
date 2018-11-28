import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import IPFS from 'ipfs';

class Home extends Component {
  get node() {
    return this._node;
  }

  createIpfsNode() {
    if (this.node) return this.node;

    this._node = new IPFS({ repo: String(Math.random() + Date.now()) });
    this._node.once('ready', () => this.onIpfsNodeReady());
  }

  onIpfsNodeReady() {
    console.log('slick');
    window.slick = this.node;

    this.node.id((err, res) => {
      if (err) throw err;

      console.dir(res);
    });
  }

  componentDidMount() {
    this.createIpfsNode();
  }

  render() {
    return (
      <p>I love you, you love me, we're a happy family!</p>
    );
  }
}

export default Home;
