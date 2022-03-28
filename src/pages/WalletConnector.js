import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Spinner } from 'react-bootstrap';
import { useToasts } from 'react-toast-notifications';
import abiArray from '../abi.json'
import WalletConnectService from './WalletConnectService'
import { ReactSession } from 'react-client-session';
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

import { useMoralis } from 'react-moralis';

const appId = "uJ33bXMkFxCSiircX2zTTvSyCiojORvL138aA4Ei";
const serverUrl = "https://cdn06vqwo73l.usemoralis.com:2053/server";

var StellarSdk = require('stellar-sdk');
const server = new StellarSdk.Server("https://horizon.stellar.org");
var Web3 = require('web3');
const contractAddress_polygon = "0xd3AB35C7b65b829C60CCdf7071779315c851A543"


const wConnect = new WalletConnectService()

function WalletConnector() {

  const { web3,logout, Moralis, authenticate, isWeb3Enabled, enableWeb3, isAuthenticated } = useMoralis();
  Moralis.start({ serverUrl, appId })

  const [isPaying, setPaying] = useState(false);

  const [receivingAccount, setReceivingAccount] = useState('gaga');
  const [fromchainvalue, setFromchainValue] = useState('HODL:stellar');
  const [tochainvalue, setTochainvalue] = useState('wHODL:polygon');
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

  const [receiveCoinAmt, setreceiveCoinAmt] = useState('');
  const [wcUri, setwcUri] = useState('');
  const [provider, setProvider] = useState(null);
  const [connectedAccount, setAccount] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    //cancel();
  
  }, []);


  const updateSendingAmount = e => {
    var v = e.target.value;
    setAmount(v);
  };


  const makePaymentTransfer = async (memo) => {
    const sender_public_key = await ReactSession.get("publicKey");

    const destination = sender_public_key //pay_in_address //await getpayAddress()
    console.log("memo", memo)
    console.log("sender_public_key", sender_public_key)
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
      addToast('Sent a request', { appearance: 'success' });

      walletConnectSendTxn(xdr)
    } catch (err) {
      console.log(err)
      addToast('User cancelled request', { appearance: 'error' });
      setSending(false);
    }
  };




  const walletConnectLogin = () => {
    const uri = ReactSession.get("uri");
    if (uri == undefined) {
      wConnect.login()
    } else {
      setwcUri(uri)
    }
  }

  const walletConnectSendTxn = (txn) => {
       wConnect.signTx(txn)
     
  }

  const walletConnectLogout = () => {
    wConnect.logout()
  }



  async function getBurnTx() {
    const swapAmount = "0.0001"
    const fromChain = "polygon"
    const tochain = "stellar"
    const contractAddress = contractAddress_polygon

    const web3 = new Web3("https://polygon-rpc.com/");

    const accounts = await web3.eth.getAccounts();
    console.log("accounts", accounts);

    const chainId = await web3.eth.getChainId();
    console.log(chainId);


    const weiValue = Web3.utils.toWei(swapAmount, 'ether');

    var contract = new web3.eth.Contract(abiArray, contractAddress)
    const sendingAmount = weiValue
    const xlmAddress = receivingAccount
    const gasPrice = await web3.eth.getGasPrice()


    const data = contract.methods.claimBurn(xlmAddress, sendingAmount, fromChain, tochain)
    var estGas = await data.estimateGas({ from: connectedAccount });
    console.log("gasPrice", gasPrice)

    var payload = {
      "from": connectedAccount,
      "gasPrice": gasPrice,
      "gas": estGas,
      "to": contractAddress,
      "data": data.encodeABI(),
      "chainId": chainId,
    };
    console.log(payload)

    return payload;
  }

  const moralisLogin = async () => {
      const user = await Moralis.authenticate({provider: "walletconnect", chainId: 137, signingMessage: "Galaxe Login", 
      })
      console.log(user)
    
   

    

  }

  useEffect(() => {
    if ( isAuthenticated ) {
      //enableWeb3({ provider: "walletconnect",chainId: 137 })
      console.log("connected")
    }else{
      console.log("somethign changed")
    }

  },[isAuthenticated, isWeb3Enabled, enableWeb3])

const sendRequest= async()=>{

  setProvider(web3.provider)
  setAccount(web3.provider.accounts[0])
  addToast('Login success', { appearance: 'success' });
  setIsLoggedIn(true)

const tx = await getBurnTx()
  const payload = {
    "method": "eth_sendTransaction",
    "params":[tx],
  }

  try{
    const result = await provider.request(payload);
    addToast("sent "+result, { appearance: 'success' });

    console.log(result)
  }catch(error){

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
                    <h3>Status: {isLoggedIn ? "Logged In" : "Not logged in"}</h3>
                  </div>

                  <p>Connected to: {connectedAccount}</p>


                  <button
                    onClick={walletConnectLogin}
                    className="btn btn-grad"
                  >
                    Stellar WC Login
                  </button>



                  <button
                    loading
                    onClick={walletConnectLogout}
                    className="btn btn-grad"
                  >
                    Stellar WC Logout
                  </button>

 
 

                  <button
                    loading
                    onClick={sendRequest}
                    className="btn btn-grad"
                  >
                    EVM Burn Tokens
                  </button>



                  <button
                    loading
                    onClick={moralisLogin}
                    className="btn btn-grad"
                  >
                    Moralis Login
                  </button>





                  {wcUri != '' ? <QRCode size={200} value={wcUri} /> : <div />}



                  <div className="box is__big">
                    <div className="space-y-20 mb-0">





                      <div className="space-y-10">
                        <span className="nameInput"> Amount</span>
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
                      </div>






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
                          onClick={() => makePaymentTransfer("1212")}
                          className="btn btn-grad"
                        >
                          Send Stellar Txn Request
                        </button>
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

        
    </div>
  );
}

export default WalletConnector;


