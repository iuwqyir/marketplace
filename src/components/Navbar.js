import React, { Component } from 'react';

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <div className="navbar-collapse collapse order-1 order-md-0 dual-collapse2">
          <a className="navbar-brand mr-auto px-3" href="#">
            Marketplace
          </a>
        </div>
        <div className="navbar-collapse collapse order-2 dual-collapse2">
          <ul className="navbar-nav px-3 ml-auto">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block px-3">
              <small className="text-white"><span id="account">{this.props.account}</span></small>
            </li>
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              {
                this.props.balance
                ? <button 
                    className="btn btn-success btn-sm"
                    onClick={(event) => {
                      this.props.withdraw();
                    }}
                  >
                    Withdraw {this.props.balance} Ether
                  </button>
                : ''
              }
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Navbar;
