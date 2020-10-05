import React, {useState, useEffect, useContext} from 'react';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {CurrencyDisplay} from './CurrencyDisplay';
import { MainContext } from '../context';

function SlotRow(props) {
    if(props.data) {
        if(props.data?.slotData?.upgrades?.length)
            return(
                <Grid
                    container
                    direction="column"
                >
                    <Grid 
                        item xs={12}
                        container 
                        direction="row" 
                        justify="space-between"
                        alignItems="stretch"
                    >
                        <Grid item xs={1}>
                            <img style={{height:'56px', width:'56px'}} src={props.data.itemData.icon} />
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
                    {props.data.slotData.upgrades.map((v,i)=>
                        <Grid item xs={12} container direction="row">
                            <Grid item xs={1}/>
                            <Grid item xs={11}>
                                <SlotRow key={i} data={v}/>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            );
        else
            return(
                <Grid 
                    container 
                    direction="row" 
                    justify="space-between"
                    alignItems="stretch"
                >
                    <Grid item xs={1}>
                        <img style={{height:'56px', width:'56px'}} src={props.data.itemData.icon} />
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

let cacheTime = moment.duration(10, 'minutes');
let dataCache = {};
async function getValues(api, ids) {
    let fetch = ids.reduce((a,id)=>{
        if(dataCache.hasOwnProperty(id) && (dataCache[id].value == null || moment() - dataCache[id].value.fetchedAt < cacheTime))
            return a;
        else
            return [...a, id];
    }, []);

    if(fetch.length) {
        await api.get(`v2/commerce/prices?ids=${fetch.join(',')}`).json()
        .then(valueData=>{
            let now = moment();
            valueData.forEach(datum=>dataCache[datum.id] = Object.assign(dataCache[datum.id] || {}, {value:datum, fetchedAt:now}));
        });
    }
    ids.forEach(id=>{
        if(!dataCache.hasOwnProperty(id))
            dataCache.value = null;
    });

    return ids.reduce((a,id)=>{
        let r = dataCache[id]?.value;
        if(r)
            return [...a, r];
        return a;
    }, []);
}
async function getDetails(api, ids) {
    let fetch = ids.reduce((a,id)=>{
        if(dataCache.hasOwnProperty(id) && dataCache[id].item != undefined)
            return a;
        else
            return [...a, id];
    }, []);

    if(fetch.length) {
        await api.get(`v2/items?ids=${fetch.join(',')}`).json()
        .then(itemData=>{
            itemData.forEach(datum=>dataCache[datum.id] = Object.assign(dataCache[datum.id] || {}, {item:datum}));
        });
    }
    ids.forEach(id=>{
        if(!dataCache.hasOwnProperty(id))
            dataCache.item = null;
    });

    return ids.reduce((a,id)=>{
        let r = dataCache[id]?.item;
        if(r)
            return [...a, r];
        return a;
    }, []);
}

export function ItemList(props) {
    const context = useContext(MainContext);
    let [itemDataList, setItemDataList] = useState([]);

    useEffect(()=>{
        if(!props.slots || props.slots.length == 0) {
            setItemDataList([]);
            return;
        }

        let allIds = [];
        let slots = props.slots.reduce((a,slot)=>{
            if(slot) {
                if(a.hasOwnProperty(slot.id)) {
                    a[slot.id].count += slot.count;
                }
                else {
                    a[slot.id] = {
                        id: slot.id,
                        count: slot.count,
                        slotData: slot
                    };

                    if(slot.upgrades) 
                        allIds.push(slot.id, ...slot.upgrades);
                    else
                        allIds.push(slot.id);
                }
            }
            return a;
        }, {});

        Promise.all([
            getDetails(context.state.api, allIds),
            getValues(context.state.api, allIds)
        ])
        .then(([itemData, valueData])=>{
            itemData = itemData.reduce((a,v)=>({ ...a, [v.id]:v }), {});
            valueData = valueData.reduce((a,v)=>({ ...a, [v.id]:v }), {});
            console.log(itemData, valueData, allIds);

            Object.values(slots).forEach(slot=>{
                let worth = 0;
                if(itemData.hasOwnProperty(slot.id)) 
                    slot.itemData = itemData[slot.id];
                if(valueData.hasOwnProperty(slot.id)) {
                    slot.valueData = valueData[slot.id];
                    worth = slot.valueData.buys.unit_price * slot.count;
                }

                if(slot.slotData.upgrades) {
                    slot.slotData.upgrades = slot.slotData.upgrades.map(id=>{
                        let vd = valueData[id];
                        if(vd)
                            worth += vd.buys.unit_price;
                        return { id, count:1, itemData:itemData[id], valueData:vd };
                    });
                }

                slot.worth = worth;
            });

            setItemDataList(Object.values(slots));
        })
    }, [props.slots]);

    console.log(itemDataList);
    return itemDataList.filter(item=>item && item.itemData).sort((a,b)=>{
        return (b.worth) - (a.worth)
    }).map((item,i)=><SlotRow key={i} data={item} />);
}