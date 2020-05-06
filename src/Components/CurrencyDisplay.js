import React, {useState, useEffect, useContext} from 'react';
import { MainContext } from '../context';

const currencies = {
    1: (value) => {
        if(value > 10000)
            return [
                [Math.floor(value / 10000), "https://render.guildwars2.com/file/090A980A96D39FD36FBB004903644C6DBEFB1FFB/156904.png"],
                [Math.floor((value / 100) % 100), "https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png"],
                [value % 100, "https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png"]
            ]
        else if(value > 100) 
            return [
                [Math.floor((value / 100) % 100), "https://render.guildwars2.com/file/E5A2197D78ECE4AE0349C8B3710D033D22DB0DA6/156907.png"],
                [value % 100, "https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png"]
            ]
        else
            return [
                [value, "https://render.guildwars2.com/file/6CF8F96A3299CFC75D5CC90617C3C70331A1EF0E/156902.png"]
            ]
    }
}

function getCurrencyData(currency, api) {
    if(currencies.hasOwnProperty(currency.id))
        return Promise.all(currencies[currency.id](currency.value));
    else
        return Promise.all([
            Promise.all([currency.value, api.get(`v2/currencies?ids=${currency.id}`).json().then(result=>result.icon)])
        ]);
}

export function CurrencyDisplay(props) {
    let context = useContext(MainContext);

    let [currencyData, setCurrencyData] = useState([]);

    useEffect(()=>{
        getCurrencyData(props.currency, context.state.api)
        .then(setCurrencyData);
    }, [props.currency]);

    return(
        <div style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
            {currencyData.length
            ? currencyData.map(([amount, imgSrc], i)=>
            <>
                <p>{amount}</p>
                <img src={imgSrc} style={{width:'1.5rem', height:'1.5rem'}}/>
            </>
            )
            : null}
        </div>
    );
}