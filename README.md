# The Infinite Intelligence

**AI Agent Orchestrator** — A powerful, interactive web application that harnesses the Google Gemini API to orchestrate a panel of specialized AI agents. By decomposing prompts through **First Principles** thinking and distributing analysis across distinct cognitive personas, it synthesizes comprehensive, multi-faceted responses that surpass single-model outputs.

### What
It turns a single user prompt into a collaborative symphony of AI agents (Logic, Emotion, Ethics, Action + dynamically assembled domain experts) that debate, critique, and refine their outputs before delivering a unified, high-quality final synthesis.

### Why
Traditional AI responses often lack depth, nuance, or balanced perspectives. This project solves that by simulating collective intelligence — delivering richer insights, better reasoning, and actionable results for complex questions in strategy, ethics, creativity, technical problems, and more.

### How
Built as a modern, client-side React SPA with real-time streaming, visual orchestration graphs, artifact extraction, conversation branching, and human-in-the-loop controls — all powered directly by Gemini 3.1 Pro and Flash models.


---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation & Requirements](#installation--requirements)
- [Usage Instructions & Examples](#usage-instructions--examples)
- [Contribution Guidelines](#contribution-guidelines)
- [Testing](#testing)
- [License](#license)

## Features
- **Collaboration Modes**: Parallel, Sequential, or Round-Robin agent interaction
- **Dynamic Expert Assembly**: Automatically recruits specialized agents (e.g., Security Auditor, UX Designer) based on prompt analysis
- **First Principles Breakdown**: Automatically decomposes any prompt into fundamental truths
- **Inter-Agent Debate & Critique**: Multiple rounds of peer review and refinement
- **Human-in-the-Loop (HITL)**: Pause for user feedback before final synthesis
- **Configurable Topologies**: QUICK (2 agents), STANDARD (4 agents), DEEP (4+ agents with extended debate)
- **Artifact Extraction**: Auto-detects and renders code, JSON, Markdown, HTML, SVG in a dedicated panel
- **Visual Orchestration Graph**: Real-time animated flowchart of the entire pipeline
- **Token Usage Tracking**, **Conversation Branching**, **PDF Executive Reports**, **Web Grounding**, and **Feedback Loops**
- Beautiful, responsive UI with progressive disclosure, Lucide icons, and smooth Framer Motion animations

## Architecture
Client-side React (Vite) SPA that talks directly to the Gemini API in the browser.

1. **Input** → Prompt submitted
2. **Analysis** → Gemini 3.1 Pro performs First Principles decomposition
3. **Assembly & Execution** → Multiple parallel Gemini instances (fixed + dynamic personas)
4. **Critique** → Agents review and improve each other’s outputs
5. **Review (optional HITL)** → User can steer the process
6. **Synthesis** → Final unified response with artifact extraction

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components & Icons**: Lucide React
- **Animations**: Framer Motion
- **AI SDK**: `@google/generative-ai` (Gemini 3.1 Pro & Flash)
- **Markdown Rendering**: `react-markdown`
- **Testing**: Vitest

## Installation & Requirements
### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Google Gemini API key (get one free at [Google AI Studio](https://aistudio.google.com))

### Setup

# 1. Clone the repository
```bash
git clone https://github.com/DhaatuTheGamer/the-infinite-intelligence.git
cd the-infinite-intelligence
```

# 2. Install dependencies
```bash
npm install
```

# 3. Create .env file in the root
```bash
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
# (Note: Prefix with VITE_ for Vite environment variables)
```

# 4. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start orchestrating intelligence!

## Usage Instructions & Examples
1. Enter any complex prompt in the main input box.
2. (Optional) Open Settings to choose topology, collaboration mode, or enable HITL.
3. Click **Orchestrate** and watch the live process unfold.
4. Review individual agent thoughts, critique rounds, and the final synthesis.
5. Download PDF report or extract artifacts.

### Example Prompts
```text
"How should humanity prepare for AGI by 2030?"
"Design a secure, scalable microservices architecture for a fintech startup."
"Analyze the ethical implications of gene editing in humans."
```

The app will automatically break each prompt into First Principles, assemble the right agents, run critique cycles, and deliver a polished, multi-perspective answer.

## Contribution Guidelines
Contributions are welcome and encouraged!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-idea`)
5. Open a Pull Request

Please follow the existing code style and [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

## Testing
- **Automated tests**: Run with `npm run test` (Vitest setup is included)
- **Manual verification** (recommended for UI flows):
  - Test all three topologies
  - Enable/disable HITL
  - Submit sample prompts and verify artifact extraction + PDF export
  - Check token usage tracking and conversation branching

## License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Dhaatrik Chowdhury**  
Ready to explore infinite intelligence? Start orchestrating today!