import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import store from './store/store';

import App from './App.jsx';
import './index.css';
const rootEl=document.getElementById("root");
if(rootEl){
  createRoot(rootEl).render(
  <Provider store={store}> 
    <App />
  </Provider>
  );
}
else{
  throw new Error("Root Element not found");
}

