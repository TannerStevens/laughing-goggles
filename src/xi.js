export function isSimilar(a,b) {
    console.log(a,b);
    if(a == b) return true;
    if(typeof a !== typeof b) return false;

    if(typeof a == 'object') {
        Object.keys(a).forEach(([k,v])=>{
            if(!isSimilar(a[k], b[k])) return false;
        })
        return true;
    }
    else {
        return a == b;
    }
}