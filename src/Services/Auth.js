import ky from 'ky';

const gw2ApiBaseConfig = {
    prefixUrl: 'https://api.guildwars2.com/'
};

export function TestAndSetAuth(dispatch, token) {
    let config = {};
    if(process.env.NODE_ENV == "development") {
        Object.assign(config, gw2ApiBaseConfig, {
            hooks: {
                beforeRequest: [
                    request => {
                        let url = new URL(request.url);
                        let search = new URLSearchParams(url.searchParams.toString());
                        search.set("access_token", token);
                        url.search = search;
                        
                        return new Request(url, request);
                    }
                ]
            }
        })
    }
    else {
        Object.assign(config, gw2ApiBaseConfig, {
            hooks: {
                beforeRequest: [
                    request => {
                        request.headers.set('Authorization', `Bearer ${token}`)
                    }
                ]
            }
        })
    }

    return ky.get('v2/account', config).json()
    .then(data=>{
        dispatch({
            type: "mergeState",
            value: {
                api: ky.create(config),
                token,
                id: data.id,
                name: data.name,
            }
        })

        localStorage.setItem('token', token);
    });
}