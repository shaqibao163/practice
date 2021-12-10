/*
 * @Description: 
 * @Version: 1.0
 * @Author: bclz
 * @Date: 2021-12-01 15:11:59
 * @LastEditors: bclz
 * @LastEditTime: 2021-12-02 10:26:34
 */
import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
