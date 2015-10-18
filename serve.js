const koa = require('koa');
const chalk = require('chalk');
const router = require('koa-router')();
const https = require('https');
const fs = require('fs');

const PORT_NUMBER = 3000;

// 服务端私钥
const key = fs.readFileSync('./ssl/server/server.key');
// 服务端证书
const cert = fs.readFileSync('./ssl/server/server.crt');
// CA 证书
const ca = fs.readFileSync('./ssl/ca/ca.crt');

const options = {
    key,
    cert,
    ca,

    // "咳咳, 客户端, 交出你们的 certificate" -- 服务端
    requestCert: true,
    // "没有证书的人的人也放过来吧, 但是..." -- 服务端
    rejectUnauthorized: false
};

const app = koa();

const server = https.createServer(options, app.callback());

app.use(router.routes());

router.get('/', function* () {
    if (this.req.client.authorized) {
        // "让我来看看是谁在访问" -- 服务端
        let subject = this.req.connection.getPeerCertificate().subject;

        this.body = `Welcome to The Awesome Site, ${chalk.green(subject.CN)} from ${chalk.green(subject.O)}.
I hope the weather is nice in ${chalk.green(subject.L)}, ${chalk.green(subject.C)}`;
    } else {
        // "但是你们只能看到这些" -- 服务端
        this.body = `Cough cough, YOU ARE NOT ${chalk.red('AUTHORIZED')}`;
    }
});

server.listen(PORT_NUMBER, () => {
    let port = server.address().port;
    console.log(`Server running on port ${chalk.green(port)}`);
});
