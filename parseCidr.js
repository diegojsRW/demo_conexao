"use strict";

// Exemplo de query:
//192.168.1.0/24:3000

// ---------------------------------

/** @param {string} ip @returns {Error} */
const validateIP = function(ip){
    if(typeof ip !== "string") 
        return Error("O IP informado não é uma string");

    let ipregex = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if(ipregex === null) 
        return Error("O IP informado não corresponde com o formato ###.###.###.###");
    
    let octets = [...ipregex].slice(1);
    for(let idx in octets){
        let octet = parseInt(octets[idx]);
        if(isNaN(octet) || octet < 0 || octet > 255) 
            return Error(`O ${idx+1}º octeto do IP não é número ou não está dentro do intervalo 0-255 (recebeu ${octet})`);
    }

    return null;
}

/** @param {string} num @param {number} low @param {number} high @returns {Error} */
const validateNumber = function(num, low, high){
    if(typeof num !== "string")
        return Error("Esperava uma string a ser interpretada.");
    
    let parsedNum = parseInt(num);
    if(isNaN(parsedNum) || ((low && parsedNum < low) || (high && parsedNum > high))) 
        return Error(`A string informada não é um número ou não está dentro do intervalo ${low}-${high} (recebeu ${parsedNum})`);
    
    return null;
}

/** @param {string} ip @param {number} netbits @param {number} port */
const readQuery = function(ip, netbits, port){
    let ipOctets = ip.split(".").map(octet=>parseInt(octet));

    /*
    Exemplos:
    23: 255.255.254.0  ///    0.0.1.255 
    24: 255.255.255.0  ///    0.0.0.255
    25: 255.255.255.128 ///   0.0.0.127 
    26: 255.255.255.192 ///   0.0.0.63
    */
    let maskHostOctets = Array(4).fill(0).map((octet, idx)=>{
        let octetPos = ((idx+1) * 8);

        if(octetPos <= netbits)
            return 0;

        let octetValue = (octetPos - netbits);
        if(octetValue>8) octetValue = 8;

        return 2**octetValue-1;
    });
    let subnet = maskHostOctets.map(octet=>255-octet);

    let ipStart = ipOctets.map((octet,idx) => {
        return octet & (subnet[idx]);
    });
    let ipEnd = ipOctets.map((octet,idx) => {
        return octet & (subnet[idx]) | maskHostOctets[idx];
    });
    let hostsCount = 2 ** (32 - netbits); // Menos o broadcast e gateway?
    let hosts = [];

    if(netbits > 23){ //Defina um número que considere viável não causar algum tipo de overflow
        for(let i = 0; i < hostsCount; i++){
            hosts.push(ipStart.map((octet,idx)=>{
                // let octetPos = idx * 8;
                return octet + Math.floor((i / (255 ** (3-idx))) % 255);
            }));
        }//  255*255*255*255, 255*255*255 ,255*255, 255
    }
    return {
        start: ipStart,
        end: ipEnd,
        port,
        mask: maskHostOctets,
        subnet,
        length: hostsCount,
        hosts
    }
};

/** @param {string} query */
const validateQuery = function(query){
    
    // Escolha entre deixar a máscara de rede obrigatória
    // let regx = query.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})\:(\d{1,6})/); 
    
    //ou opcional.
    let regx = query.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:\/(\d{1,2}))?\:(\d{1,6})/);
    let lastError = null;

    if(regx === null) 
        throw new Error("Parâmetro incorreto. Formato esperado: ###.###.###.###[/##]:#####");

    let [ip, netbits, port] = [...regx].slice(1);

    if(lastError = validateIP(ip))
        throw new Error(`IP inválido. IP informado foi ${ip}. Detalhes: ${lastError.message}.`);
    
    if(lastError = validateNumber(port, 1, 65535))
        throw new Error(`Porta inválida. Porta informada foi ${port}. Detalhes: ${lastError.message}`);

    if(netbits && (lastError = validateNumber(netbits, 1, 32)))
        throw new Error(`Máscara de rede inválida. Máscara informada foi ${netbits}. Detalhes: ${lastError.message}`);
    
    return readQuery(ip, parseInt(netbits), parseInt(port));
}


module.exports = exports = validateQuery;