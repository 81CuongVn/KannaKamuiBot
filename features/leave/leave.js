const mongo = require('@util/mongo')
const command = require('@util/command')
const welcomeSchema = require('@schemas/leave-schema')

module.exports = (client) => {
    try {
        const cache = {} // guildId: [channelId, text]

        command(client, 'setleave', async (message) => {
            const { member, channel, content, guild } = message

            if (!member.hasPermission('ADMINISTRATOR')) {
                channel.send('You need the admin permission to use this command.')
                return
            }

            let text = content

            const split = text.split(' ')

            if (split.length < 2) {
                channel.send('Please provide a leave message')
                return
            }

            split.shift()
            text = split.join(' ')

            cache[guild.id] = [channel.id, text]

            await mongo().then(async (mongoose) => {
                channel.send('Leave channel set!')
                try {
                    await welcomeSchema.findOneAndUpdate(
                        {
                            _id: guild.id,
                        },
                        {
                            _id: guild.id,
                            channelId: channel.id,
                            text,
                        },
                        {
                            upsert: true,
                        }
                    )
                } finally {
                    mongoose.connection.close()
                }
            })
        })

        const onLeave = async (member) => {
            const { guild } = member

            let data = cache[guild.id]

            if (!data) {
                await mongo().then(async (mongoose) => {
                    try {
                        const result = await welcomeSchema.findOne({ _id: guild.id })
                        try {
                            cache[guild.id] = data = [result.channelId, result.text]
                        } catch {
                            return
                        }
                    } finally {
                        mongoose.connection.close()
                    }
                })
            }
            try {
                const channelId = data[0]
                const text = data[1]

                const channel = guild.channels.cache.get(channelId)
                channel.send(text.replace(/<@>/g, `<@${member.id}>`))
            } catch {
                return
            }
        }

        command(client, 'simleave', (message) => {
            onLeave(message.member)
        })

        client.on('guildMemberRemove', (member) => {
            onLeave(member)
        })
    } catch {
        return
    }
}