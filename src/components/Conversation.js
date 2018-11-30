import React, { Component } from 'react';
import './Conversation.scss';

class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chatText: '',
    };
    this.handleInputChange = this.handleInputChange.bind(this);

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

  componentDidMount() {
    const messagesEl = this.messagesRef.current;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  render() {
    const failedInfoMsg =
      'The most likely reason in the person you are chatting with is offline. This app ' +
      'does not support offline messages at this time. If you are sure the other party is ' +
      'online, it\'s possible that both your ports are blocked and you are unable to connect ' +
      'to the relay server.';

    const failedInfo =
      this.props.messages.find(msg => msg.failed) ?
        (
          <div class="failedInfo">
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
                onChange={this.handleInputChange} />
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
