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
    return (
      <div className="Conversation">
        <h1>
          {this.props.receiver.slice(0, 20)}
          {this.props.receiver.length > 20 ? '…' : ''}
        </h1>
        <ul className="messages unstyled" ref={this.messagesRef}>
          {
            this.props.messages.map(msg => {
              const msgClass = msg.outgoing ? 'outgoing' : '';
              return <li className={msgClass} key={msg.id}>{msg.msg}</li>
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
                () => this.props.onChatSend(this.props.receiver, this.state.chatText)
              }>Send</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Conversation;
