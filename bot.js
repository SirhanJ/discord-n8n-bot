const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// CONFIGURATION - Secure version for cloud deployment
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://hsproperty.app.n8n.cloud/webhook/discord-message';
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID || '1389765308822327377';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// When bot starts
client.once('ready', () => {
  console.log('🤖 Discord Bot is ONLINE and ready!');
  console.log(`📡 Bot Name: ${client.user.tag}`);
  console.log(`📺 Watching Channel ID: ${TARGET_CHANNEL_ID}`);
  console.log(`🔗 Sending to n8n: ${N8N_WEBHOOK_URL}`);
  console.log('🎯 Ready to process messages!\n');
});

// When someone sends a message
client.on('messageCreate', async (message) => {
  // Only process messages from your target channel
  if (message.channel.id !== TARGET_CHANNEL_ID) {
    return;
  }
  
  // Don't process messages from bots
  if (message.author.bot) {
    console.log('🤖 Ignoring bot message');
    return;
  }

  // Don't process empty messages
  if (!message.content || message.content.trim() === '') {
    console.log('📭 Ignoring empty message');
    return;
  }

  console.log(`\n📨 NEW MESSAGE DETECTED!`);
  console.log(`👤 From: ${message.author.username}`);
  console.log(`💬 Message: "${message.content}"`);
  
  // Prepare data for n8n
  const webhookData = {
    content: message.content,
    author: {
      id: message.author.id,
      username: message.author.username,
      bot: message.author.bot
    },
    channel_id: message.channel.id,
    id: message.id,
    timestamp: message.createdAt.toISOString()
  };

  console.log('🚀 Sending to n8n workflow...');

  // Send to n8n webhook
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, webhookData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS! Sent to n8n');
    console.log(`📊 Response Status: ${response.status}`);
    console.log('🔄 n8n workflow should now be processing...\n');
    
  } catch (error) {
    console.error('❌ FAILED to send to n8n:');
    console.error(`💬 Error: ${error.message}`);
    console.log('🔄 Will try again on next message...\n');
  }
});

// Handle errors
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Start the bot
console.log('🚀 Starting Discord Bot...');
client.login(BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login:', error.message);
});