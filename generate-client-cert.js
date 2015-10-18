const openssl = require('openssl-wrapper');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require("fs"));

const CLIENT_CERT_PATH = './ssl/client';
const CA_KEY_PATH = './ssl/ca/ca.key';
const CA_CERT_PATH = './ssl/ca/ca.crt';

const print = process.stdout.write.bind(process.stdout);

let filename;

//
// Program Start
//

// Check existence of CA certificate
print(`Looking for ${chalk.blue('CA certificate')} from: ${chalk.magenta(CA_CERT_PATH)}`);

fs.statAsync(CA_CERT_PATH)
    .then((stats) => {
        print(chalk.green(' [Found]\n'));

        // Guide user to input name of certificate files
        return new Promise((resolve) => {
            inquirer.prompt([
                {
                    name: 'filename',
                    message: 'Name of certificate files',
                    type: 'input'
                }
            ], resolve);
        });
    }, () => {
        throw new Error('CA certificate not found.');
    })
    .then((answers) => {
        let path;

        filename = answers.filename.toLowerCase();
        path = `${CLIENT_CERT_PATH}/${filename}.key`;

        print(`Creating private: ${chalk.magenta(path)}`);
        return openssl.qExec('genrsa', {
            'out': path,
            '2048': false
        });
    })
    .then((result) => {
        print(chalk.green(' [Created]\n'));
        console.log(result.toString());

        // Guide user to input name of certificate signing request
        return new Promise((resolve) => {
            inquirer.prompt([
                {
                    name: 'C',
                    message: 'Country Name',
                    default: 'CN'
                },
                {
                    name: 'ST',
                    message: 'State or Province Name',
                    default: 'Shanghai'
                },
                {
                    name: 'L',
                    message: 'Locality Name',
                    default: 'Shanghai'
                },
                {
                    name: 'O',
                    message: 'Organization Name'
                },
                {
                    name: 'OU',
                    message: 'Organization Unit Name'
                },
                {
                    name: 'CN',
                    message: 'Your name'
                }
            ], resolve);
        });
    })
    .then((answers) => {
        let keyPath, csrPath;
        let subject = '';

        keyPath = `${CLIENT_CERT_PATH}/${filename}.key`;
        csrPath = `${CLIENT_CERT_PATH}/${filename}.csr`;

        Object.keys(answers)
            .forEach((key) => {
                let value = answers[key];

                if (value.length > 0) {
                    subject += `/${key}=${value}`;
                }
            });

        print(`Creating CSR: ${chalk.magenta(csrPath)}`);
        return openssl.qExec('req', {
            key: keyPath,
            new: true,
            subj: subject,
            out: csrPath
        });
    })
    .then((result) => {
        let keyPath, csrPath, crtPath;

        print(chalk.green(' [Created]\n'));

        keyPath = `${CLIENT_CERT_PATH}/${filename}.key`;
        csrPath = `${CLIENT_CERT_PATH}/${filename}.csr`;
        crtPath = `${CLIENT_CERT_PATH}/${filename}.crt`;

        print(`Signing: ${chalk.magenta(crtPath)}\n`);
        return openssl.qExec('x509', {
            req: true,
            in: csrPath,
            CA: CA_CERT_PATH,
            CAkey: CA_KEY_PATH,
            CAcreateserial: true,
            days: 365,
            out: crtPath
        });
    })
    .then((stdout) => {
        console.log(stdout);
        console.log(chalk.green('[Finished]\n'));
    }, (stderr) => {
        console.log(stderr);
        console.log(chalk.green('[Finished]\n'));
    })
    .catch((err) => {
        const message = err instanceof Error ? err.message : err;

        console.log(`\nScript terminated due to: ${chalk.red(message)}`);
    });
