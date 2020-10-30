const { MessageEmbed } = require("discord.js");
const sendError = require("@util/musicerror")

module.exports = {
    commands: ['resume', 'r'],
    callback: async (message, args) => {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            let xd = new MessageEmbed()
                .setDescription("▶ Resumed the music for you!")
                .setColor("YELLOW")
                .setTitle("Music has been Resumed!")
                .setFooter("Bot made by OblivionGhoul#5842")
            return message.channel.send(xd);
        }
        return sendError("There is nothing playing in this server.", message.channel);
    },
}