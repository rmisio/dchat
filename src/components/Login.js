import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../style/util.scss';
import '../style/layout.scss';
import './Login.scss';

class Login extends Component {
  constructor(props) {
    super(props);
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
            <Link to="/register">I don't have a seed 😞</Link>
          </div>
          <div className="flexHRight">
            <button onClick={() => this.props.onLogin(this.state.seed)}>Login</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
