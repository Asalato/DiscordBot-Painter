const {SlashCommandBuilder} = require("discord.js");
const {createPaintFromDalle3} = require("../others/createPaint");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('paint3')
        .setDescription('絵を描きます（DALLE3）')
        .addStringOption(option =>
            option.setName('quality')
                .setDescription('出力する画像の品質')
                .addChoices(
                    {name: 'standard', value: 'standard'},
                    {name: 'hd', value: 'hd'}
                ))
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('出力する絵の内容')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        const quality = interaction.options.getString('quality') ?? "standard";
        const prompt = interaction.options.getString('prompt');

        try {
            const result = await createPaintFromDalle3(prompt, interaction.user.id, quality);
            await interaction.editReply({files: result});
        } catch (err) {
            console.error(err);
            await interaction.editReply(`\`\`\`diff\n-何らかの問題が発生しました。\n${err.toString()}\n\`\`\``)
        }
    },
};
