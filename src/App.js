import logo from './logo.svg';
import './App.css';
import Header from './components/Header'
import Index from './pages/Index'
import SwiftUI from './pages/SwiftUI'
import WalletConnector from './pages/WalletConnector'
import { Web3Provider } from "@ethersproject/providers";
import {
  Web3ReactProvider,
  useWeb3React,
  UnsupportedChainIdError
} from "@web3-react/core";

import { ToastProvider, useToasts } from 'react-toast-notifications';
function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}


function App() {
  return (
    <div className="App">
    <Web3ReactProvider getLibrary={getLibrary}>
        <ToastProvider>
          <WalletConnector />
        </ToastProvider>
      </Web3ReactProvider>

    </div>
  );
}

export default App;
