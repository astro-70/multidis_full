FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3005
ENV PORT=3005

CMD ["npm", "start"]

