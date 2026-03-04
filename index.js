// ============================================
//   FREE GPT API — Powered by M1 Hacks
//   WhatsApp Channel: https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44
// ============================================

const crypto = require('crypto');
const axios  = require('axios');

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
        stream           : false,   // ← Vercel ke liye stream OFF
        temperature      : 0.5,
        top_p            : 0.95,
        max_tokens       : 4000,
        frequency_penalty: 0,
        presence_penalty : 0
    };

    const response = await axios.post(apiUrl, payload, { headers });
    const reply = response.data?.choices?.[0]?.message?.content || "";

    return {
        status : true,
        creator: 'M1 Hacks',
        channel: 'https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44',
        model  : 'gpt-5.2-nano',
        reply  : reply.trim()
    };
}

// ─── Vercel Serverless Handler ────────────────────────────────────────────────
module.exports = async (req, res) => {

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // Home route
    if (req.url === '/' || req.url === '') {
        return res.json({
            name   : 'M1 Hacks — Free GPT API',
            channel: 'https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44',
            usage  : 'GET /api?q=your+question   OR   POST /api { "question": "..." }',
            model  : 'gpt-5.2-nano',
            status : 'online'
        });
    }

    // GET /api?q=hello
    const question =
        req.query?.q ||
        req.query?.question ||
        req.body?.question ||
        req.body?.q;

    if (!question) {
        return res.status(400).json({
            status : false,
            creator: 'M1 Hacks',
            error  : '"q" parameter required. Example: /api?q=hello'
        });
    }

    try {
        const result = await askOverchat(question);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({
            status : false,
            creator: 'M1 Hacks',
            channel: 'https://whatsapp.com/channel/0029Vb7bRaeAYlUTWchwPV44',
            error  : err.message
        });
    }
};
