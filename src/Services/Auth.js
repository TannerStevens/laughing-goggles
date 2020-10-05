import ky from 'ky';

const gw2ApiBaseConfig = {
    prefixUrl: 'https://api.guildwars2.com/'
};

export function TestAndSetAuth(dispatch, token) {
    let config = {};
    Object.assign(config, gw2ApiBaseConfig, {
        hooks: {
            beforeRequest: [
                request => {
                    let url = new URL(request.url);
                    let search = new URLSearchParams(url.searchParams.toString());
                    search.set("access_token", token);
                    // Hacky way of avoiding Caching without proc'ing CORS preflights...
                    search.set("_", Date.now());
                    url.search = search;
                    
                    return new Request(url, request);
                }
            ]
        }
    })

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