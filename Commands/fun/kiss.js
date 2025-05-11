const fetch = require('node-fetch');

module.exports = {
  name: 'kiss',
  category: 'fun',
  description: 'Kiss someone!',
  usage: 'kiss @user',
  execute: async (client, message, args) => {
    const user = message.mentions.users.first();
    if (!user) return message.reply('Please mention someone to kiss!');

    const response = await fetch('https://nekos.best/api/v2/kiss');
    const data = await response.json();
    const gif = data.results[0].url;

    message.channel.send({
      content: `${message.author} kisses ${user}!`,
      files: [gif]
    });
  }
};
