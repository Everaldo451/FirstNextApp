FROM node:20 AS build 

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20

WORKDIR /app
COPY --from=build /app/package*.json ./
RUN npm install --production
COPY --from=build /app/.next ./
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
EXPOSE 3000

CMD ["npm", "start"]

