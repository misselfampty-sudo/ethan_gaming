FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev && apk add --no-cache curl

# Copy source
COPY . .

# Expose API port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "node migrate.js && node server.js"]
