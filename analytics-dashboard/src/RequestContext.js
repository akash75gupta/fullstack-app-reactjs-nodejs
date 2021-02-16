import NodeCache from  "node-cache" ;

let cache = new NodeCache();

export const setCobrandId = (id) =>{
    cache.set( "cobrandId", id);
}

export const getCobrandId = () =>{
    return cache.get("cobrandId");
}


export const setMemId = (id) =>{
    cache.set("memId", id);
}

export const getMemId = () =>{
    return cache.get("memId");
}

export const setUsername = (uname) =>{
    cache.set("username", uname);
}

export const getUsername = () =>{
    return cache.get("username");
}

export const setEmail = (email) =>{
    cache.set( "email", email);
}

export const getEmail = () =>{
    return cache.get("email");
}
