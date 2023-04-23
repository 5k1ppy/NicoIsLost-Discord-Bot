const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Echos your input")
        .addStringOption((option) =>
            option.setName('input')
                  .setDescription('The input to echo back')
                  .setRequired(true)),

        async execute(interaction) {
                const embed1 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setTitle("Echoed Input")
                .setDescription(interaction.options.getString("input"))
                 
            interaction.reply({
                embeds: [embed1],
                ephemeral: true
            });
    }
}