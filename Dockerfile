# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package and lock files
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application source code
COPY . .

# Build the application for production
# This creates a 'dist' folder with the static files
RUN pnpm run build


# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS final

# Copy the built static files from the 'builder' stage to the Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration file
# This is crucial for handling Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# The default command for the nginx image is to start the server,
# so we don't need to specify a CMD.
