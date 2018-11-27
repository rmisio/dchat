import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../style/util.scss';
import '../style/layout.scss';
import './Register.scss';

class Register extends Component {
  render() {
    let seed = this.props.seed;

    if (!seed) {
      seed = 'Generating…';
    }

    return (
      <div className="Register">
        <h1 className="rowLg txRt">You do now!</h1>
        <div className="border seed rowMd">{seed}</div>
        <div className="flex">
          <div className="flexHRight">
            <Link to="/">⬅️Back</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
