import crypto from "crypto";

const commerce_code = process.env.NEXT_PUBLIC_COMMERCE_CODE;
const secret_code = process.env.NEXT_PUBLIC_SECRET_CODE;

const sha256Sign = (merchantKey, order, params) => {
    const orderKeyBuf = encrypt3DES(merchantKey, order);
    return crypto.createHmac('sha256', orderKeyBuf).update(params).digest('base64');
}

const zeroPad = (buf, blocksize) => {
    const pad = Buffer.alloc((blocksize - (buf.length % blocksize)) % blocksize, 0);
    return Buffer.concat([buf, pad]);
}

const encrypt3DES = (key, message) => {
    const keyBuf = Buffer.from(key, 'base64');
    const iv = Buffer.alloc(8, 0);

    const messageBuf = Buffer.from(message.toString(), 'utf8');
    // Align to blocksize by padding the message buffer
    const paddedMessageBuf = zeroPad(messageBuf, 8);

    const cipher = crypto.createCipheriv('des-ede3-cbc', keyBuf, iv);
    cipher.setAutoPadding(false);
    const encryptedBuf = Buffer.concat([cipher.update(paddedMessageBuf), cipher.final()]);

    // Make sure that encrypted buffer is not longer than the padded message
    const maxLength = Math.ceil(messageBuf.length / 8) * 8;
    return encryptedBuf.slice(0, maxLength);
}

export const getSignedPayment = (amount, url, urlko, urlok, payment_id, isBizum) => {
    const payment = {
        DS_MERCHANT_AMOUNT: (amount * 100).toString(), // Hay que ponerlo en céntimos de euro
        DS_MERCHANT_CURRENCY: 978, // EUR
        DS_MERCHANT_MERCHANTCODE: commerce_code,
        DS_MERCHANT_MERCHANTURL: url,
        DS_MERCHANT_ORDER: payment_id,
        DS_MERCHANT_TERMINAL: 1,
        DS_MERCHANT_TRANSACTIONTYPE: 0,
        DS_MERCHANT_URLKO: urlko,
        DS_MERCHANT_URLOK: urlok,
        DS_MERCHANT_PAYMETHODS: isBizum ? "z" : "c",
    }
    const strPayment = JSON.stringify(payment);
    const b64payment = Buffer.from(strPayment).toString('base64');
    const signature = sha256Sign(secret_code, payment.DS_MERCHANT_ORDER, b64payment);
    return {
        Ds_MerchantParameters: b64payment,
        Ds_Signature: signature,
        Ds_SignatureVersion: "HMAC_SHA256_V1"
    }
}