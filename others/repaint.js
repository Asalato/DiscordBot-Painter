const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {createPaint} = require("../others/createPaint");
module.exports = {
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const message = interaction.message.reference;
        const tmpMsg = await message.reply("ちょっと待ってね");
        const prompt = message.content.replace(`<@${client.user.id}> `, "");

        let result = undefined;
        const typing = setInterval(async () => {
            if (result){
                clearInterval(typing);
                await tmpMsg.delete();
                const file = new AttachmentBuilder(result, {name: "result.png", description: prompt});
                await message.reply({files: [file]});
            } else {
                await message.channel.sendTyping();
            }
        }, 1000);

        try {
            result = await createPaint(prompt, message.author.id);
        } catch (err) {
            console.log(err);
            clearInterval(typing);
            await message.reply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
