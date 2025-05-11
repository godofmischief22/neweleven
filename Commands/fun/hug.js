const fetch = require('node-fetch');

module.exports = {
  name: 'hug',
  category: 'fun',
  description: 'Hug someone!',
  usage: 'hug @user',
  execute: async (client, message, args) => {
    const user = message.mentions.users.first();
    if (!user) return message.reply('Please mention someone to hug!');

    const response = await fetch('https://nekos.best/api/v2/hug');
    const data = await response.json();
    const gif = data.results[0].url;

    message.channel.send({
      content: `${message.author} hugs ${user}!`,
      files: [gif]
    });
  }
};
