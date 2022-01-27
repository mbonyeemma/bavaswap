import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MoralisProvider } from "react-moralis";

const APP_ID = "uJ33bXMkFxCSiircX2zTTvSyCiojORvL138aA4Ei";
const SERVER_URL = "https://cdn06vqwo73l.usemoralis.com:2053/server";

ReactDOM.render(
  <React.StrictMode>
  <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
    <App />
  </MoralisProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
