import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app.jsx';
import {BrowserRouter, Route} from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <Route exact path="/restaurant/:restaurant_id" component={App} />
  </BrowserRouter>
, document.getElementById('appReserve'));
   