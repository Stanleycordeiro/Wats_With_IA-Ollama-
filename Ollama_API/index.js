import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.post("/ia", async (req, res) => {
  const { text } = req.body;

  // Verifica se o texto foi enviado e é válido
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).send("Texto inválido ou ausente no corpo da requisição.");
  }

  try {
    // Envia a requisição para o servidor Ollama
    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.2", // Verifique se o modelo está correto
        prompt: text,
        stream: false,
      },
      
    );

    // Verifica se a resposta da IA está no formato esperado
    if (response.data && response.data.response) {
      const respData = response.data.response.toString();
      return res.send(respData);
    } else {
      return res.status(500).send("Resposta inesperada da API Ollama.");
    }
  } catch (error) {
    console.error("Erro ao processar a requisição:", error.message);

    // Tratamento de erros mais detalhado
    if (error.response) {
      console.error("Erro na resposta da API:", error.response.data);
      return res.status(error.response.status).send(error.response.data || "Erro na API do Ollama.");
    } else if (error.request) {
      return res.status(500).send("Sem resposta do servidor Ollama. Verifique a conexão.");
    } else {
      return res.status(500).send("Erro desconhecido ao processar a requisição.");
    }
  }
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
