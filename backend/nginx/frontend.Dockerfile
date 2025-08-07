# Stage 1: Build the Angular app
# Use a Node.js image to create a build environment. 'AS builder' names this stage.
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies. This is done first to leverage Docker's layer caching.
COPY ../frontend/package.json ../frontend/package-lock.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY ../frontend .

# Build the Angular app for production. The output will be in /app/dist/near-christ
RUN npm run build -- --configuration production


# Stage 2: Serve the app with Nginx
# Use a lightweight Nginx image for the final production container.
FROM nginx:stable-alpine

# Copy the compiled Angular app from the 'builder' stage to Nginx's public HTML directory.
COPY --from=builder /app/dist/near-christ /usr/share/nginx/html

# Copy your custom Nginx configuration.
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expose ports 80 and 443.
EXPOSE 80
EXPOSE 443

# Start Nginx when the container launches.
CMD ["nginx", "-g", "daemon off;"]