const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

// Configuração do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('Client is ready!');
});

// Evento para exibir o QR Code
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Evento para tratar mensagens recebidas
client.on('message_create', async (message) => {
    try {
        // Verifica se a mensagem é uma resposta (se tem uma mensagem citada)
        if (message.hasQuotedMsg) {
            console.log(`Mensagem ignorada (é uma resposta a outra mensagem): ${message.body}`);
            return; // Ignora a mensagem e não processa
        }

        const userMessage = message.body.trim(); // Mensagem recebida do usuário
        console.log(`Mensagem recebida de ${message.from}: ${userMessage}`);

        // Adiciona a instrução para a IA responder sempre em português do Brasil
        const prompt = userMessage + "\nPor favor, responda sempre em português do Brasil.";

        // Fazendo a chamada para a API de IA
        const response = await axios.post('http://localhost:3000/ia', {
            text: prompt, // Passa o prompt com a instrução de português
        });

        const aiResponse = response.data; // Obtém a resposta da IA
        console.log(`Resposta da IA para ${message.from}: ${aiResponse}`);

        // Verifica se a resposta da IA é válida
        if (!aiResponse || typeof aiResponse !== 'string') {
            console.error("Resposta da IA é inválida:", aiResponse);
            message.reply("Desculpe, não consegui entender sua solicitação. Tente novamente mais tarde.");
            return;
        }

        // Responde diretamente à mensagem original utilizando reply()
        await message.reply(aiResponse); // Responde diretamente à mensagem recebida
        console.log("Resposta enviada com sucesso!");
    } catch (error) {
        console.error('Erro ao processar a mensagem:', error.message);

        // Envia uma mensagem de erro padrão para o usuário
        message.reply('Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde. 🙁');
    }
});

// Inicializa o cliente do WhatsApp
client.initialize();
