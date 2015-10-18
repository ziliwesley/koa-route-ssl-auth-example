const request = require('request');
const fs = require('fs');

const options = {
    url: 'https://localhost:3000',
    // 客户端私钥
    key: fs.readFileSync('./ssl/client/client.key'),
    // 客户端证书
    cert: fs.readFileSync('./ssl/client/client.crt'),
    // CA 证书
    ca: fs.readFileSync('./ssl/ca/ca.crt')
};

request
    .get(options, (err, reponse, body) => {
        if (err) {
            return console.error(err);
        }

        console.log(body);
    });
