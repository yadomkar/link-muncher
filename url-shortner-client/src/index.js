import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBz4TL5T0j7VLJdaskSF_jzVkKu0v0nuaQ',
  authDomain: 'url-shortner-yadomkar.firebaseapp.com',
  projectId: 'url-shortner-yadomkar',
  storageBucket: 'url-shortner-yadomkar.appspot.com',
  messagingSenderId: '794955066878',
  appId: '1:794955066878:web:73d4c8040c00ff50cf64af',
  measurementId: 'G-4MNDCGFCYJ',
};

initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
