import React, { Component } from 'react';
import './StartConvo.scss';

class StartConvo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      receiverPeerId: '',
    };    
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div className="StartConvo">
        <h1 className="rowLg txRt">Who ya wanna chat with?</h1>
        <input
          type="text"
          placeholder="Enter a peerId"
          className="width100 rowMd"
          name="receiverPeerId"
          onChange={this.handleInputChange} />
        <div className="flex">
          <div className="flexHRight">
            <button onClick={() => this.props.onStartChat(this.state.receiverPeerId)}>Chat</button>
          </div>
        </div>
      </div>
    );
  }
}

export default StartConvo;
