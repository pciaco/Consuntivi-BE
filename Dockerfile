# Usa un'immagine base ufficiale di Node
FROM node:20

# Crea la cartella di lavoro
WORKDIR /app

# Copia i file di progetto
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto del progetto
COPY . .

# Espone la porta su cui gira il server (modifica se diversa)
EXPOSE 3001

# Comando per avviare l'app (modifica se usi npm run dev o altro)
CMD ["npm", "run", "dev"]
