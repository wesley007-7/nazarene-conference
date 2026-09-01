const token = "VUlVOGJaRlZzN0szejBUYU1DOTg6bW5ORllHVklDQ1ZtUmZYeWJqZXFBdU1FSmx1TUtYVHJqR0VqV3piMg==";

async function testSMS() {
  try {
    const response = await fetch('https://api.smsleopard.com/v1/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'This is a test message from Nazarene Conference',
        destination: [{ number: '+254721441269' }]
      })
    });

    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSMS();

