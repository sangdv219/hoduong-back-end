# Install dependencies only when needed
FROM node:22-alpine AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm install


# Rebuild the source code only when needed
FROM node:22-alpine AS builder   
ARG PF_ENV

WORKDIR /app
RUN echo "$PF_ENV" > /app/.env
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN echo "$PF_ENV" > .env
RUN yarn build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env.staging ./.env

ENV NODE_ENV=production
# RUN cp .env.staging .env
EXPOSE 3000
CMD ["node", "dist/main"]
