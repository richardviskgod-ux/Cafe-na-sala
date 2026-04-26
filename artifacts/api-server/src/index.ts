import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app';

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("A variável de ambiente PORT é obrigatória, mas não foi fornecida.");
}

const port = Number(rawPort);

if (isNaN(port) || port <= 0) {
  throw new Error(`Valor de PORTA inválido: ${rawPort}`);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, "../../cafe-no-quarto/dist");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`);
});
