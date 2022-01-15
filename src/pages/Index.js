import React, {useState,useEffect} from 'react';
import QRCode from 'qrcode.react';

import swap from '../swap.png';
import metamask from '../icons/metamask.png';
import rabet from '../icons/rabbet.jpg';
import {Spinner} from 'react-bootstrap';
//var StellarSdk = require('stellar-sdk');
//const server = new StellarSdk.Server ("https://horizon.stellar.org");
import {ToastProvider, useToasts} from 'react-toast-notifications';

function Index({history}) {
  const [isPaying, setPaying] = useState (false);
  const [wrappedTokens, setWrappedToken] = useState ([
    ['wHODL', 'polygon'],
    ['bHODL', 'binance'],
  ]);
  const [hodl, setHodl] = useState ([['HODL', 'stellar']]);
  const [chainFrom, setFromChain] = useState (hodl);
  const [chainto, setToChain] = useState (wrappedTokens);
  const [receivingAccount, setReceivingAccount] = useState ('');
  const [fromchainvalue, setFromchainValue] = useState ('stellar');
  const [tochainvalue, setTochainvalue] = useState ('polygon');
  const {addToast} = useToasts ();
  const [hasMetamask, setHasMetamask] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasRabet, setHasRabet] = useState(false);
  const [memo, setmemo] = useState('');
  const [pay_in_address, setPayInAddress] = useState('');
  const [txn_resp_completed, setCompleted] = useState('');
  const [txn_resp_received, setReceived] = useState('');
  const [tx_status, setStatus] = useState('pending');
  const [intervalId, setIntervalId] = useState(null);
  const [listen, setlisten] = useState(null);
  const [showPayQr, setShowPayQR] = useState(false);
  const [showMemoRq, setShowmemoQR] = useState(false);
  

  
  const [inputField, setInputField] = useState([{"xlmAddress":'',"ethAddress":''}]);

  const inputsHandler = e => {
    setInputField({
      ...inputField,
      [e.target.name]: e.target.value,
    });
  };


  const MakeItem = X => {
    return <option  value={X[1]} >{X[0]} ({X[1]})</option>;
  };
  const MakeToItem = X => {
    return <option  value={X[1]}>{X[0]} ({X[1]})</option>;
  };

  const swapUi = () => {
    setReceivingAccount('')
    setFromChain (chainto);
    setToChain (chainFrom);
    setFromchainValue(tochainvalue)
    setTochainvalue(fromchainvalue)
  };
  const showPayment = () => {
    setReceived('')
    setCompleted('')
    setStatus('');
    if (receivingAccount == '') {
      addToast ('Enter a valid  receiving address', {appearance: 'error'});
      return;
    }
  sendRequest();
  };
  useEffect (() => {
    cancel ();
  }, []);
  const cancel = () => {
    clearInterval(intervalId);
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



  const getRequest = async (req_memo) => {
 

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    
    try{
        var response = await fetch ("http://localhost:8081/"+req_memo);
        const resp = await response.json()

        const data = resp[0]
        const status = data.status
        const tx_hash = data.tx_hash
        const pay_out_hash = data.pay_out_hash
        setReceived(tx_hash)
        setCompleted(pay_out_hash)
        console.log(data)

        setStatus(status);
         if(status == 'completed'){
          setlisten(false)
        }else if(status == 'failed'){
          setCompleted('')
          setlisten(false)
        }
    }catch(error) {
        console.log('error', error)
        addToast ('Error getting pay in account', {appearance: 'error'});
      }


  }

  const sendRequest = async () => {
    setSending(true)
    const req = {
      "pay_in_chain": fromchainvalue,
      "pay_out_chain": tochainvalue,
      "payout_address": receivingAccount
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    
    var raw = JSON.stringify(req);
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    try{
        var response = await fetch ("http://localhost:8081", requestOptions
        );
        const resp = await response.json()
        console.log(resp)
        const response_memo = resp.memo
        const address = resp.pay_in_address
        setPayInAddress(address);
        setmemo(response_memo);
        setSending(false);
        setPaying (true);
        setlisten(true)

        var interId = setInterval(function(){ 
          getRequest(response_memo);
        }, 3000);
        setIntervalId(interId);

    }catch(error) {
        setSending(false);
        console.log('error', error)
        addToast ('Error getting pay in account', {appearance: 'error'});
      }


  }
  
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
/*

  const makePayment = async (sender_public_key) => {
 
    var sendingAsset = new StellarSdk.Asset.native ();
    const code = "HODL"
    const issuer = "GAQEDFS2JK6JSQO53DWT23TGOLH5ZUZG4O3MNLF3CFUZWEJ6M7MMGJAV"
    //var sendingAsset = new StellarSdk.Asset (code, issuer);

    const [{max_fee: {mode: fee}}, distributionAccount] = await Promise.all ([
      server.feeStats (),
      server.loadAccount (sender_public_key),
    ]);
    const transaction_builder = new StellarSdk.TransactionBuilder (
      distributionAccount,
      {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      }
    );

    transaction_builder
      .addOperation (
        StellarSdk.Operation.payment ({
          destination: pay_in_address,
          asset: sendingAsset
          })
      )


    transaction_builder.setTimeout (300);
    const transaction = transaction_builder.build ();
    const xdr = transaction.toEnvelope ().toXDR ('base64');

    try {
      var signed_txr = await signtxnRabet (xdr);
      postTransXDR (signed_txr);
    } catch (err) {
      addToast ('User cancelled request', {appearance: 'error'});
      setSending (false);
    }
  };

  signtxnRabet= async (xdr) => {
    const network = utils.STELLAR_NETWORK
    let result =  await window.rabet.sign(xdr, network)
    return result.xdr;
    
  }

  const postTransXDR = async signed_xdr => {
    let transaction = new StellarSdk.Transaction (
      signed_xdr,
      StellarSdk.Networks.PUBLIC
    );
    try {
      const transactionResult = await server.submitTransaction (transaction);
      var hash = transactionResult['hash'];
      //console.log (transactionResult);
      addToast ('Transaction successful ' + hash, {appearance: 'success'});
      setSending (false);
      saveTxn (hash);

      //post to BE log
    } catch (e) {
      addToast ('Transaction failed when submitted to network', {
        appearance: 'error',
      });
      //console.error (e.response.data.extras.result_codes);
      var operations = e.response.data.extras.result_codes.operations;
      var rp = JSON.stringify (operations);
      addToast (rp, {
        appearance: 'error',
      });
      setSending (false);
    }
  };
  */


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
                                                        value={fromchainvalue}
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
                                value={tochainvalue}
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
                          

                                     {tochainvalue =='stellar'? <a
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
                         

                         {sending?<div>

<Spinner
  as="span"
  animation="border"
  size="sm"
  role="status"
  aria-hidden="false"
/>
<span className="visually">
  Creating request ...
</span>
</div>: <div>
                            <a
                              href="#"
                              onClick={showPayment}
                              className="btn btn-grad"
                            >
                              Continue to payment
                            </a>
                          </div>}
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
                            Send payment to this address
                          </span>
                          <div>

                            
                          <div className="row">
                            <div className="col-10">
                            <div className="space-y-10">
                              <input
                                type="text"
                                value={pay_in_address}
                                disabled
                                className="form-control"
                              />
                            </div>
                            </div>
                            <a  href="#" onClick={()=>setShowPayQR(!showPayQr)}  className="col-2">Show QR
                            </a>
                            {showPayQr?<QRCode value={pay_in_address} />:<div/>}

                          </div>
                         
                          </div>
                          </div>


                        {fromchainvalue == 'stellar'?
                        <div className="space-y-10">
                          <span className="nameInput">Memo( Required)</span>
                          <div>
                          <div className="row">
                            <div className="col-10">

                            <div className="space-y-10">
                              <input
                                type="text"
                                value={memo}
                                disabled
                                className="form-control"
                              />
                            </div>
                            </div>
                            <a href='#' onClick={()=>setShowmemoQR(!showMemoRq)} className="col-2">Show QR
                            </a>
                            {showMemoRq?<QRCode value={memo} />:<div/>}


                            </div>
                            </div>
                        </div>:<div/>}

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
                           
                          </div>

                          
                        </div>
                                    {listen?<div>
                                    <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="false"
                                    />
                                    <span className="visually">
                                    Listening for payment ...
                                    </span>
                                    </div>:<div/>}

                                    <div>
                                    {tx_status =='pending'?<p>transaction created, request id {memo}</p>:<span/>}
                                    {(tx_status =='received' || txn_resp_received!='')?<p>transaction received {txn_resp_received}</p>:<span/>}
                                    {tx_status =='paying'?<p>transaction paying {txn_resp_received}</p>:<span/>}
                                    {tx_status =='completed'?<p>transaction completed, payout tx_id {txn_resp_completed}</p>:<span/>}
                                    {tx_status =='failed'?<p>Transaction not completed, please contact our support</p>:<span/>}
                                  

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
