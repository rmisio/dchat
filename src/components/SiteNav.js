import React, { Component } from 'react';
import './SiteNav.scss';

class SiteNav extends Component {
  render() {
    return (
      <nav className="SiteNav">
        <div className="logo"><div>🇩</div>CHAT</div>
        <ul>
          { /*            
          <li>
            <NavLink to="/" className="navlink" activeClassName="active" exact>Home</NavLink>
          </li>
          <li>
            <NavLink to="/about/" className="navlink" activeClassName="active" exact>About</NavLink>
          </li>
          <li>
            <Link to="/users/">Users</Link>
          </li>
          */ }
        </ul>
      </nav>
    );
  }
}

export default SiteNav;