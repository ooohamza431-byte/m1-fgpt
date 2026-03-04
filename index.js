// ============================================
//   FREE GPT API — Powered by M1 Hacks
//   WhatsApp: https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44
// ============================================

const crypto = require('crypto');
const axios  = require('axios');
const url    = require('url');

const generateUUID = () => {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0;
              const v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
          });
};

async function askOverchat(question) {
    const apiUrl = "https://api.overchat.ai/v1/chat/completions";

    const headers = {
        'Content-Type'      : 'application/json',
        'Accept'            : '*/*',
        'X-Device-Platform' : 'web',
        'X-Device-Version'  : '1.0.44',
        'X-Device-Language' : 'en-US',
        'X-Device-UUID'     : generateUUID(),
        'User-Agent'        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
        'Origin'            : 'https://overchat.ai',
        'Referer'           : 'https://overchat.ai/'
    };

    const payload = {
        chatId   : generateUUID(),
        model    : "gpt-5.2-nano",
        personaId: "free-chat-gpt-landing",
        messages : [
            { id: generateUUID(), role: "user",   content: question },
            { id: generateUUID(), role: "system", content: ""       }
        ],
        stream           : true,   // ← stream ON rakho, manually parse karenge
        temperature      : 0.5,
        top_p            : 0.95,
        max_tokens       : 4000,
        frequency_penalty: 0,
        presence_penalty : 0
    };

    // Stream response ko text ki tarah lo
    const response = await axios.post(apiUrl, payload, {
        headers,
        responseType: 'text'
    });

    // SSE lines parse karo
    let fullReply = "";
    const lines = response.data.split('\n');

    for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.replace('data: ', '').trim();
        if (raw === '[DONE]') continue;
        try {
            const json    = JSON.parse(raw);
            const content = json.choices?.[0]?.delta?.content || "";
            fullReply += content;
        } catch (_) {}
    }

    return {
        status : true,
        creator: 'M1 Hacks',
        channel: 'https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44',
        model  : 'gpt-5.2-nano',
        reply  : fullReply.trim()
    };
}

module.exports = async (req, res) => {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // Parse query
    const parsed   = url.parse(req.url, true);
    const question = parsed.query.q || parsed.query.question || req.body?.q || req.body?.question;

    if (!question) {
        return res.status(200).json({
            name   : 'M1 Hacks — Free GPT API',
            channel: 'https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44',
            usage  : '?q=your+question',
            model  : 'gpt-5.2-nano',
            status : 'online ✅'
        });
    }

    try {
        const result = await askOverchat(question);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({
            status : false,
            creator: 'M1 Hacks',
            error  : err.message
        });
    }
};
