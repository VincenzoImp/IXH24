import * as paillier from 'paillier-bigint';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

async function generateKeys() {
    const env = resolve(process.cwd(), '.env.local');
    try {
        const publicKey = process.env.PAILLIER_PUBLIC_KEY ? BigInt(process.env.PAILLIER_PUBLIC_KEY) : undefined;
        const privateKey = process.env.PAILLIER_PRIVATE_KEY ? BigInt(process.env.PAILLIER_PRIVATE_KEY) : undefined;
        return { publicKey, privateKey };
    } catch (error) {
        const { publicKey, privateKey } = await paillier.generateRandomKeys(1024);
        writeFileSync(env, `PAILLIER_PUBLIC_KEY=${publicKey}\nPAILLIER_PRIVATE_KEY=${privateKey}`);
        return { publicKey, privateKey };
    }
}

const { publicKey, privateKey } = await generateKeys();

async function encrypt(publicKey: paillier.PublicKey, value: bigint) {
    return publicKey.encrypt(value);
}

async function decrypt(privateKey: paillier.PrivateKey, value: bigint) {
    return privateKey.decrypt(value);
}

function sum_encrypted(publicKey: paillier.PublicKey, ...values: bigint[]) {
    return publicKey.addition(...values);
}

export { encrypt, decrypt, sum_encrypted, publicKey, privateKey };