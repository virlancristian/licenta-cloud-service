FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copy wait script
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

RUN npx prisma generate
RUN npm run build

CMD ["/wait-for.sh", "sh", "-c", "npx prisma db push && node dist/scripts/generate.api.token.js && node dist/main"]
