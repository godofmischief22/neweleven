const { SlashCommandBuilder } = require('discord.js');
const songs = require('../Data/guessSongs.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guesssong')
    .setDescription('Play a "Guess the Song" game!'),

  async execute(interaction, client) {
    const vc = interaction.member.voice.channel;
    if (!vc) return interaction.reply({ content: "Join a voice channel first!", ephemeral: true });

    const player = client.manager.create({
      guild: interaction.guildId,
      voiceChannel: vc.id,
      textChannel: interaction.channelId,
      selfDeafen: true,
    });

    const song = songs[Math.floor(Math.random() * songs.length)];

    await interaction.reply("Guess the song! You have 20 seconds...");
    player.connect();

    const res = await player.search(song.url, interaction.user);
    if (res.loadType === "NO_MATCHES") return interaction.followUp("Couldn't find the song.");

    player.queue.add(res.tracks[0]);
    player.play();

    setTimeout(() => player.stop(), 10000); // Play 10 seconds

    const channel = await client.channels.fetch(interaction.channelId);
    const collector = channel.createMessageCollector({ time: 20000 });

    collector.on('collect', msg => {
      if (msg.content.toLowerCase().includes(song.title.toLowerCase())) {
        collector.stop("guessed");
        msg.reply(`Correct! The song was **${song.title}**`);
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== "guessed") interaction.followUp(`Time's up! The song was **${song.title}**`);
      player.destroy();
    });
  }
};
