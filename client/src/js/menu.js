import React, { Component } from 'react';
import classnames from 'classnames'
import hamburger from '../assets/hamburger2.png';

class Menu extends Component {
  state = {
    showMenu: false,
  }
  
  showMenu = (event) => {
    event.preventDefault();
    this.setState({ showMenu: !this.state.showMenu });
  }

  render() {
    return (
      <div className="attendance-menu">
        <button className="attendance-menu__button" onClick={this.showMenu}>
          <img
            src={hamburger}
            className="attendance-menu__icon"
            alt="Drop down menu"
          />
        </button>
        <div className={classnames('attendance-menu__contents', {[`display-contents`]: this.state.showMenu })}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default Menu;
