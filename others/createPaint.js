const {Configuration, OpenAIApi} = require("openai");
module.exports = {
    async createPaint(prompt, authorId) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_SECRET_KEY
        });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "256x256",
            user: authorId
        })

        return response.data.data[0].url;
    }
}
