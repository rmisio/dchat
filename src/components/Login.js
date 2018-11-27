import React, { Component } from 'react';
import '../style/util.scss';
import '../style/layout.scss';
import './Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { seed: '' };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    console.log('mad props');
    window.props = props;
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleLoginClick() {
    this.props.onLogin(this.state.seed);
  }

  render() {
    return (
      <div className="Login">
        <h1 className="rowLg txRt">Who be you?</h1>
        <input
          type="text"
          placeholder="Enter your seed"
          className="width100 rowMd"
          name="seed"
          onChange={this.handleInputChange} />
        <div className="flexVCent">
          <div className="flexNoShrink">
            <a>I don't have a seed 😞</a>
          </div>
          <div className="flexHRight">
            <button onClick={this.handleLoginClick}>Login</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
