
'use server';
/**
 * @fileOverview An AI agent that handles sending a password reset email.
 * This is a simplified flow for demonstration purposes. In a real application,
 * you would use a dedicated email service (e.g., SendGrid, Mailgun).
 *
 * - sendPasswordResetEmail - A function that generates a reset link and "sends" it.
 * - SendPasswordResetEmailInput - The input type for the function.
 * - SendPasswordResetEmailOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SendPasswordResetEmailInputSchema = z.object({
  email: z.string().email().describe('The email address of the user requesting the reset.'),
  resetLink: z.string().url().describe('The unique password reset link to be sent to the user.'),
});
export type SendPasswordResetEmailInput = z.infer<typeof SendPasswordResetEmailInputSchema>;

const SendPasswordResetEmailOutputSchema = z.object({
  success: z.boolean().describe('Whether the email was "sent" successfully.'),
  message: z.string().describe('A message indicating the result of the operation.'),
});
export type SendPasswordResetEmailOutput = z.infer<typeof SendPasswordResetEmailOutputSchema>;


export async function sendPasswordResetEmail(input: SendPasswordResetEmailInput): Promise<SendPasswordResetEmailOutput> {
  return sendPasswordResetEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sendPasswordResetEmailPrompt',
  input: { schema: SendPasswordResetEmailInputSchema },
  output: { schema: SendPasswordResetEmailOutputSchema },
  prompt: `You are an email delivery system. You have been asked to send a password reset email.
  
To: {{{email}}}
Reset Link: {{{resetLink}}}

Acknowledge that you have received the request and would send the email.
This is a simulation. DO NOT actually send an email.
Instead, for development purposes, log the reset link to the console for the developer to use.
Confirm that the operation was successful.
`,
});

const sendPasswordResetEmailFlow = ai.defineFlow(
  {
    name: 'sendPasswordResetEmailFlow',
    inputSchema: SendPasswordResetEmailInputSchema,
    outputSchema: SendPasswordResetEmailOutputSchema,
  },
  async (input) => {
    // In a real app, you would integrate with an email service here.
    // For this demo, we'll just log the link to the server console.
    console.log(`Password reset link for ${input.email}: ${input.resetLink}`);

    const { output } = await prompt(input);

    if (!output) {
      return {
        success: false,
        message: 'AI flow failed to produce output.',
      };
    }
    
    // We'll override the message for consistency in this simulation.
    return {
      success: true,
      message: `A password reset link has been sent to ${input.email}.`,
    };
  }
);
