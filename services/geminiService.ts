
import { GoogleGenAI } from "@google/genai";
import { BoardState } from '../types';

const getAiMove = async (board: BoardState): Promise<number> => {
    // This check is important because the API key is set in the environment
    // and might not be available during local development.
    if (!process.env.API_KEY) {
        console.warn("API_KEY not found. Using fallback AI.");
        return getFallbackAiMove(board);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are an unbeatable Tic-Tac-Toe AI player. Your name is Gemini. You play as 'O'.
The user, playing as 'X', will make a move. You must analyze the board and choose the best possible move to win or draw.
The board is represented as a 9-element JSON array, indexed 0-8 from top-left to bottom-right.
Empty squares are represented by \`null\`.
Respond with only a JSON object containing the index of your move, like \`{"move": 4}\`.`;

    const prompt = `The board is currently: ${JSON.stringify(board)}. It is your turn. Make your move.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                temperature: 0.1, // more deterministic
                thinkingConfig: { thinkingBudget: 0 } // low latency
            },
        });

        let jsonStr = (response.text || '').trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsed = JSON.parse(jsonStr);
        const move = parsed.move;

        if (typeof move === 'number' && move >= 0 && move < 9 && board[move] === null) {
            return move;
        } else {
            console.warn("AI returned an invalid move, using fallback.", move);
            return getFallbackAiMove(board);
        }
    } catch (e) {
        console.error("Failed to get move from Gemini API:", e);
        return getFallbackAiMove(board);
    }
};

const getFallbackAiMove = (board: BoardState): number => {
    // Simple fallback: find the first empty square
    const firstEmptyIndex = board.findIndex(square => square === null);
    return firstEmptyIndex !== -1 ? firstEmptyIndex : -1;
};


export { getAiMove };
