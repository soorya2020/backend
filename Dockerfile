# Use Node base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend files
COPY . .

# Expose backend port (e.g., 5000)
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
