const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js-selfbot-v13');

const tokens = fs.readFileSync('tokens.txt', 'utf8').split('\n').filter(Boolean).map(x => x.trim());
const spamInterval = 3500;

function startSpam(channel) {
  console.log(`Starting spamming in channel: ${channel.name}`);
  channel.send("<@716390085896962058> redirect spawn ")
    .catch(console.error);

  const messages = fs.readFileSync('messages.txt', 'utf8').split('\n');
  const randomMessage = () => messages[Math.floor(Math.random() * messages.length)];

  const spamLoop = () => {
    const messageToSend = randomMessage();
    channel.send(messageToSend)
      .catch(console.error);
    setTimeout(spamLoop, spamInterval);
  };

  spamLoop();
}

function findBroChannel(guilds) {
  for (const guild of guilds) {
    const broChannel = guild.channels.cache.find(channel => channel.name === 'spam' && channel.type === 'GUILD_TEXT');
    if (broChannel) return broChannel;
  }
  return null;
}

function handleReady(client, token) {
  console.log(`Logged in as \x1b[34m${client.user.tag}\x1b[0m!`);
  let spammingChannel = null;
  
  const guilds = client.guilds.cache.values();
  spammingChannel = findBroChannel(guilds);
  if (spammingChannel) {
    startSpam(spammingChannel);
  } else {
    console.log(`\x1b[33mNo "broskie" channel found in ${token}.\x1b[0m`);
  }

  client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (message.channel === spammingChannel) {
      if (message.content === '!stopspam') {
        spammingChannel = null;
        console.log(`Spamming stopped.`);
      }
    }
  });
}

tokens.forEach(token => {
  const bot = new Client();
  bot.on('ready', () => handleReady(bot, token));
  bot.login(token)
    .catch(error => console.error(`\x1b[31mInvalid token: ${token}\x1b[0m`, error));
});
