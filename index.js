const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } = require('discord.js');
require('dotenv/config');
const linkpreviewgen = require('link-preview-generator');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require ('fs');
const wikimediabot = require("nodemw")
const { createPool } = require('mysql')

let mysqlconnection = createPool({ "connectionLimit" : 100, "host": `${process.env.HOST}`, "user": `${process.env.USER}`, "password": `${process.env.PASSWORD}`, "database": `${process.env.DATABASE}` })

var levelcooldown = {}
var minute = 60000

const wikimediaclient = new wikimediabot({
    server: "minecraft.fandom.com/api.php",
    path: "/w"
})

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
};

client.once('ready', () => {
    console.log('Bot has been started');

    const CLIENT_ID = client.user.id

    const rest = new REST({
        version: "10"
    }).setToken(process.env.TOKEN);

    (async () => {
        try {
            if (process.env.ENV === "production") {
                await rest.put(Routes.applicationCommands(CLIENT_ID), {
                    body: commands
                });
                console.log("Sucessfully Registered Slash Commands Globally");
            } else {
                await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID), {
                    body: commands
                });
                console.log("Sucessfully Registered Slash Commands only in Testing Server");
            }
        } catch (err) {
            if (err) console.error(err);
        };
    })();
});

client.on('messageCreate', async message => {

    if (message.author.bot) return;

    mysqlconnection.getConnection(function(err2, connection2) {
        if (err2) throw err2;

        connection2.query(`SELECT discordid FROM xp_table WHERE discordid = '${message.author.id}'`, function (error2, results2, fields2) {
        
            if (results2[0]) {
                // Found user, run code as usual
                // To get discord id/level/xp, do resultsvar[0].discordid/xp/userlevel
                
                if (!levelcooldown[message.author.id]) {
                    levelcooldown[message.author.id] = Date.now() + minute
                    mysqlconnection.getConnection(function(err, connection) {
                        if (err) throw err;
            
            
                        connection.query(`SELECT userlevel, xp FROM xp_table WHERE discordid = '${message.author.id}'`, function (error, results, fields) {
                            //when done with connection, release it
                            var randomxpamount = Math.floor(Math.random() * 15) + 10
                            var xpaddedamount = +results[0].xp + randomxpamount
                            var levelupxpneeded = +results[0].userlevel * 100

                            if (xpaddedamount >= levelupxpneeded) {
                                var levelincreased = +results[0].userlevel + 1

                                connection.query(`UPDATE xp_table SET xp = '0', userlevel = '${levelincreased}' WHERE discordid = ${message.author.id}`)
                            } else {
                                connection.query(`UPDATE xp_table SET xp = '${xpaddedamount}' WHERE discordid = ${message.author.id}`)
                            }
            
                            connection.release();
            
                            //handle errors after release
                            if (error) throw error;
                        })
                    })
                } else {
                    if ((levelcooldown[message.author.id] - Date.now()) <= 0) {
                        delete levelcooldown[message.author.id];
                        levelcooldown[message.author.id] = Date.now() + minute
                        mysqlconnection.getConnection(function(err, connection) {
                            if (err) throw err;
            
                
                            connection.query(`SELECT userlevel, xp FROM xp_table WHERE discordid = '${message.author.id}'`, function (error, results, fields) {

                                var randomxpamount = Math.floor(Math.random() * 15) + 10
                                var xpaddedamount = +results[0].xp + randomxpamount
                                var levelupxpneeded = +results[0].userlevel * 100
    
                                if (xpaddedamount >= levelupxpneeded) {
                                    var levelincreased = +results[0].userlevel + 1
    
                                    connection.query(`UPDATE xp_table SET xp = '0', userlevel = '${levelincreased}' WHERE discordid = ${message.author.id}`)
                                } else {
                                    connection.query(`UPDATE xp_table SET xp = '${xpaddedamount}' WHERE discordid = ${message.author.id}`)
                                }
                
                                connection.release();
                
                                //handle errors after release
                                if (error) throw error;
                            })
                        })
                    }
                }

            } else {

                mysqlconnection.getConnection(function(err, connection) {
                    connection.query(`INSERT INTO xp_table (discordid, xp, userlevel) VALUES (${message.author.id}, 0, 1)`)

                    connection.release();

                    if (err) throw err;
                })

            }

            connection2.release

            if (error2) throw error2;
        })
    })
})

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (command.data.name !== 'level') {
    if (command.data.name !== 'wiki') {
    try {
        await command.execute(interaction);
    } catch (err) {
        if (err) console.error(err);

        await interaction.reply({
            content: "An error has occured while executing that command. Please try again later or contact the Bot Developer (Skippy#7704)",
            ephemeral: true
        })
    }
    } else if (command.data.name == 'wiki') {

        await interaction.deferReply();

        var timebeforesearch = Date.now()

        try {

            wikimediaclient.search(`${interaction.options.getString("input")}`, async (err, results) => {

                const row1 = new ActionRowBuilder()
			        .addComponents(
				    new ButtonBuilder()
					    .setLabel('Page URL')
					    .setStyle(ButtonStyle.Link)
                        .setURL(`https://minecraft.fandom.com/index.php?curid=${results[0].pageid}`),
			        );

                const previewData = await linkpreviewgen(`https://minecraft.fandom.com/index.php?curid=${results[0].pageid}`);

                var timeaftersearch = Date.now()
                var timetaken = timeaftersearch-timebeforesearch

                const embed1 = new EmbedBuilder()
                    .setColor("#FFFFFF")
                    .setTitle(`Most Relevant Result - ${results[0].title}`)
                    .setDescription(`${previewData.description}...`)
                    .setImage(`${previewData.img}`)
                    .setFooter({ text: `Out of ${results.length}+ Results - Took ${timetaken} ms` });
                        
                try {
                    await interaction.editReply({ embeds: [embed1], ephemeral: false, components: [row1] });
                } catch (err) {
                    console.log(err)
                }
              });

        } catch (err) {
            if (err) console.error(err);
    
            await interaction.editReply({
                content: "An error has occured while executing that command. Please try again later or contact the Bot Developer (Skippy#7704)",
                ephemeral: true
            })
        }
    }} else if (command.data.name == 'level') {
        mysqlconnection.getConnection(async function(err2, connection2) {
            if (err2) throw err2;
    
            connection2.query(`SELECT discordid FROM xp_table WHERE discordid = '${interaction.user.id}'`, function (error2, results2, fields2) {
            
                if (results2[0]) {
                    // success

                mysqlconnection.getConnection(async function(err, connection) {
                        if (err) throw err;

                        connection.query(`SELECT userlevel, xp FROM xp_table WHERE discordid = '${interaction.user.id}'`, async function (error, results, fields) {
                            
                            const embed1 = new EmbedBuilder()
                                .setColor("#FFFFFF")
                                .setTitle(`Account - ${interaction.user.tag}`)
                                .setDescription(`XP - ${results[0].xp} | Level - ${results[0].userlevel}`)
              
                            await interaction.reply({ embeds: [embed1], ephemeral: false });
                            
                        })

                        connection.release()

                        if (err) throw err;
                    })
                    
                } else {

                    mysqlconnection.getConnection(async function(err, connection) {

                        connection.query(`INSERT INTO xp_table (discordid, xp, userlevel) VALUES (${interaction.user.id}, 0, 1)`)

                        const embed1 = new EmbedBuilder()
                                    .setColor("#FFFFFF")
                                    .setTitle(`Account - ${interaction.user.tag}`)
                                    .setDescription(`XP - 0 | Level - 1`)
                        
                        await interaction.reply({ embeds: [embed1], ephemeral: false });

                        connection.release()

                        if (err) throw err;

                    })
                }

                connection2.release()
    
                if (error2) throw error2;
            })
        })
    }
})

client.login(process.env.TOKEN);