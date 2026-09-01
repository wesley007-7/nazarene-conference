const { execSync } = require('child_process');
const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const lines = envContent.split('\n');

for (const line of lines) {
  if (!line.trim() || line.startsWith('#')) continue;
  
  const splitIdx = line.indexOf('=');
  if (splitIdx === -1) continue;
  
  const key = line.slice(0, splitIdx).trim();
  let val = line.slice(splitIdx + 1).trim();
  
  // Remove surrounding quotes if present
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.slice(1, -1);
  }
  
  // Skip specific keys
  if (['NEXTAUTH_URL', 'SMS_LEOPARD_ACCESS_TOKEN', 'NEON_API_KEY', 'PAYSTACK_PUBLIC_KEY', 'PAYSTACK_SECRET_KEY', 'AT_USERNAME', 'AT_API_KEY'].includes(key)) {
    continue;
  }
  
  if (val) {
    console.log(`Adding ${key} to Vercel...`);
    try {
      execSync(`npx -y vercel env add ${key} production,preview,development`, {
        input: val,
        stdio: ['pipe', 'inherit', 'inherit']
      });
    } catch (e) {
      console.error(`Failed to add ${key}`);
    }
  }
}

