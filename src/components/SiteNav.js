import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import copy from 'clipboard-copy';
import './SiteNav.scss';

class SiteNav extends Component {
  constructor(props) {
    super(props);
    this.handleCopyClick = this.handleCopyClick.bind(this);
  }

  handleCopyClick() {
    copy(this.props.userId);
  }

  render() {
    const peerIdEl = this.props.userId ?
      (
        <div className="flexHRight">
          <div>
            <div className="flexVCent gutterH peerId">
              <div>You: {this.props.userId.slice(0,10)}…</div>
              <button onClick={this.handleCopyClick}>Copy</button>
            </div>
          </div>
        </div>        
      ) : null;

    return (
      <nav className="SiteNav flexVCent gutterH">
        <div className="logo flexNoShrink"><div>🇩</div>CHAT</div> :
        <div className="flexNoShrink">
          <NavLink to="/start-chat/" activeClassName="active">💬 New Chat</NavLink>
        </div>
        {
          this.props.chats.map(chat => {
            const moreProps = {};

            if (chat.unread) {
              moreProps['data-unread'] = chat.unread  > 99 ? '…' : chat.unread;
            }

            return (
              <div key={chat.peerId} className="chatLink flexNoShrink">
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
        <div class="flexExpand">{peerIdEl}</div>
      </nav>
    );
  }
}

export default SiteNav;