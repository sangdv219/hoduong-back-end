# Install dependencies only when needed
FROM node:20-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev \
    && npm cache clean --force


# Rebuild the source code only when needed
FROM node:20-alpine AS builder   
ARG PF_ENV

WORKDIR /app
RUN echo "$PF_ENV" > /app/.env
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN yarn build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env .env
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]