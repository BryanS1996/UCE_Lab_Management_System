# Builder stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --legacy-peer-deps && \
    npm cache clean --force

COPY . .

RUN npm install --legacy-peer-deps && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["node", "dist/main"]
