import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration } from "@google/genai";
import { AgentId, AgentPersona, ChatMessage, AgentResult, AgentStatus, Artifact } from '../types';
import { SYNTHESIZER_SYSTEM_PROMPT } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzePromptFirstPrinciples = async (
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<{ text: string; usage?: any }> => {
  const ai = getAiClient();
  const systemInstruction = `You are a First Principles Analyst. Your task is to take a user's prompt and break it down into its fundamental truths and core components. 
Analyze the prompt using first principles thinking. Then, reconstruct it into a highly detailed, structured, and simpler form that is optimized for specialized AI agents to understand and act upon.
Do not answer the prompt yourself. Only provide the detailed, broken-down version of the prompt.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.3,
        tools: [{ googleSearch: {} }],
      }
    });
    return { text: response.text || userPrompt, usage: response.usageMetadata };
  } catch (error) {
    console.error("Error analyzing prompt:", error);
    return { text: userPrompt }; // Fallback to original prompt if analysis fails
  }
};

export const assembleDynamicAgents = async (
  analyzedPrompt: string,
  history: ChatMessage[] = []
): Promise<{ agents: AgentPersona[]; usage?: any }> => {
  const ai = getAiClient();
  const systemInstruction = `You are the Chief Orchestrator. Based on the analyzed prompt, determine the 4 most relevant expert personas needed to solve this specific problem.
Return a JSON array of exactly 4 objects. Each object must have:
- id: A unique string (e.g., "DYNAMIC_1", "DYNAMIC_2", etc.)
- name: The expert's title (e.g., "Security Auditor", "UX Designer")
- role: A short 2-3 word role description
- description: A brief 1-sentence description of their focus
- color: A Tailwind text color class (e.g., "text-emerald-400", "text-rose-400", "text-indigo-400", "text-amber-400")
- bgGradient: A Tailwind gradient class (e.g., "from-emerald-900/20 to-emerald-900/5")
- icon: One of these exact strings: "BrainCircuit", "Sparkles", "ShieldCheck", "Hammer"
- systemInstruction: A detailed instruction for how this persona should analyze the problem.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: analyzedPrompt }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              description: { type: Type.STRING },
              color: { type: Type.STRING },
              bgGradient: { type: Type.STRING },
              icon: { type: Type.STRING },
              systemInstruction: { type: Type.STRING },
            },
            required: ["id", "name", "role", "description", "color", "bgGradient", "icon", "systemInstruction"]
          }
        }
      }
    });
    
    const agents = JSON.parse(response.text || "[]");
    // Ensure IDs map to our enum
    const mappedAgents = agents.map((a: any, i: number) => ({
      ...a,
      id: Object.values(AgentId)[i + 4] // Map to DYNAMIC_1, etc.
    })).slice(0, 4);
    
    return { agents: mappedAgents, usage: response.usageMetadata };
  } catch (error) {
    console.error("Error assembling agents:", error);
    throw error;
  }
};

export const generateAgentResponse = async (
  agent: AgentPersona,
  userPrompt: string,
  history: ChatMessage[] = [],
  customInstruction?: string,
  sliders?: { creativity: number, logic: number, formality: number },
  retries = 3
): Promise<{ text: string; usage?: any }> => {
  let attempt = 0;
  let lastError: any = null;
  
  // Apply sliders to instruction
  let finalInstruction = customInstruction || agent.systemInstruction;
  if (sliders) {
    finalInstruction += `\n\n--- Behavioral Parameters ---\n`;
    finalInstruction += `- Creativity: ${sliders.creativity}/100. ${sliders.creativity > 70 ? 'Be highly imaginative, unconventional, and exploratory.' : sliders.creativity < 30 ? 'Be strictly factual, deterministic, and avoid speculation.' : 'Balance creativity with factual accuracy.'}\n`;
    finalInstruction += `- Logic/Analytical rigor: ${sliders.logic}/100. ${sliders.logic > 70 ? 'Prioritize step-by-step reasoning, structural breakdown, and rigorous deduction.' : sliders.logic < 30 ? 'Focus more on intuition and broad concepts rather than strict logical proofs.' : 'Maintain a logical flow without being overly pedantic.'}\n`;
    finalInstruction += `- Formality: ${sliders.formality}/100. ${sliders.formality > 70 ? 'Use highly professional, academic, or formal language. Avoid slang.' : sliders.formality < 30 ? 'Use casual, conversational, and approachable language.' : 'Use a standard professional tone.'}\n`;
  }

  while (attempt <= retries) {
    try {
      const ai = getAiClient();
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userPrompt }] }
        ],
        config: {
          systemInstruction: finalInstruction,
          temperature: sliders ? (sliders.creativity / 100) * 1.5 : 0.7, // Map 0-100 to 0-1.5
          tools: [{ googleSearch: {} }],
        }
      });
      return { text: response.text || "No response generated.", usage: response.usageMetadata };
    } catch (error: any) {
      attempt++;
      lastError = error;
      console.error(`Error in agent ${agent.name} (Attempt ${attempt}):`, error);
      if (attempt > retries) {
        const errorDetails = `[System Error: ${agent.name} could not complete the task after ${retries} retries.]\n\nDetails:\n${lastError?.message || lastError}\n\nStack:\n${lastError?.stack || 'N/A'}`;
        throw new Error(errorDetails);
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  return { text: "Error" };
};

export const generateAgentCritique = async (
  agent: AgentPersona,
  originalPrompt: string,
  ownResponse: string,
  peerResponses: Record<AgentId, AgentResult>,
  history: ChatMessage[] = [],
  round: number = 1
): Promise<{ text: string; usage?: any }> => {
  const ai = getAiClient();
  
  let peerContext = "Here are the responses from your peers:\n\n";
  for (const [id, res] of Object.entries(peerResponses)) {
    if (id !== agent.id && res.status === AgentStatus.COMPLETED) {
      peerContext += `--- Peer (${id}) ---\n${res.content}\n\n`;
      if (res.critique) {
        peerContext += `--- Peer Critique Round ${round - 1} ---\n${res.critique}\n\n`;
      }
    }
  }

  const prompt = `Original Prompt: ${originalPrompt}\n\nYour Initial Response:\n${ownResponse}\n\n${peerContext}\n\nTask: Review your peers' responses. Provide a concise 1-2 paragraph critique or refinement of your own thoughts based on what you learned from them. Do not rewrite your whole response, just provide the critique/refinement.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are ${agent.name}. ${agent.systemInstruction} Act as a constructive critic in a boardroom.`,
        temperature: 0.5,
      }
    });
    return { text: response.text || "No critique generated.", usage: response.usageMetadata };
  } catch (error) {
    console.error(`Error in agent critique ${agent.name}:`, error);
    return { text: "Critique failed." };
  }
};

export const synthesizeFinalResponse = async (
  userPrompt: string,
  agents: AgentPersona[],
  agentResponses: Record<AgentId, AgentResult>,
  history: ChatMessage[] = [],
  temperature: number = 0.5,
  agentFeedback?: Record<AgentId, 'up' | 'down' | null>,
  advancedParams?: { topP?: number; topK?: number; frequencyPenalty?: number }
) => {
  try {
    const ai = getAiClient();
    
    // Construct the context for the synthesizer, including feedback
    const formatAgentInput = (agent: AgentPersona) => {
      const res = agentResponses[agent.id];
      if (!res) return '';
      
      let feedbackStr = "";
      if (agentFeedback && agentFeedback[agent.id]) {
        if (agentFeedback[agent.id] === 'up') feedbackStr = " [Note: The user previously found this agent's approach highly effective. Weigh this input heavily.]";
        if (agentFeedback[agent.id] === 'down') feedbackStr = " [Note: The user previously found this agent's approach unhelpful. Weigh this input carefully and correct any obvious flaws.]";
      }
      
      if (res.status === AgentStatus.ERROR) return `${agent.name}: [FAILED TO GENERATE RESPONSE]\n\n`;
      
      let output = `${agent.name} (${agent.role}):\nInitial Thought: ${res.content}\n`;
      if (res.critique) {
        output += `Post-Debate Critique/Refinement: ${res.critique}\n`;
      }
      return output + feedbackStr + `\n\n`;
    };

    const contextParts = [
      `USER PROMPT: ${userPrompt}\n\n`,
      `--- AGENT INPUTS & DEBATE ---\n`,
      ...agents.map(formatAgentInput),
      `--- END AGENT INPUTS ---\n`,
      `Based on the above, generate the final synthesized response. Take into account any feedback notes attached to the agent inputs, and heavily weigh their post-debate critiques.`
    ];

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.1-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: contextParts.join('') }] }
      ],
      config: {
        systemInstruction: SYNTHESIZER_SYSTEM_PROMPT,
        temperature: temperature,
        topP: advancedParams?.topP,
        topK: advancedParams?.topK,
        frequencyPenalty: advancedParams?.frequencyPenalty,
        tools: [{ googleSearch: {} }],
      }
    });

    return stream;
  } catch (error) {
    console.error("Error in synthesis:", error);
    throw error;
  }
};

export const extractArtifacts = async (finalSynthesis: string): Promise<{ artifacts: Artifact[]; usage?: any }> => {
  const ai = getAiClient();
  const systemInstruction = `You are an Artifact Extractor. Review the provided text and extract any major, standalone deliverables into structured artifacts.
Deliverables might include: code blocks, JSON structures, business plans, essays, specific lists, or HTML/SVG snippets.
Return a JSON array of objects. Each object must have:
- id: A unique string
- title: A short, descriptive title
- type: One of "code", "markdown", "json", "text", "html"
- content: The actual content of the artifact.
If there are no clear standalone artifacts, return an empty array [].`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        { role: 'user', parts: [{ text: finalSynthesis }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["id", "title", "type", "content"]
          }
        }
      }
    });
    
    return { artifacts: JSON.parse(response.text || "[]"), usage: response.usageMetadata };
  } catch (error) {
    console.error("Error extracting artifacts:", error);
    return { artifacts: [] };
  }
};
