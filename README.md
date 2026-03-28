# AI Agent Orchestrator

## Overview
AI Agent Orchestrator is a powerful, interactive web application that leverages the Google Gemini API to orchestrate a panel of specialized AI agents. By breaking down prompts using First Principles thinking and distributing the analysis across distinct personas, the application synthesizes highly comprehensive, multi-faceted responses.

This project serves as a demonstration of collective AI intelligence, where different cognitive approaches (Logic, Emotion, Ethics, and Action) collaborate to provide superior insights.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Installation & Requirements](#installation--requirements)
- [Usage Instructions](#usage-instructions)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Features
- **Collaboration Modes**: Choose how agents interact: 'Parallel' (simultaneous), 'Sequential' (building on each other), or 'Round-Robin' (taking turns in a shared workspace).
- **Agent Customization**: Personalize agent personas with custom icons and adjustable parameters (Creativity, Logic, Formality) via sliders.
- **Short-Term Memory**: Agents recall their previous interactions within the current conversation turn, improving context awareness and continuity.
- **Enhanced Error Handling**: User-friendly error messages with troubleshooting suggestions and expandable details for debugging.
- **Dynamic Expert Assembly**: Automatically selects and configures the optimal AI personas (e.g., Security Auditor, UX Designer) based on the specific needs of your prompt.
- **First Principles Analysis**: Automatically breaks down complex user prompts into fundamental truths before processing.
- **Inter-Agent Debate & Critique**: Agents review and critique each other's initial responses across multiple configurable rounds, refining their outputs before final synthesis.
- **Human-in-the-Loop (HITL)**: Optional pause before final synthesis, allowing users to review agent outputs, provide feedback, and steer the final result.
- **Configurable Topologies**: Choose between 'QUICK' (fast, 2 agents), 'STANDARD' (balanced, 4 agents), or 'DEEP' (thorough, 4 agents with custom debate rounds) workflows.
- **Artifact Extraction**: Automatically identifies and extracts structured deliverables (code, JSON, markdown, HTML, SVG) into a dedicated, interactive panel.
- **Token Usage Tracking**: Real-time monitoring of token consumption across all API calls for cost and performance visibility.
- **Conversation Branching**: Fork the conversation at any past turn to explore alternative paths without losing your original context.
- **Executive Report Export**: Generate and download beautifully formatted PDF reports of the entire orchestration process (analysis, agent thoughts, synthesis).
- **Visual Orchestration Graph**: Real-time animated node graph showing the flow of data through the Analysis, Assembly, Execution, Critique, Review (HITL), and Synthesis stages.
- **Progressive Disclosure UI**: Agent cards automatically collapse during the synthesis phase to focus attention on the final output.
- **Web Grounding**: Agents have access to Google Search to ground their responses in current information.
- **Feedback Loop**: Thumbs up/down feedback on individual agent outputs influences their behavior in subsequent turns.
- **Markdown Rendering**: Full support for rich text, code blocks, and tables in agent outputs and final synthesis.

## Architecture
The application follows a client-side React architecture (Single Page Application) built with Vite. It communicates directly with the Google Gemini API (`@google/genai`) from the browser. 

1. **Input Stage**: User submits a prompt.
2. **Analysis Stage**: The prompt is sent to Gemini 3.1 Pro to be broken down via First Principles.
3. **Parallel Execution**: The analyzed prompt is sent simultaneously to up to eight Gemini instances (4 fixed personas: Logos, Pathos, Ethos, Praxis, and up to 4 dynamically assembled experts), each configured with a specific system instruction.
4. **Critique Stage**: The agents review and critique each other's initial responses over multiple rounds, refining their outputs.
5. **Review Stage (Optional)**: If HITL is enabled, the process pauses for human review and feedback.
6. **Synthesis Stage**: The refined responses are fed back into Gemini 3.1 Pro to generate a final, unified output.

## Technologies Used
- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **AI Integration**: `@google/genai` (Gemini 3.1 Pro & Gemini 3 Flash)
- **Markdown Rendering**: `react-markdown`

## Installation & Requirements

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Google Gemini API Key

### Setup Steps
1. **Clone the repository** (or download the source code).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   *(Note: In the AI Studio environment, this is injected automatically).*
4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`.

## Usage Instructions
1. **Enter a Prompt**: Type a complex question, scenario, or problem into the main input area.
2. **Observe the Process**: 
   - Watch as the prompt is first analyzed and broken down.
   - See the four agents (Logos, Pathos, Ethos, Praxis) generate their unique perspectives in real-time.
3. **Review Synthesis**: Read the final synthesized output that combines all perspectives.
4. **Provide Feedback**: Use the thumbs up/down icons on individual agent cards to guide their future responses in the conversation.
5. **Manage History**: Access past turns, edit titles, or archive conversations using the History panel.

## Contribution Guidelines
We welcome contributions to the AI Agent Orchestrator! 

1. Fork the repository.
2. Create a new branch for your feature or bugfix (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please ensure your code adheres to the existing style and that all new features are properly documented. We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

## Testing Instructions
*(Currently, manual testing is required as automated test suites are being developed.)*
To verify changes:
1. Run the development server (`npm run dev`).
2. Open the Settings modal and configure your preferred **Workflow Topology** and enable **Human-in-the-Loop (HITL)** if desired.
3. Submit a test prompt (e.g., "How should humanity address climate change?").
4. Verify that the First Principles Analysis appears.
5. Verify that the dynamic agents are correctly assembled based on the prompt.
6. Verify that all active agents return responses and critique each other without errors.
7. If HITL is enabled, verify that the workflow pauses and allows you to "Approve & Synthesize".
8. Verify that the final synthesis streams correctly and incorporates the agents' viewpoints.
9. Verify that artifacts (code, JSON, HTML, SVG) are correctly extracted into the Artifacts panel and render correctly.
10. Check the History sidebar to view past turns, including their topology and **Token Usage**.
11. Test the branching and PDF export functionalities.

## License
This project is licensed under the MIT License. You are free to use, modify, and distribute this software as per the terms of the license.
