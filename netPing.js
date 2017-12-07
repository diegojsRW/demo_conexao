"use strict";

const 
    net = require("net");


const tryConnAddress = function(ip, port, cb){
    let addr = `${ip}:${port}`;
    console.log(`Conectando em ${addr}...`);
    let conn = net.createConnection(port, ip, ()=>{
        conn.end();
        cb(addr, "Conexão estabelecida", true);
    });

    conn.on("error", err=>{
        let msg;
        switch(err.code){
            case "ECONNREFUSED":
                msg = "Conexão recusada pelo servidor (recusado pelo firewall ou porta fechada)";
                break;
            case "ETIMEDOUT":
                msg = "Conexão falhou (host não encontrado ou porta fechada)";
                break;
            default:
                msg = "Erro desconhecido: " + err.code;
        }

        cb(addr, msg, false)
    });
}

module.exports = exports = tryConnAddress;