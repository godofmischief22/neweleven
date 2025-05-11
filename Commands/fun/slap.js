const fetch = require('node-fetch');

module.exports = {
  name: 'slap',
  category: 'fun',
  description: 'Slap someone!',
  usage: 'slap @user',
  execute: async (client, message, args) => {
    const user = message.mentions.users.first();
    if (!user) return message.reply('Please mention someone to slap!');

    const response = await fetch('https://nekos.best/api/v2/slap');
    const data = await response.json();
    const gif = data.results[0].url;

    message.channel.send({
      content: `${message.author} slaps ${user}!`,
      files: [gif]
    });
  }
};
