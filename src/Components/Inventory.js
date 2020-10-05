import React, {useState, useContext, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/Menuitem';
import { ItemList } from './ItemList';
import { MainContext } from '../context';

export function Inventory(props) {
    let context = useContext(MainContext);
    let [selectedCharacter, setSelectedCharacter] = useState("");
    let [characterList, setCharacterList] = useState([]);
    let [inventoryList, setInventoryList] = useState([]);
    let [update, setUpdate] = useState(false);

    useEffect(()=>{
        context.state.api.get('v2/characters').json()
        .then(setCharacterList);
    }, [context.id]);

    useEffect(()=>{
        if(!selectedCharacter) {
            setInventoryList([]);
        }
        else {
            context.state.api.get(`v2/characters/${encodeURI(selectedCharacter)}/inventory`).json()
            .then(({bags})=>
                setInventoryList(bags.reduce((a,v)=>[...a, ...v.inventory], []))
            );
        }
        setUpdate(false);
    }, [selectedCharacter, context.id, update]);

    return(
        <div>
            <div>
                <InputLabel>Character</InputLabel>
                <Select
                    value={selectedCharacter}
                    onChange={e=>setSelectedCharacter(e.target.value)}
                >
                    {characterList.map(v=>
                        <MenuItem key={v} value={v}>{v}</MenuItem>
                    )}
                </Select>
                <Button onClick={()=>setUpdate(true)}>Refresh</Button>
            </div>
            <ItemList slots={inventoryList} />
        </div>
    );
}