const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {createPaint} = require("../others/createPaint");
module.exports = {
    async execute_repaint(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'repaint') return;

        await interaction.deferReply();
        const message = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const prompt = message.content.replace(/^<@.*>\s/, "");

        try {
            const result = await createPaint(prompt, message.author.id);
            const file = new AttachmentBuilder(result, {name: "result.png", description: prompt});
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('repaint')
                        .setLabel('再生成')
                        .setStyle(ButtonStyle.Primary),
                );
            await interaction.deleteReply();
            await message.reply({files: [file], components: [row]});
        } catch (err) {
            console.log(err);
            await interaction.editReply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
