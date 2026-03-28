# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Railway passes service variables as build args automatically
ARG VITE_API_URL
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_APP_ID

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage — nginx serves SPA with client-side routing
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
