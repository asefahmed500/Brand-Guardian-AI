
'use server';

/**
 * @fileOverview A conversational AI assistant for brand compliance.
 *
 * - brandAssistant - A function that handles conversational queries about a design.
 * - BrandAssistantInput - The input type for the brandAssistant function.
 * - BrandAssistantOutput - The return type for the brandAssistant function.
 */

import { ai } from '@/ai/genkit';
import { extractMimeType } from '@/lib/utils';
import { z } from 'genkit';

const BrandAssistantInputSchema = z.object({
  designDataUri: z
    .string()
    .optional()
    .describe(
      "A data URI of the design to be analyzed, including MIME type and Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This is optional."
    ),
  brandGuidelines: z.string().describe('The JSON string of the brand guidelines/fingerprint to adhere to.'),
  query: z.string().describe('The user\'s natural language question about the design or brand.'),
});
export type BrandAssistantInput = z.infer<typeof BrandAssistantInputSchema>;


const BrandAssistantOutputSchema = z.object({
  response: z.string().describe('A helpful, conversational response to the user\'s query.'),
});
export type BrandAssistantOutput = z.infer<typeof BrandAssistantOutputSchema>;

export async function brandAssistant(input: BrandAssistantInput): Promise<BrandAssistantOutput> {
  return brandAssistantFlow(input);
}

const brandAssistantFlow = ai.defineFlow(
  {
    name: 'brandAssistantFlow',
    inputSchema: BrandAssistantInputSchema,
    outputSchema: BrandAssistantOutputSchema,
  },
  async (input) => {

    const promptText = `You are a friendly and helpful AI Brand Assistant integrated into a design tool. Your goal is to answer a user's question about their current design or brand guidelines in a conversational way.

Analyze the user's question in the context of the provided brand guidelines. If a design image is provided, use it as additional context.

- If the user asks for brand information (e.g., "What font should I use for a headline?", "What are our primary colors?"), provide a direct answer from the guidelines.
- If the user asks for copy (e.g., "Write a headline for a summer sale"), generate creative, on-brand copy that matches the brand's aesthetic.
- If the user asks for a general compliance check (e.g., "Is this okay?", "How am I doing?") and an image is provided, provide a brief, encouraging summary of what's good and what could be improved based on the image.
- If the user asks about a specific element in an image (e.g., "Is this font okay?"), give a focused answer on that topic.
- If the user asks for suggestions (e.g., "How can I improve this?"), give one or two clear, actionable tips.
- Keep your answers concise and easy to understand.

Brand Guidelines: ${input.brandGuidelines}
User's Question: ${input.query}
Current Design: `;
    
    const promptParts: any[] = [{ text: promptText }];
    if (input.designDataUri) {
      promptParts.push({ media: { url: input.designDataUri, contentType: extractMimeType(input.designDataUri) } });
    }

    const { output } = await ai.generate({
      prompt: promptParts,
      model: 'googleai/gemini-1.5-pro',
      output: {
        format: 'json',
        schema: BrandAssistantOutputSchema,
      },
    });

    return output!;
  }
);
