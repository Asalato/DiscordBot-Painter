const {SlashCommandBuilder} = require("discord.js");
const {createPaintFromDalle2} = require("../others/createPaint");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paint')
        .setDescription('絵を描きます')
        .addStringOption(option =>
            option.setName('size')
                .setDescription('出力する画像のサイズ（画質）')
                .addChoices(
                    {name: 'small', value: 'small'},
                    {name: 'medium', value: 'medium'},
                    {name: 'large', value: 'large'}
                ))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('出力する画像の数')
                .setMinValue(1)
                .setMaxValue(10)
        )
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('出力する絵の内容')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        const size = interaction.options.getString('size') ?? "small";
        const count = interaction.options.getIntegar('count') ?? 1;
        const prompt = interaction.options.getString('prompt');

        try {
            const result = await createPaintFromDalle2(prompt, interaction.user.id, count, size);
            await interaction.editReply({files: result});
        } catch (err) {
            console.error(err);
            await interaction.editReply(`\`\`\`diff\n-何らかの問題が発生しました。\n${err.toString()}\n\`\`\``)
        }
    },
};
