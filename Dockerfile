FROM node:latest

# Declare token variable
ARG NPM_TOKEN

# Create app directory
WORKDIR /app

# Copy Package.json and Package-lock.json
COPY package*.json /app/

# Copy node_modules file
COPY node_modules /app/node_modules

# Install dependencies
RUN npm install

# Copy dist folder to working directory
COPY dist/ /app/

# Start node app
CMD [ "node", "/app/index.js" ]