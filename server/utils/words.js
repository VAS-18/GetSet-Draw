import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = process.env.GEMINI_API_KEY || 'AIzaSyCO-rfZob9TyOQtpPulKk6zeP3mA-goHwo' ;
export async function words() {
    if (!gemini) {
        throw new Error("GEMINI WORD KEY NOT FOUND");
    }
    const genAI = new GoogleGenerativeAI(gemini);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Build a prompt bank with quirky drawing challenges (for example: 'Draw a giraffe in the arctic', 'Draw a superhero riding a bicycle', 'Draw a shark in a barrel', 'Draw a bumblebee that loves capitalism', 'Draw a van down by the river', etc. Keep in mind the person has to draw it in 2 mins so it should not be too complex. only give me one line";

    const gameWords = await model.generateContent(prompt);
    const gameWordsText = gameWords.response.text();

    console.log(gameWordsText);

    return gameWordsText;

}

