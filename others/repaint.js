const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {createPaint} = require("../others/createPaint");
module.exports = {
    async execute(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.commandName === 'repaint') return;

        await interaction.deferReply();
        const message = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const prompt = message.content.replace(/^<@.*>\s/, "");

        try {
            const result = await createPaint(prompt, message.author.id);
            const file = new AttachmentBuilder(result, {name: "result.png", description: prompt});
            await interaction.editReply({files: [file]});
        } catch (err) {
            console.log(err);
            await message.reply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
