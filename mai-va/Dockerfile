FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev || true
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
