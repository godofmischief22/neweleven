require('dotenv').config();
console.log("DISCORD_TOKEN:", process.env.DISCORD_TOKEN ? "✓ Exists (Length: " + process.env.DISCORD_TOKEN.length + ")" : "✗ Missing");
console.log("CLIENT_ID:", process.env.CLIENT_ID ? "✓ Exists (Length: " + process.env.CLIENT_ID.length + ")" : "✗ Missing");
console.log("TOKEN:", process.env.TOKEN ? "✓ Exists (Length: " + process.env.TOKEN.length + ")" : "✗ Missing");