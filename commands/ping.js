const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the latency between when your message is sent and the bot receives it"),
    async execute(interaction) {
        var time1 = Date.now() - interaction.createdTimestamp
        var time2 = Math.abs(time1)

        const embed1 = new EmbedBuilder()
        .setColor("#FFFFFF")
        .setTitle("Interaction Reply Latency")
        .setDescription(`${time2} ms`)
        .setFooter({ text: 'Warning, this value is usually innacurate. Server Date and Time may be mismatched.' });

        await interaction.reply({ embeds: [embed1], ephemeral: true });
    }
}