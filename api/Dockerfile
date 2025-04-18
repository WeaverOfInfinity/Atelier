# Use official Node image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy only package files first for layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Start the API
CMD ["node", "src/server.js"]
