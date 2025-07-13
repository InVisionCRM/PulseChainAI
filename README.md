# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `env.example` to `.env`
   - Set your `GEMINI_API_KEY` in the `.env` file
   - Optionally set `VITE_API_URL` if your backend runs on a different port

3. Start the backend server:
   ```bash
   npm run server:dev
   ```

4. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

### Alternative: Run Both Together

You can run both frontend and backend simultaneously:
```bash
npm run dev:full
```

### API Endpoints

- **Health Check**: `GET http://localhost:3001/api/health`
- **Chat**: `POST http://localhost:3001/api/chat`

### Environment Variables

Create a `.env` file with:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
NODE_ENV=development
VITE_API_URL=http://localhost:3001
```

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the backend to your preferred hosting service (Railway, Render, etc.)

3. Update the `VITE_API_URL` environment variable to point to your production backend URL

4. Deploy the frontend to Vercel, Netlify, or your preferred hosting service
# PulseChainAI
