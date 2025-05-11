const songs = require('../Data/guessSongs.json');

module.exports = {
  name: 'guesssong',
  description: 'Play a game to guess the song from a short audio clip!',
  async execute(message, args, client) {
    const vc = message.member.voice.channel;
    if (!vc) return message.reply('Join a voice channel first!');

    const player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: vc.id,
      textChannel: message.channel.id,
      selfDeafen: true,
    });

    const song = songs[Math.floor(Math.random() * songs.length)];

    await message.reply('Guess the song! You have 20 seconds...');
    player.connect();

    const res = await player.search(song.url, message.author);
    if (res.loadType === 'NO_MATCHES') return message.channel.send("Couldn't find the song.");

    player.queue.add(res.tracks[0]);
    player.play();

    setTimeout(() => player.stop(), 10000); // Play only first 10 seconds

    const filter = msg => msg.channel.id === message.channel.id;
    const collector = message.channel.createMessageCollector({ filter, time: 20000 });

    collector.on('collect', msg => {
      if (msg.content.toLowerCase().includes(song.title.toLowerCase())) {
        collector.stop('guessed');
        msg.reply(`Correct! The song was **${song.title}**`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'guessed') message.channel.send(`Time's up! The song was **${song.title}**`);
      player.destroy();
    });
  }
};
