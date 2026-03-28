# The Infinite Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.1-orange.svg)](https://deepmind.google/technologies/gemini/)

**The Infinite Intelligence** is a sophisticated AI agent orchestrator that simulates collective reasoning. While single-model AI often suffers from "tunnel vision" or binary logic, this platform employs a multi-agent "council" to debate, critique, and synthesize complex problems. By decomposing prompts into **First Principles**, the system delivers nuanced, multi-perspective, and highly actionable insights.

---

## 📖 Table of Contents
- [Features](#-key-features)
- [Architecture](#-architecture)
- [Technologies Used](#-technologies-used)
- [Installation & Requirements](#-installation--requirements)
- [Usage Instructions & Examples](#-usage-instructions--examples)
- [Testing](#-testing)
- [Contribution Guidelines](#-contribution-guidelines)
- [License](#-license)

---

## 🚀 Key Features

- **Dynamic Expert Assembly**: Automatically recruits specialized domain experts (e.g., Security Auditor, UX Designer) based on the prompt's context.
- **Collaborative Topologies**: Choose between Parallel (speed), Sequential (depth), or Round-Robin (consensus) agent interaction modes.
- **Iterative Peer Critique**: Agents engage in multi-round "boardroom" debates to eliminate hallucinations and refine logic.
- **Artifact Extraction**: Intelligent detection and rendering of code, JSON, and technical diagrams in an interactive side-panel.
- **Executive Reports**: Generate comprehensive PDF summaries of the entire orchestration process for stakeholders.

---

## 🏗️ Architecture

The system operates on a 5-stage orchestration pipeline:
1.  **Analysis**: Decomposes the prompt into its fundamental truths using First Principles logic.
2.  **Assembly**: Recruits a custom panel of 4 expert agents with unique system instructions.
3.  **Execution**: Agents process the prompt using behavioral sliders (Creativity vs. Logic).
4.  **Critique**: Peer-to-peer review cycles where agents identify flaws in each other's reasoning.
5.  **Synthesis**: A master model merges all perspectives into a unified, authoritative response.

---

## 🛠️ Technologies Used

- **Frontend**: React 18 (SPA), TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **AI Engine**: Google Generative AI SDK (Gemini 3.1 Pro & 3 Flash)
- **Utilities**: Lucide React (Icons), React Markdown (Rendering)
- **Exporting**: jsPDF, html2canvas

---

## 📥 Installation & Requirements

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **API Key**: A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Setup Instructions
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/the-infinite-intelligence.git
    cd the-infinite-intelligence
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env` file in the root directory and add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_key_here
    ```
4.  **Start Development Server**:
    ```bash
    npm run dev
    ```

---

## 💡 Usage Instructions & Examples

1.  **Input a Complex Prompt**: Enter a strategic or creative question (e.g., *"Design a sustainable lunar colony architecture"*).
2.  **Select Topology**: Use the settings to choose between **Standard** (4 agents) or **Deep** (4+ agents with extended debate).
3.  **Monitor the Process**: Watch the "Orchestration Graph" as agents analyze, critique, and synthesize.
4.  **Extract Artifacts**: Click the Artifacts icon to view extracted code or data structures.

### Example Prompts
- *"Analyze the ethical implications of autonomous vehicles in urban environments."*
- *"Create a microservices architecture for a high-frequency trading platform."*
- *"Draft a marketing strategy for a startup focused on carbon capture technology."*

---

## 🧪 Testing

We use **Vitest** for unit and integration testing of the orchestration logic. To verify the project's integrity, run:

```bash
# Run all tests
npm run test

# Run tests in UI mode
npx vitest --ui
```

---

## 🤝 Contribution Guidelines

We welcome contributions from the community! To maintain high code quality:
- Follow the [Architectural Guidelines](./conductor/product-guidelines.md).
- Ensure all new features include corresponding tests.
- We adhere to the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

1.  Fork the repo and create your branch (`feature/AmazingFeature`).
2.  Commit your changes (`git commit -m 'feat: add amazing feature'`).
3.  Open a Pull Request for review.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

**Empowering human decisions with the precision of collective intelligence.**
