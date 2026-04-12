# The Infinite Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%203.1-orange.svg)](https://deepmind.google/technologies/gemini/)

**The Infinite Intelligence** is a state-of-the-art multi-agent AI orchestration platform designed to solve complex problems through collaborative intelligence. By leveraging a diverse set of specialized AI agents, the platform breaks down intricate requests, analyzes them from first principles, and synthesizes a comprehensive, high-quality solution.

Built with a focus on modularity, transparency, and human-AI collaboration, The Infinite Intelligence provides a professional-grade environment for advanced prompt engineering and multi-agent workflows.

---

## 📖 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Installation & Requirements](#-installation--requirements)
- [Usage Instructions](#-usage-instructions)
- [Development & Contribution](#-development--contribution)
- [Testing Instructions](#-testing-instructions)
- [License](#-license)

---

## ✨ Features

### 🤖 Multi-Agent Orchestration
- **Parallel Collaboration**: All agents work simultaneously for maximum efficiency.
- **Sequential Workflows**: Agents build upon each other's work in a structured chain.
- **Round-Robin Debate**: Agents engage in multiple rounds of critique and refinement to reach a consensus.
- **Dynamic Agent Assembly**: In Beta Mode, the system automatically designs and deploys specialized agent personas tailored to your specific request.

### 🧠 Advanced Intelligence
- **First Principles Analysis**: Every prompt is analyzed to identify core constraints and underlying goals before execution.
- **Inter-Agent Debate & Critique**: Agents review and critique each other's initial responses across multiple configurable rounds.
- **Human-In-The-Loop (HITL)**: Optional review phase allowing users to critique agent outputs before final synthesis.
- **Short-Term Memory**: Agents recall their previous interactions within the current conversation turn, improving context awareness.

### 🛠️ Professional Tools
- **Artifact Extraction**: Automatically identifies and extracts code snippets, JSON data, and structured reports into an interactive panel.
- **Session Branching**: Fork any conversation at any point to explore alternative solutions without losing context.
- **Executive Report Export**: Download synthesized reports as high-quality PDF or Markdown files.
- **Token Usage Tracking**: Real-time monitoring of token consumption for cost and performance visibility.
- **Web Grounding**: Agents have access to Google Search to ground their responses in current information.

---

## 🏗️ Architecture

The application follows a client-side React architecture (Single Page Application) built with Vite, separating core orchestration logic from presentation:

1. **Input Stage**: User submits a prompt.
2. **Analysis Stage**: The prompt is analyzed via First Principles to identify fundamental truths.
3. **Assembly Stage**: Optimal AI personas are selected or dynamically generated based on the prompt.
4. **Execution Stage**: Agents generate unique perspectives in parallel, sequential, or round-robin modes.
5. **Critique Stage**: Agents review and refine each other's work over multiple rounds.
6. **Review Stage (Optional)**: HITL allows for human feedback and steering.
7. **Synthesis Stage**: Refined responses are unified into a final, high-quality output.

---

## 💻 Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Motion 12](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemma 4 Orchestration)
- **Document Generation**: [html2canvas](https://html2canvas.hertzen.com/), [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html)
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown)

---

## 🚀 Installation & Requirements

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A **Google Gemini API Key**

### Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/the-infinite-intelligence.git
   cd the-infinite-intelligence
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📖 Usage Instructions

1. **Enter a Prompt**: Type a complex question or problem into the main input area.
2. **Observe the Process**: Watch the **Processing Visualizer** as the system analyzes your prompt and coordinates agent activity.
3. **Review Perspectives**: Read individual agent outputs in the grid or tab view.
4. **Provide Feedback**: Use the thumbs up/down icons on agent cards to guide their future behavior.
5. **Final Synthesis**: Consume the unified final output, which incorporates all expert perspectives.
6. **Export Results**: Use the **Download** icon to export the synthesized report as a PDF or Markdown file.

---

## 🤝 Development & Contribution

Contributions are welcome! We follow the [Contributor Covenant](https://www.contributor-covenant.org/) code of conduct.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 🧪 Testing Instructions

To verify changes and ensure code quality:

1. **Linting**:
   ```bash
   npm run lint
   ```
2. **Manual Verification**:
   - Run the development server (`npm run dev`).
   - Configure **Workflow Topology** (Quick, Standard, or Deep) in Settings.
   - Submit a test prompt and verify the **First Principles Analysis** appears.
   - Ensure **Artifact Extraction** correctly identifies code or JSON blocks.
   - Test the **Branching** and **PDF Export** functionalities.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

**Empowering human decisions with the precision of collective intelligence.**
