# Projects by Aditya Jethani

> Markdown version of https://adityajethani.vercel.app/projects for AI agents. Full profile: https://adityajethani.vercel.app/index.md


### Setu: Kumbh Lost and Found Network

Live at https://setu-kumbh.vercel.app/. An offline-first, voice-first platform that reunites families separated at the Kumbh Mela. Built with Next.js, Flutter and FastAPI. Uses Sarvam Saarika for speech-to-text and Bulbul for text-to-speech, supporting one-tap voice intake across 23 Indian languages for users who cannot read or type. The matching engine reached Recall@1 of 87% and Recall@5 of 97% on a reproducible evaluation, with hashed-PII privacy design. Built at Claude Impact Lab 2026, where it placed Top 7 in India.

### TalentScout AI

Live at https://aitalentscout.streamlit.app/. A production candidate-screening assistant that parses resumes, generates role-specific questions and scores answers with running confidence. Built with Python, LangChain, LangGraph, Llama 3.3 70B and Streamlit. Reached 85% validation accuracy and cut hiring evaluation time by 60%.

### Prompt Detective

Live at https://promptdetective.streamlit.app/. A multimodal pipeline that reverse-engineers the prompt behind an AI-generated image or video using computer-vision signal extraction and semantic retrieval. Built with OpenCV, CLIP, Sentence-Transformers and pgvector. Reached 85% Top-K accuracy with under 5 seconds processing for a one-minute video.

### Grade Flow

Live at https://gradeflow.streamlit.app/. A RAG teacher's assistant that automates grading with plagiarism detection, automatic question-paper generation and a timed test environment. Built with FastAPI, LangGraph, pgvector, FAISS and Gemma-2. Automated 90% of the grading workflow and cut evaluation time by 75%.

### Tongue Analysis AI

A clinical computer-vision system for traditional-medicine diagnostics, analysing coating, colour and cracks across 2,524 images to replace subjective scoring. Built with PyTorch, OpenCV, scikit-image and Flask. Reached 94.2% colour accuracy and 91.7% coating accuracy.

### Company Brain

https://github.com/okaditya84/Company-Brain. A multi-tenant RAG platform with hybrid semantic search and citation-grounded answers to reduce hallucination, served through asynchronous microservices. Built with FastAPI, PostgreSQL with pgvector, Redis and Docker, gated by a CI pipeline running lint, type-checks, migrations and tests.

### Neural ODE for Heart Rate

https://github.com/okaditya84/Neural-ODE-for-Heart-Rate. A continuous-time ordinary-differential-equation model reconstructing and forecasting irregularly sampled ICU heart-rate trajectories from MIMIC-III with masked-point imputation. Built with PyTorch and torchdiffeq. Reached MSE of 0.443 and RMSE of approximately 7.01 beats per minute.

### Scrollwise

A full-stack digital-wellbeing app and Chrome extension that turns scroll, click and focus events into real-world analogies with AI insights. Built with Next.js, Express, TypeScript, MongoDB and Groq, with under 500 millisecond insight latency.

### BOB Agent

https://github.com/okaditya84/BOB-Agent. A safety-first banking assistant with output guardrails and a Model Context Protocol server across four microservices (identity, KYC, assistant and gateway), orchestrated with Docker Compose and verified by an 88-case pytest suite.

---

