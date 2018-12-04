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
          this.props.chats.map(chat => {
            const moreProps = {};

            if (chat.unread) {
              moreProps['data-unread'] = chat.unread  > 99 ? '…' : chat.unread;
            }

            return (
              <div key={chat.peerId} className="chatLink">
                <NavLink
                  to={`/chat/${chat.peerId}`}
                  activeClassName="active"
                  {...moreProps}>
                  {chat.peerId.slice(0, 10)}…
                </NavLink>
              </div>
            )
          })
        }
      </nav>
    );
  }
}

export default SiteNav;