# Bloxify - Roblox Token Platform

A full-stack web application for earning and redeeming Roblox tokens through minigames and advertisements.

## Features

- Token earning through minigames and ads
- Roblox code redemption system  
- VIP membership system
- Referral system
- Admin dashboard
- Multi-provider ad integration

## Deployment to Render

### Prerequisites
1. Push your code to GitHub
2. Create a Render account at https://render.com

### Deployment Steps

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select "Web Service"
   - Use these settings:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Environment: `Node`

2. **Create PostgreSQL Database**
   - Create a new PostgreSQL database in Render
   - Copy the database URL

3. **Set Environment Variables**
   ```
   DATABASE_URL=<your_postgres_url_from_render>
   NODE_ENV=production
   ```

4. **Deploy**
   - Render will automatically build and deploy your app
   - Your app will be available at `https://your-app-name.onrender.com`

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for required environment variables.