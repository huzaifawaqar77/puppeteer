# Use a multi-arch Alpine base image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install ARM-compatible Chromium and dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    gcompat

# Copy package files
COPY package.json package-lock.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Expose the port (we'll use 3000)
EXPOSE 3000

# Set the user to 'node' for better security
USER node

# Command to run your application
CMD ["node", "index.js"]