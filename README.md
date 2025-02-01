## Local-Agentic-Systems

Build scalable, AI systems locally with OLLAMA's local LLMs.

### Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Future Plans](#future-plans)

## Introduction

Welcome to Local-Agentic-Systems! Our project aims to make it easy for developers and enthusiasts to build scalable and automated systems using OLLAMA's local Large Language Models (LLMs). With Node.js as the primary technology, you can create sophisticated AI applications without leaving your local machine.

## Features

- **Scalability**: Run multiple instances of models locally.
- **Automation**: Automate tasks with ease using AI-powered workflows.
- **Local Integration**: Utilize OLLAMA's LLMs directly from your local environment.

## Installation

To get started, follow these steps:

1. **Download Ollama**: Visit the [OLLAMA website](https://ollama.com) to download and install the necessary software.
2. **Install Desired Model**: Choose a model that suits your needs and install it following the provided instructions.
3. **Find Local Endpoint**: The API endpoint for local LLMs is typically `http://127.0.0.1:11434/v1/chat/completions`.
4. **Create .env File**: Create a `.env` file in your project directory and add the following line, replacing `<endpoint>` with your actual endpoint:
   ```plaintext
   LLM_URL=http://127.0.0.1:11434/v1/chat/completions
   ```
5. **Install NPM Libraries**: Run the following command to install all required dependencies:
   ```bash
   npm install
   ```
6. **Start Development Server**: Run the development server with:
   ```bash
   npm run dev
   ```

## Usage

Local-Agentic-Systems is incredibly flexible and can be used for a wide range of applications. Below is an example use case in the `contentGenerator` folder.

### Example Use Case

Check out the `contentGenerator` folder to see how you can leverage Local-Agentic-Systems for generating content using AI. This demonstrates a practical application of our project.

## Future Plans

Our plans include creating boilerplate code that allows anyone, regardless of technical background, to create local AI systems easily. Stay tuned for more updates!

Feel free to contribute to this project by opening issues or submitting pull requests. Your feedback is invaluable!# local-agentic-systems
