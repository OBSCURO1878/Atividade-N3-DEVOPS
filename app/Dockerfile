FROM node:20-alpine

WORKDIR /usr/src/app

# Copia apenas os manifestos de dependência para aproveitar o cache de camadas
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --omit=dev

# Copia o código da aplicação ajustando o dono para o usuário 'node' (não-root)
COPY --chown=node:node . .

# Define o usuário sem privilégios de root por segurança
USER node

EXPOSE 3000

CMD ["node", "server.js"]
