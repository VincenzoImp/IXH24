import * as paillier from 'paillier-bigint';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function getKeyPair() {
    // if fheKeypair.json exists, read it and return the keys
    try {
        const keyPair = require('./fheKeyPair.json');
        return keyPair;
    } catch (e) {
        // if fheKeypair.json does not exist, generate a new keypair
        const { publicKey, privateKey } = await paillier.generateRandomKeys(3072);
        writeFileSync(resolve(__dirname, './fheKeyPair.json'), JSON.stringify({ publicKey, privateKey }));
        return { publicKey, privateKey };
    }
}   

async function encrypt(publicKey: paillier.PublicKey, value: bigint) {
    return publicKey.encrypt(value);
}

async function decrypt(privateKey: paillier.PrivateKey, value: bigint) {
    return privateKey.decrypt(value);
}

function sum_encrypted(publicKey: paillier.PublicKey, ...values: bigint[]) {
    return publicKey.addition(...values);
}

export { encrypt, decrypt, sum_encrypted, getKeyPair };