import React, {useContext, createContext, useState} from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom';
import Index from '../pages/Index';
import Header from './Header';


export default function Routes () {
 

  return (
      <BrowserRouter>
        <Header/>

        <Route path="/"   component={Index} />
    
 
      </BrowserRouter>
  );
}
 

