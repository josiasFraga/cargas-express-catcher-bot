const moment = require('moment-timezone');
moment.locale('pt-br');

async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    const mysql = require("mysql2/promise");
    //const connection = await mysql.createConnection("mysql://root:@localhost:3306/rentalbot");
    const connection = await mysql.createConnection("mysql://zapshopc_cargas_express_catcher:zap3537shop11@zapshop.com.br:3306/zapshopc_cargas_express_catcher_gilmar");
    //const connection = await mysql.createConnection("mysql://rentalbot:zap3537shop11@190.102.40.78:3306/rentalbot");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}
//connect();

async function insertData(data) {

    const conn = await connect();
    const query = 'INSERT INTO dados (created, dados) VALUES(?,?)';
    const values = [data.created, data.dados];
    return await conn.query(query, values);

}

module.exports = {insertData};
