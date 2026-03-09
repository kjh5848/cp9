export interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
  toneDescription: string;
  negativePrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreatePersonaPayload = Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePersonaPayload = Partial<CreatePersonaPayload>;
