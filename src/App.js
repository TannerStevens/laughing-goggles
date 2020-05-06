import React, {useContext, useState, useEffect, useRef} from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Brush } from 'recharts';
import moment from 'moment';
import { MainContext } from './context';
import { Settings } from './Settings';
import {CurrencyDisplay} from './Components/CurrencyDisplay';
import {Inventory} from './Components/Inventory';

//https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
function usePrevious(value) {
  const ref = useRef();
  useEffect(()=>{
    ref.current = value;
  });
  return ref.current;
}

function App() {
  const context = useContext(MainContext);
  const [filter, setFilter] = useState({
    timestamp: {
      $gte: moment().startOf('day').toDate(),
      $lt: moment().endOf('day').toDate()
    }
  });
  const lastFilter = usePrevious(filter);
  const [historicalWealth, setHistoricalWealth] = useState([]);

  useEffect(()=>{
    if(lastFilter !== filter) {
      context.state.db.collection('wealth').find(filter)
      .toArray()
      .then(results=>{
        setHistoricalWealth(results);
      })
    }
    else {
      let newHistoricalWealth = [...historicalWealth, {
        account_id: context.state.id,
        timestamp: new Date(),
        data: context.state.wealth
      }];
      console.log(newHistoricalWealth);
      setHistoricalWealth(newHistoricalWealth);
    }
  }, [filter, context.state.wealth]);

  return (
    <Router>
      <Switch>
        {context.state.id &&
          <Route path="/">
            <h1>
              Hello World
              <img src="https://static.staticwars.com/quaggans/construction.jpg" style={{height:"3rem", width:"3rem"}}/>
            </h1>
            {context.state.wealth &&
              <div style={{display:'flex', flexDirection:'row'}}>
                <CurrencyDisplay currency={context.state.wealth[0]} api={context.state.api} />
                <LineChart width={100} height={50}
                  data={historicalWealth}
                >
                  <Line type="monotone" dataKey={v=>v.data[0].value} stroke="#FFA71A" dot={false}/>
                </LineChart>
              </div>
            }
            <Inventory />
          </Route>
        }
        <Route path="/">
          <Settings />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
