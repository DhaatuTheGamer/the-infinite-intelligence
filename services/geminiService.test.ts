import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as geminiService from './geminiService';

// Mocking the environment variable
vi.stubEnv('GEMINI_API_KEY', 'test-api-key');

describe('geminiService', () => {
    it('should export all required functions', () => {
        expect(geminiService.analyzePromptFirstPrinciples).toBeDefined();
        expect(geminiService.assembleDynamicAgents).toBeDefined();
        expect(geminiService.generateAgentResponse).toBeDefined();
        expect(geminiService.generateAgentCritique).toBeDefined();
        expect(geminiService.synthesizeFinalResponse).toBeDefined();
        expect(geminiService.extractArtifacts).toBeDefined();
    });

    // We can't easily test actual AI calls without heavy mocking
    // but we've established the exports are there.
});
