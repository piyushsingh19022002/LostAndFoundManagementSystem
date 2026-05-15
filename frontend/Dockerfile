# 1. Choose a lightweight Node.js base image
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json first
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the frontend source code
COPY . .

# 6. Expose the Vite default port
EXPOSE 5173

# 7. Start the Vite development server and expose to network
CMD ["npm", "run", "dev", "--", "--host"]
