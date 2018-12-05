import React, { Component } from 'react';
import './Conversation.scss';

class Conversation extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      chatText: '',
    };
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleChatTextKeyUp = this.handleChatTextKeyUp.bind(this);

    this.messagesRef = React.createRef();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleChatTextKeyUp(e) {
    if (e.keyCode === 13) {
      this.setState({ chatText: '' });
      this.props.onChatSend(this.props.receiver, this.state.chatText);
    }
  }

  componentDidMount() {
    const messagesEl = this.messagesRef.current;
    messagesEl.scrollTop = messagesEl.scrollHeight;
    this.props.componentDidMount();
  }

  componentWillReceiveProps(nextProps) {
    const messagesEl = this.messagesRef.current;
    const curLastMessage = this.props.messages[this.props.messages.length - 1];
    const nextLastMessage = nextProps.messages[nextProps.messages.length - 1];

    if (
      nextLastMessage &&
      (!curLastMessage || curLastMessage.id !== nextLastMessage.id) &&
      messagesEl.scrollTop >= messagesEl.scrollHeight - messagesEl.offsetHeight - 15
    ) {
      // if we're scrolled at or very near the bottom and a new message comes
      // in, we'll scroll down to the end.
      this.scrollTo = messagesEl.scrollHeight;
    }
  }

  componentDidUpdate() {
    const messagesEl = this.messagesRef.current;

    if (typeof this.scrollTo === 'number') {
      messagesEl.scrollTop = this.scrollTo;
    }

    this.scrollTo = null;
  }

  render() {
    const failedInfoMsg =
      'The most likely reason in the person you are chatting with is offline. Offline messages ' +
      'are not supported at this time. The other main reason would be that either you or the ' +
      'receiver are not connected to the relay server.';

    const failedInfo =
      this.props.messages.find(msg => msg.failed) ?
        (
          <div className="failedInfo">
            <a onClick={() => alert(failedInfoMsg)}>Why have some of my messages failed?</a>
          </div>
        ) : null;

    return (
      <div className="Conversation">
        <div className="chatContent rowLg">
          <h1>
            {this.props.receiver.slice(0, 20)}
            {this.props.receiver.length > 20 ? '…' : ''}
          </h1>
          <ul className="messages unstyled" ref={this.messagesRef}>
            {
              this.props.messages.map(msg => {
                let statusEl = null;
                
                if (msg.sending) {
                  statusEl = <span>📡</span>
                } else if (msg.failed) {
                  statusEl = <span>❌</span>
                }

                const msgClass = msg.outgoing ? 'outgoing' : '';
                return (
                  <div  className={msgClass} key={msg.id}>
                    <div className="status">{statusEl}</div>
                    <li>{msg.msg}</li>
                  </div>
                );
              })
            }
          </ul>
          <div className="flexVCent gutterH">
            <div className="flexExpand">
              <input
                type="text"
                className="width100"
                placeholder="Say something clever..."
                name="chatText"
                value={this.state.chatText}
                onChange={this.handleInputChange}
                onKeyUp={this.handleChatTextKeyUp} />
            </div>
            <div>
              <div className="flexHRight">
                <button onClick={
                  () => {
                    this.setState({ chatText: '' });
                    this.props.onChatSend(this.props.receiver, this.state.chatText);
                  }
                }>Send</button>
              </div>
            </div>
          </div>
        </div>
        {failedInfo}
      </div>
    );
  }
}

export default Conversation;
