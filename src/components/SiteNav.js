import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import './SiteNav.scss';

class SiteNav extends Component {
  render() {
    return (
      <nav className="SiteNav flexVCent gutterH">
        <div className="logo"><div>🇩</div>CHAT</div> :
        <div>
          <NavLink to="/start-chat/" activeClassName="active">💬 New Chat</NavLink>
        </div>
        {
          this.props.chats.map(peerId => (
            <div key={peerId}>
              <NavLink to={`/chat/${peerId}`} activeClassName="active">{peerId.slice(0, 10)}…</NavLink>
            </div>
          ))
        }
      </nav>
    );
  }
}

export default SiteNav;