# Multi-stage build for Angular application
# Stage 1: Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Build configuration (development, test, production)
ARG BUILD_CONFIGURATION=development

# Copy only package.json first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci && \
    echo "✅ Dependencies installed. Angular version:" && \
    npm list @angular/core --depth=0

# Copy the rest of the source code
COPY . .

# Clean previous builds to ensure fresh configuration replacement
RUN rm -rf dist/ && rm -rf .angular/

# Build the Angular application with the specified configuration
RUN echo "Building Angular application with configuration: ${BUILD_CONFIGURATION}" && \
    npm run build -- --configuration=${BUILD_CONFIGURATION} && \
    echo "✅ Build complete. Contents of /app/dist/css:" && \
    ls -la /app/dist/css/

# Stage 2: Production stage using nginx for SPA routing
FROM nginx:alpine

# Remove default nginx files to avoid conflicts
RUN rm -rf /usr/share/nginx/html/*

# Copy nginx configuration files
COPY cicd/docker/nginx.conf /etc/nginx/nginx.conf
COPY cicd/docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
# Angular 17+ outputs to dist/css/browser/ - preserve directory structure including assets/
COPY --from=build /app/dist/css/browser/ /usr/share/nginx/html/

# Create and fix permissions for nginx cache and log directories
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/run \
    && chmod -R 777 /var/cache/nginx /var/log/nginx /var/run

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
