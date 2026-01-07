# Patterning Web V2

A clean, modern frontend for Patterning.ai, built with React 19, Tailwind CSS 4, and Vite.

## Features

- **Pattern History**: View generated patterns from the database.
- **Prompt Editor**: Edit and version prompts (Voicing, Essence, etc.).
- **Playground**: Test prompts in real-time with the backend API.
- **Clean Architecture**: Direct API communication (bypassing Supabase RLS for admin tasks), typed interfaces, and modular components.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or set in deployment):
    ```env
    VITE_API_URL=http://localhost:8080/api  # URL of your patterning-api-v2
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Deployment (Railway)

1.  Connect this repository to Railway.
2.  Set the `VITE_API_URL` environment variable to your production backend URL (e.g., `https://patterning-api-production.up.railway.app/api`).
3.  Deploy!

## Project Structure

- `src/components`: UI components (Sidebar, Layout, PromptEditor).
- `src/lib`: API client (`api.ts`) and utilities.
- `src/App.tsx`: Main application logic and routing.
