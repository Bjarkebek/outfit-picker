#Base image
FROM node:20-alpine AS base

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

WORKDIR /app

# Install deps
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Run image
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
