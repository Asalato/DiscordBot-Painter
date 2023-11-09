const OpenAIApi = require("openai");

module.exports = {
    async createPaintFromDalle2(prompt, authorId, count=1, size="small") {
        const openai = new OpenAIApi.OpenAI({apiKey: process.env.OPENAI_SECRET_KEY});

        let sizePixel = "256x256";
        if (size === "medium") sizePixel = "512x512";
        else if (size === "large") sizePixel = "1024x1024";

        const response = await openai.images.generate({
            model: "dall-e-2",
            prompt: prompt,
            n: count,
            size: sizePixel,
            user: authorId
        })

        return response.data?.map(x => x.url);
    },
    async createPaintFromDalle3(prompt, authorId, quality) {
        const openai = new OpenAIApi.OpenAI({apiKey: process.env.OPENAI_SECRET_KEY});

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            quality: quality,
            user: authorId
        })

        return response.data?.map(x => x.url);
    }
}
