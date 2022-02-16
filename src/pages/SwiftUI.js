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
const BRIDGE_ADDRESS = "GAVB5LGENQYKQ3IIOBEG56HGJLOANZZD6BYIB6DFGTKSGBLFXP7MYFVR"

const chain_bsc = 97
const chain_eth = 4
const chain_polygon = 80001


function SwiftUI() {
  const { authenticate, Moralis, isAuthenticated, user, CustomUser, logout } = useMoralis();
  Moralis.start({ serverUrl, appId })
  const [isPaying, setPaying] = useState(false);
  const [wrappedTokens, setWrappedToken] = useState([
    ['HODL', 'stellar'],
    ['wHODL', 'polygon'],
    ['wHODL', 'bsc'],
    ['wHODL', 'eth'],
  ]);
  const [hodl, setHodl] = useState([
    ['HODL', 'stellar'],
    ['wHODL', 'polygon'],
    ['wHODL', 'bsc'],
    ['wHODL', 'eth'],
    ['ETH', 'ETH'],
    ['XLM', 'XLM'],
    ['BNB', 'BNB'],
    ['MATIC', 'MATIC'],
    ['AVAX', 'AVAX']
  ]);
  const [addressInfo, setAddressObject] = useState([]);
  const [chainFrom, setFromChain] = useState(wrappedTokens);
  const [chainto, setToChain] = useState(hodl);
  const [receivingAccount, setReceivingAccount] = useState('');
  const [fromchainvalue, setFromchainValue] = useState('');
  const [tochainvalue, setTochainvalue] = useState('stellar');
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

  const [chainFee, setchainFee] = useState('');
  const [depositCoinFeeRate, setdepositCoinFeeRate] = useState('');
  const [depositMax, setdepositMax] = useState('');
  const [depositMin, setdepositMin] = useState('');
  const [instantRate, setinstantRate] = useState('');
  const [isDiscount, setisDiscount] = useState('');
  const [minerFee, setminerFee] = useState('');
  const [receiveCoinFee, setreceiveCoinFee] = useState('');
  const [refundAddress, setRefundAddress] = useState('');
  const [receiveCoinAmt, setreceiveCoinAmt] = useState('');

  const [swiftData, setswiftData] = useState([]);




  const MakeItem = X => {
    const v = X['coinCode'] + ":" + X['coinName']
    return <option value={v} >{X['coinCode']} - {X['coinName']}</option>;
  };
  const MakeHodlItem = X => {
    const v = X[0] + ":" + X[1]
    return <option value={v}>{X[0]} -{X[1]} </option>;
  };

  const getToAssetName = (data) => {
    const myArray = data.split(":");
    return myArray[1]
  }

  const getToAssetCode = (data) => {
    const myArray = data.split(":");
    return myArray[0]
  }
  const getFromAssetCode = (data) => {
    const myArray = data.split(":");
    return myArray[0]
  }
  const getFromAssetName = (data) => {
    const myArray = data.split(":");
    return myArray[1]
  }

  const showPayment = () => {
    setReceived('')
    setCompleted('')
    setStatus('');
    if (receivingAccount == '') {
      addToast('Enter a valid  receiving address', { appearance: 'error' });
      return;
    }
    if (fromchainvalue == 'stellar') {
      swapFromStellarRequest();
    } else {
      setPaying(true);
    }

  };
  useEffect(() => {
    cancel();
    getAccounts()
    getSWIFTAssets()
  }, []);

  const cancel = () => {
    clearInterval(intervalId);
    setPaying(false);
    setmemo("")
    setreceiveCoinAmt("")
  };


  const getSWIFTAssets = async () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "supportType": "advanced"
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("http://localhost:8085/queryCoinListByType", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result.data)
        setswiftData(result.data)
      })
      .catch(error => console.log('error', error));
  }


  const getBaseInfo = (fromchain) => {
    setinstantRate('')
    var toCode = getToAssetCode(tochainvalue)
    if (toCode == "wHODL") {
      toCode = "HODL"
    }
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      "depositCoinCode": fromchain,
      "receiveCoinCode": toCode
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch("http://localhost:8085/getBaseInfo", requestOptions)
      .then(response => response.json())
      .then(result => {
        const resCode = result.resCode
        if (resCode == 800) {
          const dt = result.data

          setchainFee(dt["chainFee"])
          setdepositCoinFeeRate(dt["depositCoinFeeRate"])
          setdepositMax(dt["depositMax"])
          setdepositMin(dt["depositMin"])
          setinstantRate(dt["instantRate"])
          setisDiscount(dt["isDiscount"])
          setminerFee(dt["minerFee"])
          setreceiveCoinFee(dt["receiveCoinFee"])

        }

        console.log(result)
      }
      )
      .catch(error => console.log('error', error));
  }

  const guidGenerator = () => {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }

  const makeExchange = () => {
    var toCode = getToAssetCode(tochainvalue)
    var toName = getToAssetName(tochainvalue)

    var fromCode = getFromAssetCode(fromchainvalue)
    var fromName = getFromAssetName(fromchainvalue)

    if(fromCode == "XLM" || fromCode == "HODL" ){
      //setreceiveCoinAmt(swapAmount)
      if(toCode == "wHODL"){
        swapFromStellarRequest()
        return;
      }

    }

    if(fromCode == "wHODL"  ){
      if(toCode == "wHODL" || toCode== "HODL"){
        burnTokens()
      }else{
        addToast('Swap pair not supported', { appearance: 'error' });
      }
      return;
    }
 
    

    if (parseFloat(swapAmount) < parseFloat(depositMin)) {
      console.log(swapAmount+", deposit "+depositMin)
      addToast('Amount less than minimum', { appearance: 'error' });
      return;
    }

    if (parseFloat(swapAmount) > parseFloat(depositMax)) {
      addToast('Amount more than maximum', { appearance: 'error' });
      return;
    }
    setSending(true)

    var receiveAddress = receivingAccount
    if (toCode == "wHODL") {
      toCode = "HODL"
      const mm = between(10000000, 99999999).toString()
      const payIninfo = Moralis.Object.extend("bvPayments");
      const payinfo = new payIninfo();
      payinfo.set('payOutChain', toName);
      payinfo.set('payInChain', 'stellar');
      payinfo.set('payInAccount', BRIDGE_ADDRESS);
      payinfo.set('payInMemo', mm);
      payinfo.set('payOutAddress', receivingAccount);
      payinfo.set('txnStatus', 'pending');
      payinfo.save()
      receiveAddress = BRIDGE_ADDRESS + "#" + mm
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const recAmount = parseFloat(swapAmount) * parseFloat(instantRate)
    const receiveCoinAmt = recAmount.toFixed(6)
    const randomId = guidGenerator();

    const bd = JSON.stringify({
      "equipmentNo": "Zsda3529430s90468518",
      "sessionUuid": "",
      "sourceType": "ANDROID",
      "userNo": "",
      "orderId": randomId,
      "depositCoinCode": fromCode,
      "receiveCoinCode": toCode,
      "depositCoinAmt": swapAmount,
      "receiveCoinAmt": receiveCoinAmt,
      "receiveSwftAmt": receiveCoinAmt,
      "destinationAddr": receiveAddress,
      "refundAddr": refundAddress,
      "sourceFlag": "HODL",
      "developerId": ""
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: bd,
      redirect: 'follow'
    };

    fetch("http://localhost:8085/accountExchange", requestOptions)
      .then(response => response.json())
      .then(result => {
        setSending(false)
        const resCode = result.resCode
        if (resCode == 800) {
          const data = result.data
          var paddress = data["platformAddr"]
          if (paddress.includes("#")) {
            const splitArray = paddress.split("#")
            paddress = splitArray[0]
            const memo = splitArray[1]
            setmemo(memo)
          }


          const receiveCoinAmt = data["receiveCoinAmt"]

          setPayInAddress(paddress)
          setreceiveCoinAmt(receiveCoinAmt)
          setPaying(true)
          addToast('Payment generated', { appearance: 'success' });

        }
        console.log(result)
      })
      .catch(error => {
        setSending(false)
        console.log('error', error)
      });
  }



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
    var fromCode = getFromAssetCode(v)
    getBaseInfo(fromCode)
  };

  const updateRefundAcc = e => {
    var v = e.target.value;
    setRefundAddress(v);
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
    const fromChain = getFromAssetName(fromchainvalue)
    for (let i = 0; i < addressInfo.length; i++) {
      const object = addressInfo[i];
      const chain = object.get('chain')
      const address = object.get('address')
      if (chain == fromChain) {
        setPayInAddress(address)
        return address
      }
    }
    return ''
  }

  const swapFromStellarRequest = async () => {
    const payin = await getpayAddress()
    const fromChain = getFromAssetName(fromchainvalue)
    const toChain = getToAssetName(tochainvalue)
    setSending(true)
    const mm = between(10000000, 99999999).toString()

    const payIninfo = Moralis.Object.extend("bvPayments");
    const payinfo = new payIninfo();
    payinfo.set('payOutChain', toChain);
    payinfo.set('payInChain', fromChain);
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
          makePaymentTransfer(result.publicKey, memo)

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
    const destination = pay_in_address //await getpayAddress()
    console.log("memo", memo)

    var sendingAsset = new StellarSdk.Asset.native()

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

  async function burnTokens(transferAmount) {
    var fromChain = getFromAssetName(fromchainvalue)
    const tochain = getToAssetName(tochainvalue)
    
    if (swapAmount == '') {
      addToast('enter a valid amount', { appearance: 'error' });
      return;
    }

    setSending(true)


    const contractAddress = getAddress(fromChain);
    if (window.ethereum) {

      const web3 = new Web3(window.ethereum);

      const chainIdHex = web3.currentProvider.chainId;
      const chainIdDec = await web3.eth.getChainId();
      console.log(chainIdHex);
      console.log(chainIdDec);
      if (chainIdDec != getChainid(fromChain)) {
        await switchNetwork(getChainid(fromChain))

      }


      console.log(window.web3.currentProvider)
      await window.ethereum.enable();
      const weiValue = Web3.utils.toWei(swapAmount, 'ether');

      var contract = new web3.eth.Contract(abiArray, contractAddress)
      transferAmount = parseFloat(transferAmount);
      const sendingAmount = weiValue
      const xlmAddress = receivingAccount
      contract.methods.claimBurn(xlmAddress, sendingAmount, fromChain, tochain).send({
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
                    <h3 className="text-left">SWIFT - Swap</h3>
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
                              {chainFrom.map(MakeHodlItem)}
                              {swiftData.map(MakeItem)}

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
                              {chainto.map(MakeHodlItem)}
                            </select>
                          </div>
                        </div>
                      </div>


                      {instantRate != '' ? <div>
                        <p>Exchange Rate: {instantRate}</p>
                        <p>chainFee: {chainFee}</p>
                        <p>depositCoinFeeRate: {depositCoinFeeRate}</p>
                        <p>depositMax: {depositMax}</p>
                        <p>depositMin: {depositMin}</p>
                        <p>isDiscount: {isDiscount}</p>
                        <p>minerFee: {minerFee}</p>
                        <p>receiveCoinFee: {receiveCoinFee}</p>
                      </div> : <div />}


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


                            {getFromAssetName(tochainvalue) == 'stellar' ? <a
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

                      <div className="space-y-10">
                        <span className="nameInput">Refund address</span>

                        <div className="row">
                          <div className="col-11">
                            <input
                              type="text"
                              value={refundAddress}
                              name="refundAddress"
                              onChange={updateRefundAcc}
                              placeholder="Enter your address here"
                              className="form-control"
                            />

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
                        </div> : <div><button
                          onClick={makeExchange}
                          className="btn btn-grad"
                        >
                          Send Request
                        </button>
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


                      <div>
                        <div>
                          <p>Pay Amount: {swapAmount} {getFromAssetCode(fromchainvalue)}</p>
                          <p>Receive Amount: {receiveCoinAmt} {getToAssetCode(tochainvalue)}</p>

                        </div>

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


                        {memo!=""?<div className="space-y-10">
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
                        </div>:<div/>}

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
                            style={{ margin: 10 }}
                            href="#"
                            onClick={cancel}
                            className="btn btn-grad"
                          >
                            Back
                          </a>

                          {getFromAssetName(fromchainvalue)=='stellar'?<a
                            style={{ margin: 10 }}
                            href="#"
                            onClick={makePayment}
                            className="btn btn-grad"
                          >
                            Pay with Rabet
                          </a>:<span/>}






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

export default SwiftUI;
