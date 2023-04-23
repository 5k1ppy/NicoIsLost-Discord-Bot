const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("carpetmod")
        .setDescription("Gives you details about the mod Nico uses to check stats about entities.")
        .addStringOption((option) =>
            option.setName('selection')
                .setDescription('Select if you want to get a download link or access to a guide for the Carpet Mod.')
                .setRequired(true)
                .addChoices(
                    { name: 'Download', value: 'download' },
                    { name: 'Guides', value: 'guides' },
                )),

        async execute(interaction) {
            const optionchosen = interaction.options.getString("selection")
            if (optionchosen == 'download') {
                const embed1 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setTitle("Carpet Mod Releases")
                .setDescription(`You can download Carpet Mod from this link.`)
                .addFields(
                    { name: 'Releases', value: 'https://github.com/gnembon/fabric-carpet/releases' },
                ) 
        
                await interaction.reply({ embeds: [embed1], ephemeral: false });
            } else if (optionchosen == 'guides') {
                const embed2 = new EmbedBuilder()
                .setColor("#FFFFFF")
                .setTitle("Carpet Mod Guides")
                .setDescription(`You can find some guides on the usage of Carpet Mod here.`)
                .addFields(
                    { name: 'Guide', value: 'https://github.com/gnembon/fabric-carpet/wiki' },
                ) 
        
                await interaction.reply({ embeds: [embed2], ephemeral: false });
            }
    }
}