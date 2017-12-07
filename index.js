"use strict";

const MAX_ADDR = 255; //Quantos endereços no máximo?

const 
    CIDRParser = require("./parseCidr"),
    netPing = require("./netPing"),
    netPool = require("./netPool");
(function(){
    try {
        let cidrs = process.argv.slice(2);
        let hosts = [];
        
        for(let cidr of cidrs){
            let ipRange = CIDRParser(cidr);
            let port = ipRange.port;
            if((netPool.poolSize() + ipRange.hosts.length) > MAX_ADDR)
                throw new Error(`Muitos endereços: ${ipRange.hosts.length}. Cancelado.`);

            ipRange.hosts.forEach(host=>{
                netPool.addToPool(`${host.join(".")}:${port}`);
            });
        }

        console.log("Endereços:");
        netPool.getPool().forEach(addr=>console.log(addr));
        console.log("Continuará em 2 segundos. (pressione Ctrl+C pra cancelar) ");
        
        setTimeout(function(){
            netPool.start();
        }, 2000);
    }
    catch(e){
        console.error(e.message);
        process.exit(1);
    }
})();