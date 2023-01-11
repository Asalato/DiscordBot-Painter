const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder} = require("discord.js");
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
                await message.reply({files: [file]});
            } else {
                await message.channel.sendTyping();
            }
        }, 1000);

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_SECRET_KEY
        });
        const openai = new OpenAIApi(configuration);

        try {
            const response = await openai.createImage({
                prompt: prompt,
                n: 1,
                size: "256x256",
                user: message.author.id
            })

            result = response.data.data[0].url;
        } catch (err) {
            console.log(err);
            clearInterval(typing);
            await message.reply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
