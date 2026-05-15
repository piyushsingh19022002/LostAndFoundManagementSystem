# 1. Choose a lightweight Node.js base image
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application source code
COPY . .

# 6. Expose the port the backend runs on
EXPOSE 5001

# 7. Start the backend server
CMD ["npm", "run", "dev"]
