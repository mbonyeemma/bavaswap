import React, {  } from 'react';



function Header() {

  
  return (
    <header className="header__1 js-header" id="header">
    <div className="container">
        <div className="wrapper js-header-wrapper">
            <div className="header__logo">
                <a href="index-2.html">
                    <img className="header__logo" id="logo_js" src="assets/img/logos/logo.png" alt="logo" />
                </a>
            </div>
            
            
            <div className="header__menu">
                <ul className="d-flex space-x-20">
                     <li> <a className="color_black" href="Marketplace.html"> Chain Swap</a> </li>
                    <li> <a className="color_black" href="Collections.html"> Track Transaction</a> </li>
                        <li className="has_popup">
                        <a className="color_black" href="#"
                            >BlockChain Explorers <i className="ri-more-2-fill"></i
                        ></a>
                        <ul className="menu__popup space-y-20">
                            <li>
                                <a href="index-2.html">
                                    <i className="ri-home-smile-2-line"></i>
                                    Stellar Expert
                                </a>
                            </li>
                            <li>
                                <a href="Home2.html">
                                    <i className="ri-home-2-line"></i> Ether scan</a
                                >
                            </li>
                            <li>
                                <a href="Home3.html">
                                    <i className="ri-home-5-line"></i> Binance Scan</a
                                >
                            </li>
                        </ul>
                    </li>							 </ul>
            </div>
            

            <div className="header__btns">
                <a className="btn btn-grad btn-sm" href="Connect-wallet.html">
                    <i className="ri-wallet-3-line"></i>
                    Connect wallet
                </a>
            </div>
            <div className="header__burger js-header-burger"></div>

            <div className="header__mobile js-header-mobile">
                <div className="header__mobile__menu space-y-40">
                    <div className="space-y-20">
                        <div className="header__search in_mobile w-full">
                            <input type="text" placeholder="Search" />
                            <button className="header__result">
                                <i className="ri-search-line"></i>
                            </button>
                        </div>
                        <a className="btn btn-grad btn-sm" href="Connect-wallet.html">Connect wallet</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
  );
}

export default Header;
