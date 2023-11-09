const {Configuration, OpenAIApi} = require("openai");
const {EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");
const {createPaint, createPaintFromDalle2, createPaintFromDalle3} = require("../others/createPaint");
const {extractCommands, containsCommand} = require("../utils");

const commandList = [
    {
        command: "!size",
        description: "出力サイズを指定します（DALLE2のみ）。",
        options: [
            {
                name: "small",
                description: "小サイズで出力します（デフォルト）。"
            },
            {
                name: "medium",
                description: "中サイズで出力します。"
            },
            {
                name: "large",
                description: "大サイズで出力します。"
            },
        ],
        hasOption: true
    },
    {
        command: "!quality",
        description: "出力品質を指定します（DALLE3のみ）。",
        options: [
            {
                name: "standard",
                description: "通常の品質で出力します（デフォルト）。"
            },
            {
                name: "hd",
                description: "高品質で出力します。"
            }
        ],
        hasOption: true
    },
    {
        command: "!mode",
        description: "利用モデルを指定します。",
        options: [
            {
                name: "dalle2",
                description: "DALLE2モデルを利用します（デフォルト）。"
            },
            {
                name: "dalle3",
                description: `DALLE3モデルを利用します。`
            }
        ],
        hasOption: true
    },
    {
        command: "!dev",
        description: "デベロッパーチャンネルへ送信します（検証用）。",
        hasOption: false
    },
    {
        command: "!help",
        description: "ヘルプメニューを表示します（これ）。",
        hasOption: false
    },
    {
        command: "!version",
        description: "バージョンのみを返します。",
        hasOption: false
    }
]

module.exports = {
    async execute_repaint(interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'repaint') return;

        await interaction.deferReply();
        const message = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        const prompt = message.content.replace(/^<@.*>\s/, "");

        const commands = extractCommands(commandList, message);

        try {
            let result = [];
            const parameter = containsCommand(commands, "!mode") ? commands.commands.filter(c => c.command === "!mode")[0].parameter : "dalle2";
            if (parameter === "dalle2") {
                const size = containsCommand(commands, "!size") ? commands.commands.filter(c => c.command === "!mode")[0].parameter : "small";
                result = await createPaintFromDalle2(prompt, message.author.id, 2, size);
            }
            else if (parameter === "dalle3") {
                const quality = containsCommand(commands, "!quality") ? commands.commands.filter(c => c.command === "!quality")[0].parameter : "standard";
                result = await createPaintFromDalle3(prompt, message.author.id, quality);
            }

            const files = result.map(x => new AttachmentBuilder(x, {name: "result.png", description: prompt}));
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('repaint')
                        .setLabel('再生成')
                        .setStyle(ButtonStyle.Primary),
                );
            try {
                await interaction.deleteReply();
            } catch {

            }
            await message.reply({files: files, components: [row]});
        } catch (err) {
            console.log(err);
            await interaction.editReply("```diff\n-何らかの問題が発生しました。\n```");
        }
    },
};
