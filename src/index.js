import React, {useReducer, useContext, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import zango from 'zangodb';
import {MainContext} from './context';
import './index.css';
import App from './App';
import { TestAndSetAuth } from './Services/Auth';
import * as serviceWorker from './serviceWorker';

const initialState = {
  db: new zango.Db('db', 2, {wealth: ['account_id', 'timestamp']}),
  api: undefined,
  token: undefined,
  id: undefined,
  name: undefined
};

function reducer(state, action) {
  switch(action.type) {
    case "mergeState":
      return Object.assign({}, state, action.value);
    default:
      return state;
  }
}

function Wrapper(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [providerState, setProviderState] = useState({state, dispatch});

  function getWealth(forceUpdate=false) {
    Promise.all([
      state.db.collection('wealth').find().sort({timestamp:-1}).limit(1).toArray(),
      state.api.get('v2/account/wallet').json()
    ])
    .then(([[latestEntry], data])=>{
      if(!latestEntry || JSON.stringify(latestEntry.data) != JSON.stringify(data)) {
        let obj = {
          account_id: state.id,
          timestamp: new Date(),
          data
        };
        state.db.collection('wealth').insert(obj);
        console.log(obj);

        dispatch({type:"mergeState", value:{
          wealth: data
        }});
      }
      else if(forceUpdate) {
        dispatch({type:"mergeState", value:{
          wealth: data
        }});
      }
    })
  }

  useEffect(()=>{
    state.db.collection('wealth').find().toArray().then(console.log);
    let token = window.localStorage.getItem('token');

    if(token) {
      TestAndSetAuth(dispatch, token)
      .catch(err=>{
        window.localStorage.removeItem('token');
      });
    }
  }, []);

  useEffect(()=>{
    console.log(state);
    let newProviderState = {state, dispatch};
    setProviderState(newProviderState);
    window.providerState = newProviderState;
  }, [state]);

  useEffect(()=>{
    if(!state.api) return;

    getWealth(true);
    setInterval(getWealth, 60000);
  }, [state.api]);

  return(
    <MainContext.Provider value={providerState}>
      <App/>
    </MainContext.Provider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Wrapper/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
