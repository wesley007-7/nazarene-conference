export async function sendSMS(to: string[], message: string) {
    const apiKey = process.env.SMSLEOPARD_API_KEY || '';
    const apiSecret = process.env.SMSLEOPARD_API_SECRET || '';
    const senderId = process.env.SMSLEOPARD_SENDER_ID || 'SMSLeopard';

    if (!apiKey || !apiSecret) {
        console.log('SMS Leopard credentials missing. Mocking SMS to:', to, 'Message:', message);
        return;
    }

    try {
        const destination = to.map(number => ({ number }));
        const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

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

