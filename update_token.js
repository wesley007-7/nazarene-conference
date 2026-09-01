const { execSync } = require('child_process');

try {
  execSync('npx -y vercel env rm SMS_LEOPARD_ACCESS_TOKEN production -y', { stdio: 'inherit' });
  execSync('npx -y vercel env rm SMS_LEOPARD_ACCESS_TOKEN preview -y', { stdio: 'inherit' });
  execSync('npx -y vercel env rm SMS_LEOPARD_ACCESS_TOKEN development -y', { stdio: 'inherit' });
} catch (e) {} // ignore errors if it doesn't exist

const newVal = "VUlVOGJaRlZzN0szejBUYU1DOTg6bW5ORllHVklDQ1ZtUmZYeWJqZXFBdU1FSmx1TUtYVHJqR0VqV3piMg==";

console.log("Adding new value...");
try {
  execSync('npx -y vercel env add SMS_LEOPARD_ACCESS_TOKEN production,preview,development', {
    input: newVal,
    stdio: ['pipe', 'inherit', 'inherit']
  });
  console.log("Success!");
} catch (e) {
  console.error("Failed to add.");
}

