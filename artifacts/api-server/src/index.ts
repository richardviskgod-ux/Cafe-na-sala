import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// 🔥 Porta correta do Render
const PORT = process.env.PORT || 10000;

// 🔥 Caminho correto do frontend buildado
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ esse caminho é MUITO importante
const frontendPath = path.join(__dirname, "../../coffee-in-the-room/dist");

// Servir arquivos do frontend
app.use(express.static(frontendPath));

// Rota principal
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Subir servidor
app.listen(PORT, () => {
  console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
