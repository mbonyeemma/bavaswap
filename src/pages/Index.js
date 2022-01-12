import React, {useState} from 'react';
import swap from '../swap.png';
import metamask from '../icons/metamask.png';
import rabet from '../icons/rabbet.jpg';

import {ToastProvider, useToasts} from 'react-toast-notifications';

function Index({history}) {
  const [isPaying, setPaying] = useState (false);
  const [wrappedTokens, setWrappedToken] = useState ([
    ['wHODL', 'POLYGON'],
    ['bHODL', 'Binance'],
  ]);
  const [hodl, setHodl] = useState ([['HODL', 'stellar']]);
  const [chainFrom, setFromChain] = useState (hodl);
  const [chainto, setToChain] = useState (wrappedTokens);
  const [receivingAccount, setReceivingAccount] = useState ('');
  const [fromchain, setFromchainValue] = useState ('');
  const [tochain, setTochainvalue] = useState ('');
  const {addToast} = useToasts ();
  const [hasMetamask, setHasMetamask] = useState(false);
  const [hasRabet, setHasRabet] = useState(false);
  const [fromchainName, setFromchainName] = useState('');
  const [tochainname, setTochainName] = useState('');

  const [inputField, setInputField] = useState([{"xlmAddress":'',"ethAddress":''}]);

  const inputsHandler = e => {
    setInputField({
      ...inputField,
      [e.target.name]: e.target.value,
    });
  };


  const MakeItem = X => {
    return <option value={X} >{X[0]} ({X[1]})</option>;
  };
  const MakeToItem = X => {
    return <option value={X}>{X[0]} ({X[1]})</option>;
  };

  const swapUi = () => {
    setFromChain (chainto);
    setToChain (chainFrom);
  };
  const showPayment = () => {
    if (receivingAccount == '') {
      addToast ('Enter a valid  receiving address', {appearance: 'error'});
      return;
    }
    setPaying (true);
  };

  const cancel = () => {
    setPaying (false);
  };

  const updateReceivingAccount = e => {
    var v = e.target.value;
    setReceivingAccount (v);
  };

  const handlefromChange = e => {
    var v = e.target.value;
    setFromchainValue (v);
  };

  const handleToChange = e => {
    var v = e.target.value;
    setTochainvalue (v);
  };

  const OpenMetamask = wallet => {
    if (window.ethereum) {
      setHasMetamask(true);
      connect(wallet);
    } else {
      setHasMetamask(false);
      addToast ('MetaMask extension not found', {appearance: 'error'});

    }
  };

  function connect(wallet) {
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(data => {
        var eth = data[0];
        setReceivingAccount(eth)
       
      })
      .catch(error => {
        if (error.code === 4001) {
          addToast ('Please connect to MetaMask', {appearance: 'error'});

        } else {
          console.error(error);
        }
      });
  }

  const OpenRabet = () => {
    if (window.rabet) {
      setHasRabet(true);
      window.rabet
        .connect()
        .then(result => {
        
          setReceivingAccount(result.publicKey)
          addToast('connected', { appearance: 'success' });
        })
        .catch(error => {
          addToast('Operation cancelled', { appearance: 'error' });
        });
    } else {
      setHasRabet(false);
      addToast('Rabet not installed', { appearance: 'error' });

    }
  };

  return (
    <div className="overflow-hidden">

      {!isPaying
        ? <div className="requests">
            <div className="container">
              <div className="row gx-5 justify-content-center">
                <div className="col-lg-8 col-md-10 requests__content">
                  <div className="requests__wrap space-y-20">
                    <div>
                      <h3 className="text-left">Stellar - EVM Swap</h3>
                    </div>
                    <div className="box is__big">
                      <div className="space-y-20 mb-0">
                        <div className="space-y-10">
                          <span className="nameInput">Swap From</span>
                          <div className="row">
                            <div className="col-12">
                              <select
                                className="form-select custom-select"
                                aria-label="Default select example"
                                                        value={fromchain}
                                                        onChange={handlefromChange}
                              >
                                {chainFrom.map (MakeItem)}

                              </select>
                            </div>

                          </div>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            marginTop: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            className="makehref"
                            onClick={swapUi}
                            style={{color: 'black', width: 50}}
                            src={swap}
                          />
                        </div>
                        <div className="space-y-10">
                          <span className="nameInput">Swap To</span>
                          <div className="row">
                            <div className="col-12">
                              <select
                                className="form-select custom-select"
                                aria-label="Default
                                                        select example"
                                value={tochain}
                                onChange={handleToChange}
                              >
                                {chainto.map (MakeToItem)}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-10">
                          <span className="nameInput">Receiving address</span>

                          <div className="row">
                            <div className="col-11">
                              <input
                                type="text"
                                value={receivingAccount}
                                name="receivingAccount"
                                onChange={updateReceivingAccount}
                                placeholder="Enter your address here"
                                className="form-control"
                              />
                              
                            </div>
                            <div className="col-1">
                          

                                     {fromchainName =='stellar'? <a
                                        href="#"
                                        onClick={() =>
                                          OpenRabet('ethAddress')}
                                      >
                                        <img
                                          src={rabet}
                                          alt=""
                                          height="25"
                                        />
                                      </a>:  <a
                                        href="#"
                                        onClick={() =>
                                          OpenMetamask('ethAddress')}
                                      >
                                        <img
                                          src={metamask}
                                          alt=""
                                          height="25"
                                        />
                                      </a>}
                                </div>
                           

                          </div>
                        </div>

                        



                       

                        <div className="requests_footer">
                          <div>
                            <a
                              href="#"
                              onClick={showPayment}
                              className="btn btn-grad"
                            >
                              Continue to payment
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        : <div />}

      {isPaying
        ? <div className="requests">
            <div className="container">
              <div className="row gx-5 justify-content-center">
                <div className="col-lg-8 col-md-10 requests__content">
                  <div className="requests__wrap space-y-20">
                    <div>
                      <h3 className="text-left">Make payment</h3>
                    </div>
                    <div className="box is__big">
                      <div className="space-y-20 mb-0">
                        <div className="space-y-10">
                          <span className="nameInput">
                            Send HODL to this address
                          </span>
                          <div>
                            <div className="space-y-10">
                              <input
                                type="text"
                                value="GDS7SSSF78SJKLK89K8FD6G986HDL907SSSER4RFF78SJKLK8932KMSA8"
                                disabled
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-10">
                          <span className="nameInput">Memo( Required)</span>
                          <div>
                            <div className="space-y-10">
                              <input
                                type="text"
                                value="1029021"
                                disabled
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-10">
                          <p className="nameInput">Tokens will be sent to</p>
                          <div>
                            <div className="space-y-10">
                              <p type="text" disabled>{receivingAccount}</p>
                            </div>
                          </div>
                        </div>

                        <div className="requests_footer">
                          <div>
                            <a
                              style={{margin: 10}}
                              href="#"
                              onClick={cancel}
                              className="btn btn-grad"
                            >
                              Back
                            </a>
                            <a
                              style={{margin: 10}}
                              href="#"
                              onClick={cancel}
                              className="btn btn-grad"
                            >
                              Pay with Rabet
                            </a>
                            <a
                              style={{margin: 10}}
                              href="#"
                              onClick={cancel}
                              className="btn btn-grad"
                            >
                              Pay with Freighter
                            </a>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        : <div />}
    </div>
  );
}

export default Index;
