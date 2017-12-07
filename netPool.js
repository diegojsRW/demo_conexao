"use strict";

const PARALEL = 2; //Quantas tentativas paralelas?

const netPing = require("./netPing");

let pool = [];
let originalPool = [];
let success = [];
const poolDone = function(){
    console.log(`Todos os endereços foram tentados. `);
    console.log(`${success.length} de ${originalPool.length} endereços responderam`);
}
const poolCallback = function(addr,msg,ret){
    if(ret)
        success.push(addr);
    
    console.log(`${addr}: ${msg} (${ret})`);
    if(!poolIsEmpty())
        nextPool();
    else 
        poolDone();
}
const poolIsEmpty = function(){ 
    return poolSize() == 0;
}
const nextPool = function(){

    let addr = pool.shift();
    let [ip,port] = addr.split(":");
    netPing(ip,port,poolCallback);
}
const start = function(){
    for(let i = 0; i < PARALEL; i++)
        nextPool();
}
const addToPool = function(addr){
    pool.push(addr);
    originalPool.push(addr);
}
const poolSize = function(){
    return pool.length;
}
const getPool = function(){
    return pool;
}

module.exports = exports = {
    start, addToPool, poolSize, getPool
};