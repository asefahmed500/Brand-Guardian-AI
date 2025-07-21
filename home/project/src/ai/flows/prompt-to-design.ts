
'use server';

/**
 * @fileOverview An AI agent that generates a full design from a text prompt.
 *
 * - promptToDesign - Generates a design image from a prompt.
 * - PromptToDesignInput - Input schema for the flow.
 * - PromptToDesignOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PromptToDesignInputSchema = z.object({
  brandFingerprint: z.string().describe('A JSON string representing the brand fingerprint.'),
  prompt: z.string().describe('The user\'s text prompt describing the desired design (e.g., "An Instagram post for a summer sale").'),
});
export type PromptToDesignInput = z.infer<typeof PromptToDesignInputSchema>;


const PromptToDesignOutputSchema = z.object({
  designDataUri: z
    .string()
    .describe(
      "The generated design as an image data URI, including MIME type and Base64 encoding."
    ),
});
export type PromptToDesignOutput = z.infer<typeof PromptToDesignOutputSchema>;


export async function promptToDesign(
  input: PromptToDesignInput
): Promise<PromptToDesignOutput> {
  return promptToDesignFlow(input);
}

const promptToDesignFlow = ai.defineFlow(
  {
    name: 'promptToDesignFlow',
    inputSchema: PromptToDesignInputSchema,
    outputSchema: PromptToDesignOutputSchema,
  },
  async (input) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      prompt: `You are a professional graphic designer tasked with creating a brand-compliant design from a text prompt.
      
Your task is to generate ONE professional and visually appealing design that is ready to use.

The design must follow all the rules in the provided Brand Fingerprint for color, typography, and spacing.
The design must be based on the user's prompt.

User Prompt: "${input.prompt}"

Brand Fingerprint:
${input.brandFingerprint}
`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed for prompt-to-design.');
    }

    return {
      designDataUri: media.url,
    };
  }
);
