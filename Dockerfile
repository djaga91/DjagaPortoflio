# Stage 1: Development
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app files
COPY . .

# Expose port (matches vite.config.ts)
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
