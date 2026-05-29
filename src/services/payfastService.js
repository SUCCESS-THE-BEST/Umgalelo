const crypto = require('crypto');

function generateSignature(data, passphrase = null) {
    let pfOutput = '';

    Object.keys(data).forEach(key => {
        if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
            pfOutput += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
        }
    });

    let getString = pfOutput.slice(0, -1);

    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    }

    return crypto
        .createHash('md5')
        .update(getString)
        .digest('hex');
}

function createPayfastPayment({
    userId,
    societyId,
    amount,
    month,
    itemName
}) {
    const paymentId =
        `UMG-${userId}-${societyId}-${month}-${Date.now()}`;

    const data = {
        merchant_id: process.env.PAYFAST_MERCHANT_ID,
        merchant_key: process.env.PAYFAST_MERCHANT_KEY,

        return_url:
            `${process.env.FRONTEND_URL}/src/view/html/society.html?id=${societyId}`,

        cancel_url:
            `${process.env.FRONTEND_URL}/src/view/html/society.html?id=${societyId}`,

        notify_url:
            `${process.env.BACKEND_URL}/api/contributions/payfast/itn`,

        m_payment_id: paymentId,
        amount: Number(amount).toFixed(2),
        item_name: itemName,

        custom_int1: userId,
        custom_int2: societyId,
        custom_str1: month
    };

    data.signature = generateSignature(
        data,
        process.env.PAYFAST_PASSPHRASE
    );

    const queryString =
        new URLSearchParams(data).toString();

    return {
        paymentUrl: `${process.env.PAYFAST_URL}?${queryString}`,
        paymentId
    };
}

module.exports = {
    createPayfastPayment,
    generateSignature
};