# Use Node.js 20 on Alpine Linux for a small image footprint
FROM node:20-alpine AS development

# Install libc6-compat (required for certain Next.js dependencies like 'sharp')
RUN apk add --no-cache libc6-compat

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions first to leverage Docker cache
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application source code
# Note: Files listed in .dockerignore (like .next and node_modules) will be skipped
COPY . .

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Start Next.js in development mode with hot-reloading
CMD ["npm", "run", "dev"]
