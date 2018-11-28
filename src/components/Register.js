import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../style/util.scss';
import '../style/layout.scss';
import './Register.scss';

class Register extends Component {
  render() {
    let seed = this.props.seed;

    if (!seed) {
      seed = <div className="center">Generating…</div>;
    }

    return (
      <div className="Register">
        <h1 className="rowLg txRt">You do now!</h1>
        <div className="border seed rowMd">{seed}</div>
        <div className="flexVCent">
          <div className="flexNoShrink">
            <a onClick={() => this.props.onRegenerate()}>Re-generate</a>
          </div>
          <div className="flexHRight">
            <Link to="/">⬅️Back</Link>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
