const {
  Client,
  Intents,
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require('discord.js')
const { token } = require('./config.json')
const fs = require('fs')
const config = './config.json'
const file = require(config)

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
  ]
})

const emoji = {
  thumbsUp: '👍',
  thumbsDown: '👎'
}
const prefix = '/'
const commands = {
  setSuggestionChannel: 'setSuggestionChannel'
}
const embedConfig = {
  color: '#ff3232'
}

client.once('ready', () => {
  console.log('Discord bot is now online.')
})

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return

  if (interaction.customId == 'statusButton') {
    if (interaction.component.label == 'Em análise') {
      interaction.component.setLabel('Aprovada')
      interaction.component.setStyle('SUCCESS')
    } else if (interaction.component.label == 'Aprovada') {
      interaction.component.setLabel('Aprovada - Em andamento')
      interaction.component.setStyle('SUCCESS')
    } else if (interaction.component.label == 'Aprovada - Em andamento') {
      interaction.component.setLabel('Negada')
      interaction.component.setStyle('DANGER')
    } else if (interaction.component.label == 'Negada') {
      interaction.component.setLabel('Em análise')
      interaction.component.setStyle('SECONDARY')
    }
  }
  interaction.update({
    components: [new MessageActionRow().addComponents(interaction.component)]
  })
})

client.on('messageCreate', async message => {
  if (message.author.bot && message.channelId == file.channelID) {
    message.react(emoji.thumbsUp)
    message.react(emoji.thumbsDown)
    return
  }
  const botAvatar = client.user.avatarURL()

  // Set suggestion channel command
  if (message.content.startsWith(`${prefix}${commands.setSuggestionChannel}`)) {
    const reactEmbed = new MessageEmbed()
      .setColor(embedConfig.color)
      .setDescription('Este canal foi definido como: Sugestões.')
      .setTimestamp()
      .setFooter(client.user.tag, botAvatar)
    message.channel.send({ embeds: [reactEmbed] })
    message.delete()
    file.channelID = message.channelId
    fs.writeFile(
      config,
      JSON.stringify(file, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err)
      }
    )
    return
  }

  if (message.channelId == file.channelID) {
    const suggestionEmbed = new MessageEmbed()
      .setColor(embedConfig.color)
      .setAuthor(message.author.tag, message.author.avatarURL())
      .setTitle('Sugestão:')
      .setDescription('```' + message.content + '```')
      .setTimestamp()
      .setFooter(client.user.tag, botAvatar)
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('statusButton')
        .setLabel('Em análise')
        .setStyle('SECONDARY')
    )
    await message.channel.send({
      embeds: [suggestionEmbed],
      components: [row]
    })
  }
})

client.login(token)
