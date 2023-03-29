const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {createPaint} = require("../others/createPaint");
module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(client, message) {
        if (message.author.bot) return false;
        if (!message.mentions.has(client.user)) return false;
        const tmpMsg = await message.reply("ちょっと待ってね");
        const prompt = message.content.replace(`<@${client.user.id}> `, "");

        let result = undefined;
        const typing = setInterval(async () => {
            if (result){
                clearInterval(typing);
                await tmpMsg.delete();
                const file = new AttachmentBuilder(result, {name: "result.png", description: prompt});
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('repaint')
                            .setLabel('再生成')
                            .setStyle(ButtonStyle.Primary),
                    );
                await message.reply({files: [file], components: [row]});
            } else {
                await message.channel.sendTyping();
            }
        }, 1000);

        try {
            result = await createPaint(prompt, message.author.id);
        } catch (err) {
            console.log(err);
            clearInterval(typing);
            await tmpMsg.delete();
            await message.reply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
