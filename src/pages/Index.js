import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

import swap from '../swap.png';
import metamask from '../icons/metamask.png';
import rabet from '../icons/rabbet.jpg';
import { Spinner } from 'react-bootstrap';

import { ToastProvider, useToasts } from 'react-toast-notifications';
import stringify from 'fast-json-stable-stringify';
import abiArray from '../abi.json'
import { useMoralis } from 'react-moralis';
var StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server("https://horizon.stellar.org");

const appId = "uJ33bXMkFxCSiircX2zTTvSyCiojORvL138aA4Ei";
const serverUrl = "https://cdn06vqwo73l.usemoralis.com:2053/server";

const code = "HODL"
const issuer = "GAQEDFS2JK6JSQO53DWT23TGOLH5ZUZG4O3MNLF3CFUZWEJ6M7MMGJAV"
var Web3 = require('web3');
const contractAddress_polygon = "0x50d7bE8C1ab4D69cF4c487aAB01Edc168fe3aA1a"
const contractAddress_bsc = "0xFaB9a5f8a3C20D26Af31D275f7e25b4401Dad8e1"
const contractAddress_eth = "0xFF8cC6Abc855c93FAABCb745E135872511c834bb"

const chain_bsc = 97
const chain_eth = 4
const chain_polygon = 80001








function Index({ history }) {
  const { authenticate, Moralis, isAuthenticated, user, CustomUser, logout } = useMoralis();
  Moralis.start({ serverUrl, appId })

  const [isPaying, setPaying] = useState(false);
  const [wrappedTokens, setWrappedToken] = useState([
    ['wHODL', 'polygon'],
    ['wHODL', 'bsc'],
    ['wHODL', 'eth'],
    ['HODL', 'stellar']
  ]);
  const [hodl, setHodl] = useState([
    ['HODL', 'stellar'],
    ['wHODL', 'bsc'],
    ['wHODL', 'polygon'],
    ['wHODL', 'eth'],

  ]);
  const [addressInfo, setAddressObject] = useState([]);


  const [chainFrom, setFromChain] = useState(hodl);
  const [chainto, setToChain] = useState(wrappedTokens);
  const [receivingAccount, setReceivingAccount] = useState('');
  const [fromchainvalue, setFromchainValue] = useState('stellar');
  const [tochainvalue, setTochainvalue] = useState('polygon');
  const { addToast } = useToasts();
  const [hasMetamask, setHasMetamask] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasRabet, setHasRabet] = useState(false);
  const [memo, setmemo] = useState('');
  const [pay_in_address, setPayInAddress] = useState('');
  const [txn_resp_completed, setCompleted] = useState('');
  const [txn_resp_received, setReceived] = useState('');
  const [tx_status, setStatus] = useState('');
  const [intervalId, setIntervalId] = useState(null);
  const [listen, setlisten] = useState(null);
  const [showPayQr, setShowPayQR] = useState(false);
  const [showMemoRq, setShowmemoQR] = useState(false);
  const [swapAmount, setAmount] = useState('');
  const [isRabetPayment, setPayWithRabet] = useState(false);



  const [inputField, setInputField] = useState([{ "xlmAddress": '', "ethAddress": '' }]);

  const inputsHandler = e => {
    setInputField({
      ...inputField,
      [e.target.name]: e.target.value,
    });
  };


  const MakeItem = X => {
    return <option value={X.get('chain')} >{X.get('tokenCode')} ({X.get('chain')})</option>;
  };


  const swapUi = () => {
    setReceivingAccount('')
    setFromChain(chainto);
    setToChain(chainFrom);
    setFromchainValue(tochainvalue)
    setTochainvalue(fromchainvalue)
  };
  const showPayment = () => {
    setReceived('')
    setCompleted('')
    setStatus('');
    if (receivingAccount == '') {
      addToast('Enter a valid  receiving address', { appearance: 'error' });
      return;
    }
    if (fromchainvalue == 'stellar') {
      sendRequest();
    } else {
      setPaying(true);
    }

  };
  useEffect(() => {
    cancel();
    getAccounts()
  }, []);
  const cancel = () => {
    clearInterval(intervalId);
    setPaying(false);
  };

  const updateReceivingAccount = e => {
    var v = e.target.value;
    setReceivingAccount(v);
  };
  const updateSendingAmount = e => {
    var v = e.target.value;
    setAmount(v);
  };
  const handlefromChange = e => {
    var v = e.target.value;
    setFromchainValue(v);
  };

  const handleToChange = e => {
    var v = e.target.value;
    setTochainvalue(v);
  };

  const OpenMetamask = wallet => {
    if (window.ethereum) {
      setHasMetamask(true);
      connect(wallet);
    } else {
      setHasMetamask(false);
      addToast('MetaMask extension not found', { appearance: 'error' });

    }
  };







  const getRequest = async (req_memo, intVal) => {
    try {
      console.log("hash", req_memo)
      const StellarLogin = Moralis.Object.extend('bvPayments');
      const query = new Moralis.Query(StellarLogin);

      if (fromchainvalue == 'stellar') {
        query.equalTo("payInMemo", req_memo);
      } else {
        query.equalTo("payInHash", req_memo);
      }
      const items = await query.find();
      console.log(items)
      if (items.length > 0) {
        const data = items[0]

        const status = data.get('txnStatus')
        setStatus(status);
        if (status == 'received') {
          const tx_hash = data.get('payInHash')
          setReceived(tx_hash)
          addToast("Transaction recived", { appearance: 'info' });
        } else if (status == 'completed') {
          const pay_out_hash = data.get('payOutHash')
          clearInterval(intVal);
          setlisten(false)
          setCompleted(pay_out_hash)
          addToast("Transaction completed", { appearance: 'success' });
          
          setSending(false)
        } else if (status == 'failed') {
          setCompleted('')
          setlisten(false)
          clearInterval(intVal);
          addToast("Transaction failed", { appearance: 'success' });
          setSending(false)
        }
      }

    } catch (err) {
      console.log(err)
      //addToast ("error fetching memo", {appearance: 'error'});
    }
  }
  function between(min, max) {
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }

  const getAccounts = async () => {
    const bvAccounts = Moralis.Object.extend('bvAccounts');
    const query = new Moralis.Query(bvAccounts);
    const items = await query.find();
    console.log(items);
    try {
      setAddressObject(items)



    } catch (err) {
      addToast("error getting addresses", { appearance: 'error' });
    }
  }

  const getpayAddress = async () => {
    for (let i = 0; i < addressInfo.length; i++) {
      const object = addressInfo[i];
      const chain = object.get('chain')
      const address = object.get('address')
      if (chain == fromchainvalue) {
        setPayInAddress(address)
        return address
      }
    }
    return ''
  }

  const sendRequest = async () => {
    const payin = await getpayAddress()
    setSending(true)
    const mm = between(10000000, 99999999).toString()

    const payIninfo = Moralis.Object.extend("bvPayments");
    const payinfo = new payIninfo();
    payinfo.set('payOutChain', tochainvalue);
    payinfo.set('payInChain', fromchainvalue);
    payinfo.set('payInAccount', payin);
    payinfo.set('payInMemo', mm);
    payinfo.set('payOutAddress', receivingAccount);
    payinfo.set('txnStatus', 'pending');
    payinfo.save()
      .then((payinfo) => {
        console.log(payinfo)
        setPayInAddress(payin);
        setmemo(mm)
        setlisten(true)

        if(isRabetPayment){
          makePaymentTransfer(payin, mm)
        }else{
          setSending(false);
          setPaying(true);

        }



        var interId = setInterval(function () {
          getRequest(mm, interId);
        }, 10000);
        setIntervalId(interId);



      }, (error) => {
        setSending(false)
        addToast('Failed to create new object, with error code: ' + error.message, { appearance: 'error' });
      });
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
          addToast('Please connect to MetaMask', { appearance: 'error' });

        } else {
          console.error(error);
        }
      });
  }

  const switchNetwork = async (chain) => {
    const chainId = "0x" + chain.toString(16)

    try {
      await window.web3.currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }]
      });
      addToast('Network changed ', { appearance: 'success' });

      return null
    } catch (error) {
      addToast('Error switching network, please switch metamask network manually', { appearance: 'error' });
      return null

    }
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
  const makePayment = () => {
    setSending(true)
    if (window.rabet) {
      setHasRabet(true);
      window.rabet
        .connect()
        .then(result => {
          sendRequest()
          
        })
        .catch(error => {
          setSending(false)

          addToast('Operation cancelled', { appearance: 'error' });
        });
    } else {
      setSending(false)
      setHasRabet(false);
      addToast('Rabet not installed', { appearance: 'error' });
    }
  };


  const makePaymentTransfer = async (sender_public_key, memo) => {
    const destination = await getpayAddress()


    var sendingAsset = new StellarSdk.Asset(code, issuer);

    const [{ max_fee: { mode: fee } }, distributionAccount] = await Promise.all([
      server.feeStats(),
      server.loadAccount(sender_public_key),
    ]);
    const transaction_builder = new StellarSdk.TransactionBuilder(
      distributionAccount,
      {
        fee,
        networkPassphrase: StellarSdk.Networks.PUBLIC,
      }
    );

    transaction_builder
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destination,
          asset: sendingAsset,
          amount: swapAmount
        })
      )
      .addMemo(StellarSdk.Memo.text(memo))
    transaction_builder.setTimeout(300);
    const transaction = transaction_builder.build();
    const xdr = transaction.toEnvelope().toXDR('base64');

    try {
      var signed_txr = await signtxnRabet(xdr);
      postTransXDR(signed_txr);
    } catch (err) {
      console.log(err)
      addToast('User cancelled request', { appearance: 'error' });
      setSending(false);
    }
  };

  const signtxnRabet = async (xdr) => {
    const network = "mainnet"
    let result = await window.rabet.sign(xdr, network)
    return result.xdr;
  }

  const postTransXDR = async signed_xdr => {
    let transaction = new StellarSdk.Transaction(
      signed_xdr,
      StellarSdk.Networks.PUBLIC
    );
    try {
      const transactionResult = await server.submitTransaction(transaction);
      var hash = transactionResult['hash'];
      //console.log (transactionResult);
      addToast('Transaction successful ' + hash, { appearance: 'success' });
      setSending(false);
      setReceived(hash)


      //post to BE log
    } catch (e) {
      addToast('Transaction failed when submitted to network', {
        appearance: 'error',
      });
      //console.error (e.response.data.extras.result_codes);
      var operations = e.response.data.extras.result_codes.operations;
      var rp = JSON.stringify(operations);
      addToast(rp, {
        appearance: 'error',
      });
      setSending(false);
    }
  };


  const getAddress = (chain) => {
    switch (chain) {
      case "polygon":
        return contractAddress_polygon;
      case "bsc":
        return contractAddress_bsc
      case "eth":
        return contractAddress_eth
      default:
        return null
    }
  }

  const getChainid = (chain) => {
    switch (chain) {
      case "polygon":
        return chain_polygon;
      case "bsc":
        return chain_bsc
      case "eth":
        return chain_eth
      default:
        return null
    }
  }

  async function burnTokens(destAddress, transferAmount, memo) {
    if (swapAmount == '') {
      addToast('enter a valid amount', { appearance: 'error' });
      return;
    }

    setSending(true)


    const contractAddress = getAddress(fromchainvalue);
    if (window.ethereum) {

      const web3 = new Web3(window.ethereum);

      const chainIdHex = web3.currentProvider.chainId;
      const chainIdDec = await web3.eth.getChainId();
      console.log(chainIdHex);
      console.log(chainIdDec);
      if (chainIdDec != getChainid(fromchainvalue)) {
        await switchNetwork(getChainid(fromchainvalue))

      }


      console.log(window.web3.currentProvider)
      await window.ethereum.enable();
      const weiValue = Web3.utils.toWei(swapAmount, 'ether');

      var contract = new web3.eth.Contract(abiArray, contractAddress)
      transferAmount = parseFloat(transferAmount);
      const sendingAmount = weiValue
      const xlmAddress = receivingAccount
      contract.methods.claimBurn(xlmAddress, sendingAmount, fromchainvalue, tochainvalue).send({
        from: window.web3.currentProvider.selectedAddress
      })
        .then(transactionHash => {
          const hash = transactionHash['transactionHash']
          addToast('Transaction sent ' + transactionHash['transactionHash'], { appearance: 'success' });
          setReceived(hash)

          const intVal = setInterval(function () {
            getRequest(hash, intVal);
          }, 10000);
          setIntervalId(intVal);


        })
        .then(receipt => {


        }).catch((error) => {
          const message = error.message;
          addToast(message, { appearance: 'error' });
          setSending(false)

        })

    } else {
      addToast('MetaMask extension not found', { appearance: 'error' });
      setSending(false)

    }


  }


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
                              {addressInfo.map(MakeItem)}

                            </select>
                          </div>




                        </div>
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
                              {addressInfo.map(MakeItem)}
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


                            {tochainvalue == 'stellar' ? <a
                              href="#"
                              onClick={() =>
                                OpenRabet('ethAddress')}
                            >
                              <img
                                src={rabet}
                                alt=""
                                height="25"
                              />
                            </a> : <a
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



                      {fromchainvalue != 'stellar' || isRabetPayment ? <div className="space-y-10">
                        <span className="nameInput">Swap Amount</span>
                        <div className="row">
                          <div className="col-12">
                            <input
                              type="text"
                              value={swapAmount}
                              name="amount"
                              onChange={updateSendingAmount}
                              placeholder="enter token amount"
                              className="form-control"
                            />
                          </div>
                        </div>
                      </div> : <div />}






                      <div className="requests_footer">


                        {sending ? <div>

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
                        </div> : <div>
                          {fromchainvalue == 'stellar' ? <div>
                            {isRabetPayment?<div>
                              <a
                              href="#"
                              onClick={makePayment}
                              className="btn btn-grad"
                            >
                              Pay with Rabet
                            </a><a
                              href="#"
                              onClick={()=>setPayWithRabet(false)}
                            >
                              Pay QR Code
                            </a></div>:<div>
                              <a
                              href="#"
                              onClick={showPayment}
                              className="btn btn-grad"
                            >
                               Continue to QR Pay
                            </a>
                            <a
                              href="#"
                              onClick={()=>setPayWithRabet(true)}
                            >
                              Pay with Rabet
                            </a></div>}
                          </div> :

                            <a
                              style={{ margin: 10 }}
                              href="#"
                              onClick={burnTokens}
                              className="btn btn-grad"
                            >
                              Pay with metamask
                            </a>}

                        </div>}


                      </div>
                      <div>
                        {tx_status == 'pending' ? <p>Transaction created, request id {memo}</p> : <span />}
                        {(tx_status == 'received' || txn_resp_received != '') ? <p>transaction received {fromchainvalue} {txn_resp_received}</p> : <span />}
                        {tx_status == 'paying' ? <p>Transaction paying {txn_resp_received}</p> : <span />}
                        {tx_status == 'completed' ? <p>Transaction completed, payout tx_id {tochainvalue} {txn_resp_completed}</p> : <span />}
                        {tx_status == 'failed' ? <p>Transaction not completed, please contact our support</p> : <span />}


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

                      {fromchainvalue == 'stellar' ?

                        <div>

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
                                <a href="#" onClick={() => setShowPayQR(!showPayQr)} className="col-2">Show QR
                                </a>
                                {showPayQr ? <QRCode value={pay_in_address} /> : <div />}

                              </div>

                            </div>
                          </div>


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
                                <a href='#' onClick={() => setShowmemoQR(!showMemoRq)} className="col-2">Show QR
                                </a>
                                {showMemoRq ? <QRCode value={memo} /> : <div />}


                              </div>
                            </div>
                          </div>

                        </div> : <div />}

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
                            style={{ margin: 10 }}
                            href="#"
                            onClick={cancel}
                            className="btn btn-grad"
                          >
                            Back
                          </a>




                        </div>
                      </div>



                      {listen ? <div>
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
                      </div> : <div />}

                      <div>
                        {tx_status == 'pending' ? <p>Transaction created, request id {memo}</p> : <span />}
                        {(tx_status == 'received' || txn_resp_received != '') ? <p>transaction received {fromchainvalue} {txn_resp_received}</p> : <span />}
                        {tx_status == 'paying' ? <p>Transaction paying {txn_resp_received}</p> : <span />}
                        {tx_status == 'completed' ? <p>Transaction completed, payout tx_id {tochainvalue} {txn_resp_completed}</p> : <span />}
                        {tx_status == 'failed' ? <p>Transaction not completed, please contact our support</p> : <span />}


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
