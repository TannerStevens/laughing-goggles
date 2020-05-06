import React, { useContext, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { MainContext } from './context';
import { TestAndSetAuth } from './Services/Auth';

export function Settings(props) {
    const context = useContext(MainContext);
    const [token, setToken] = useState(context.state.token || "");
    const inputRef = useRef(null);
    const formRef = useRef(null);

    function onSubmit() {
        let valid = Array.prototype.reduce.call(formRef.current, (a,v)=>v.validity.valid && a, true);
        if(!valid) return;

        TestAndSetAuth(context.dispatch, token)
        .catch(err=>{
            setToken("");
        });
    }

    return(
        <form autoComplete="off"
            ref={formRef}
        >
            <TextField label="API Key"
                value={token}
                inputProps={{
                    required: true
                }}

                onChange={(e)=>setToken(e.target.value)}
            />

            <Button onClick={onSubmit}>
                Set
            </Button>
        </form>
    );
}