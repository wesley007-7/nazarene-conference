export async function sendSMS(to: string[], message: string) {
    const accessToken = process.env.SMS_LEOPARD_ACCESS_TOKEN;
    const senderId = process.env.SMSLEOPARD_SENDER_ID || 'SMS_TEST';

    if (!accessToken) {
        console.log('SMS Leopard credentials missing. Mocking SMS to:', to, 'Message:', message);
        return;
    }

    try {
        const destination = to.map(number => ({ number }));
        // The token is already base64 encoded (key:secret)
        const credentials = accessToken;

        const response = await fetch('https://api.smsleopard.com/v1/sms/send', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source: senderId,
                message: message,
                destination: destination
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('SMS Leopard error:', errorText);
            return;
        }

        const data = await response.json();
        console.log('SMS Leopard sent:', data);
    } catch (error) {
        console.error('Error sending SMS via SMS Leopard:', error);
    }
}

