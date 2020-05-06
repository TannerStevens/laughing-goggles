import React, {useState, useEffect, useContext} from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {CurrencyDisplay} from './CurrencyDisplay';
import { MainContext } from '../context';

function SlotRow(props) {
    if(props.data) {
        return(
            <Grid 
                container 
                direction="row" 
                justify="space-between"
                alignItems="stretch"
            >
                <Grid item xs={1}>
                    <img style={{height:'100%', width:'100%'}} src={props.data.itemData.icon} />
                </Grid>
                <Grid item xs={3}>
                    <Typography>
                        {props.data.itemData.name}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    { props.data.valueData
                    ? <CurrencyDisplay currency={{id: 1, value: props.data.valueData.buys.unit_price}} />
                    : null
                    }
                </Grid>
                <Grid item xs={2}>
                    <Typography>
                        {props.data.count}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    { props.data.valueData
                    ? <CurrencyDisplay currency={{id: 1, value: (props.data.valueData.buys.unit_price * props.data.count)}} />
                    : null
                    }
                </Grid>
            </Grid>
        );
    }
    return null;
}

export function ItemList(props) {
    const context = useContext(MainContext);
    let [itemDataList, setItemDataList] = useState([]);

    useEffect(()=>{
        if(!props.slots || props.slots.length == 0) {
            setItemDataList([]);
            return;
        }

        let items = props.slots.reduce((a,slot)=>{
            if(slot) {
                if(a.hasOwnProperty(slot.id)) {
                    a[slot.id].count += slot.count;
                }
                else {
                    a[slot.id] = {
                        id: slot.id,
                        count: slot.count
                    };
                }
            }
            return a;
        }, {});

        let ids = Object.keys(items).join(',');
        Promise.all([
            context.state.api.get(`v2/items?ids=${ids}`).json(),
            context.state.api.get(`v2/commerce/prices?ids=${ids}`).json()
        ])
        .then(([itemData, valueData])=>{
            itemData.forEach(datum=>{
                items[datum.id].itemData = datum;
            })
            valueData.forEach(datum=>{
                items[datum.id].valueData = datum;
            })

            setItemDataList(Object.values(items));
        })
    }, [props.slots]);

    console.log(itemDataList);
    return itemDataList.map((item,i)=>
        item && item.valueData
        ? <SlotRow key={i} data={item} />
        : null
    );
}