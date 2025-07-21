
'use server';

/**
 * @fileOverview An AI agent that generates a design layout suggestion.
 *
 * - generateLayoutSuggestion - Generates a layout image.
 * - GenerateLayoutSuggestionInput - Input schema for the flow.
 * - GenerateLayoutSuggestionOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLayoutSuggestionInputSchema = z.object({
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint.'),
  headline: z.string().optional().describe('The headline text for the layout.'),
  bodyText: z.string().optional().describe('The body text for the layout.'),
  imagePrompt: z.string().optional().describe('A prompt for an image to be included in the layout.'),
});
export type GenerateLayoutSuggestionInput = z.infer<typeof GenerateLayoutSuggestionInputSchema>;


const GenerateLayoutSuggestionOutputSchema = z.object({
  layoutDataUri: z
    .string()
    .describe(
      "The generated layout as an image data URI, including MIME type and Base64 encoding."
    ),
});
export type GenerateLayoutSuggestionOutput = z.infer<typeof GenerateLayoutSuggestionOutputSchema>;


export async function generateLayoutSuggestion(
  input: GenerateLayoutSuggestionInput
): Promise<GenerateLayoutSuggestionOutput> {
  return generateLayoutSuggestionFlow(input);
}

const generateLayoutSuggestionFlow = ai.defineFlow(
  {
    name: 'generateLayoutSuggestionFlow',
    inputSchema: GenerateLayoutSuggestionInputSchema,
    outputSchema: GenerateLayoutSuggestionOutputSchema,
  },
  async (input) => {
    
    let textContentPrompt = '';
    if (input.headline) {
        textContentPrompt += `It must include a headline with the text: "${input.headline}". `;
    }
    if (input.bodyText) {
        textContentPrompt += `It must include body text: "${input.bodyText}". `;
    }
     if (input.imagePrompt) {
        textContentPrompt += `It should contain a prominent image that matches the description: "${input.imagePrompt}". `;
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: `You are a professional graphic designer tasked with creating a brand-compliant layout. 
      
Use the provided Brand Fingerprint to guide your design choices for color, typography, and spacing.
${textContentPrompt}

Your design must be visually appealing and follow all the rules in the Brand Fingerprint.

Brand Fingerprint:
${input.brandFingerprint}
`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed for layout suggestion.');
    }

    return {
      layoutDataUri: media.url,
    };
  }
);
