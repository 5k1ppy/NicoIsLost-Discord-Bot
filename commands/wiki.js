const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("wiki")
        .setDescription("Get a link to a Minecraft Wiki page (WARNING, THIS COMMAND IS SLOW)")
        .addStringOption((option) =>
            option.setName('input')
                  .setDescription('Page to search up')
                  .setRequired(true)),
}