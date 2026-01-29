FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm config set registry https://registry.npmmirror.com && npm install

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Expose port
EXPOSE 3000

# Run in production mode
CMD ["npm", "run", "start"]
