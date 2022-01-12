import React, {useState} from 'react';
import {
  isConnected,
  getPublicKey,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';
import {ethers} from 'ethers';
import {MdCancel} from 'react-icons/md';
import {FaRegCheckCircle} from 'react-icons/fa';
import ReactSession from '../modals/ReactSession';
import InstallWallet from './InstallWallet';
import {ToastProvider, useToasts} from 'react-toast-notifications';
import {utils}  from '../modals/utils'
const ConnectWallet = ({wallets, isShowing, Cancel, setConnected}) => {
  ReactSession.setStoreType ('sessionStorage');
  const {addToast} = useToasts ();

  const [publicKey, setPublicKey] = useState (ReactSession.get ('XLM'));
  const [ethKey, setethKey] = useState (ReactSession.get ('ETH'));
  const [hasFreighter, setHasFreighter] = useState (false);
  const [hasRabet, setHasRabet] = useState (false);
  const [showError, setShowError] = useState (false);
  const [hasMetamask, setHasMetamask] = useState (false);
  const [enablefreighter, Setenablefreighter] = useState (false);

  const checkMetaMask = () => {
    if (window.ethereum) {
      setHasMetamask (true);
      connect ();
    } else {
      setShowError (true);
      setHasMetamask (false);

      console.log ('Please install MetaMask!');
    }
  };

  function connect () {
    window.ethereum
      .request ({method: 'eth_requestAccounts'})
      .then (handleAccountsChanged)
      .catch (error => {
        if (error.code === 4001) {
          console.log ('Please connect to MetaMask.');
        } else {
          console.error (error);
        }
      });
  }
  const handleAccountsChanged = data => {
    var eth = data[0];
    setethKey (eth);
    Login ('ETH', eth);
  };



  const retrievePublicKey = async () => {
    let publicKey = '';
    let error = '';

    try {
      publicKey = await getPublicKey ();
      setPublicKey (publicKey);
      if (publicKey != '') {
        setConnected (publicKey);
      } else {
        setShowError (true);
        setHasFreighter (false);
      }
    } catch (e) {
      error = e;
    }

    if (error) {
      return error;
    }

    return publicKey;
  };

  const retrieveNetwork = async () => {
    let network = '';
    let error = '';

    try {
      network = await getNetwork ();
    } catch (e) {
      error = e;
    }

    if (error) {
      return error;
    }

    return network;
  };
  const OpenRabet = () => {
    if (window.rabet) {
      window.rabet
        .connect ()
        .then (result => {
          Login ('XLM', result.publicKey);
        })
        .catch (error => {
          console.log ('Error', error);
          addToast ('Error', {appearance: 'error'});
        });
    } else {
      setShowError (true);
      setHasRabet (false);
    }
  };


  return (
    <div className={isShowing ? 'switched-styles show' : 'switched-styles'}>
      <h4>Connect Wallet</h4>
      <div>

        {!hasMetamask
          ? <InstallWallet
              show={showError}
              error={setShowError}
              Wallet="MetaMask"
              link="https://metamask.io/"
            />
          : <div />}

        {!hasFreighter
          ? <InstallWallet
              show={showError}
              error={setShowError}
              Wallet="Freighter"
              link="https://freighter.app"
            />
          : <div />}

        {!hasRabet
          ? <InstallWallet
              show={showError}
              error={setShowError}
              Wallet="Rabet"
              link="https://rabet.io/"
            />
          : <div />}

        <div className="proposals-sidebar">
          <a href="#" className="pointer" onClick={() => checkMetaMask ()}>
            <div className="proposals-sidebar-box">
              <h3 className="theme-title">
                <img src="./metamask.png" alt="" height="25" /> MetaMask
                {ethKey == undefined ? '' : <FaRegCheckCircle color="green" />}

              </h3>
              <p className="theme-description">
                {ethKey == undefined ? 'Connect with MetaMask' : ethKey}
              </p>

            </div>
          </a>
          {enablefreighter
            ? <a href="#" onClick={() => retrievePublicKey ()}>
                <div className="proposals-sidebar-box">
                  <h3 className="theme-title">
                    <div>
                      <img src="./freighter.png" alt="" height="25" /> Freighter
                      {publicKey == undefined
                        ? ''
                        : <FaRegCheckCircle color="green" />}

                    </div>
                  </h3>

                  <p className="theme-description">
                    {publicKey == undefined
                      ? 'Connect with Freighter'
                      : publicKey}
                  </p>
                </div>
              </a>
            : <div />}
          <a href="#" onClick={() => OpenRabet ()}>
            <div className="proposals-sidebar-box">
              <h3 className="theme-title">
                <img src="./rabbet.jpg" alt="" height="25" /> Rabet
                {publicKey == undefined
                  ? ''
                  : <FaRegCheckCircle color="green" />}

              </h3>
              <p className="theme-description">
                {publicKey == undefined ? 'Connect with Rabet' : publicKey}
              </p>
            </div>
          </a>

        </div>
      </div>

      <div className="hide-button" onClick={Cancel}>×</div>
    </div>
  );
};

export default ConnectWallet;
