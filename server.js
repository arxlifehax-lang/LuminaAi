const http = require('http');

// ── Load .env config ─────────────────────────────────────────────────────
const fs_env = require('fs');
const path_env = require('path');
function loadEnv() {
  const envPath = path_env.join(__dirname, '.env');
  if (!fs_env.existsSync(envPath)) return;
  fs_env.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && !k.startsWith('#') && v.length) {
      process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
}
loadEnv();
const CONFIG = {
  googleClientId:    process.env.GOOGLE_CLIENT_ID    || '',
  ngrokUrl:          process.env.NGROK_URL            || '',
  telegramBotToken:  process.env.TELEGRAM_BOT_TOKEN   || '',
  telegramChatId:    process.env.TELEGRAM_CHAT_ID     || '',
  port:              parseInt(process.env.PORT)        || 3000,
};

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = CONFIG.port || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning',
        });
        return res.end();
    }

    // Dynamic request log printing
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    
    // API endpoint for running the real Python pipeline orchestrator
    if (req.method === 'POST' && req.url === '/api/run-pipeline') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            let params = {};
            try {
                params = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                console.log(`[${timestamp}] Response: 400 Bad Request`);
                return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
            
            const mode = params.mode || 'basic';
            const goal = params.goal || 'Create interactive 3D landscape';
            const lr = params.lr || '2e-4';
            const epochs = params.epochs || '3';
            const lora = params.lora || '16';
            
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            });
            
            console.log(`[${timestamp}] Spawning real Python: mode=${mode}, goal="${goal}"`);
            
            const pyProcess = spawn('python', [
                'lumina_agent_studio.py',
                '--mode', mode,
                '--goal', goal,
                '--lr', lr,
                '--epochs', epochs,
                '--lora', lora
            ]);
            
            pyProcess.stdout.on('data', data => {
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        res.write(`data: ${line.trim()}\n\n`);
                    }
                });
            });
            
            pyProcess.stderr.on('data', data => {
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    if (line.trim()) {
                        res.write(`data: [stderr] ${line.trim()}\n\n`);
                    }
                });
            });
            
            pyProcess.on('close', code => {
                let artifactCode = '';
                try {
                    if (fs.existsSync('sandbox_artifact.html')) {
                        artifactCode = fs.readFileSync('sandbox_artifact.html', 'utf-8');
                    }
                } catch (e) {
                    console.error('Failed to read sandbox_artifact.html', e);
                }
                
                const finalPayload = {
                    status: 'success',
                    exitCode: code,
                    artifact: artifactCode
                };
                
                res.write(`data: __COMPLETED__:${JSON.stringify(finalPayload)}\n\n`);
                console.log(`[${timestamp}] Python script completed with exit code ${code}`);
                res.end();
            });
            
            pyProcess.on('error', err => {
                res.write(`data: [ERROR] Failed to launch Python: ${err.message}\n\n`);
                console.log(`[${timestamp}] Python launch error: ${err.message}`);
                res.end();
            });
        });
        return;
    }
    
    // API endpoint to append new chat history to the training dataset.json
    if (req.method === 'POST' && req.url === '/api/feed-chat-to-dataset') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            let params = {};
            try {
                params = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            }
            
            const instruction = params.instruction || '';
            const output = params.output || '';
            
            if (!instruction.trim() || !output.trim()) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Instruction and output cannot be empty' }));
            }
            
            const datasetPath = path.join(__dirname, 'training_demo', 'dataset.json');
            let dataset = [];
            
            try {
                if (fs.existsSync(datasetPath)) {
                    const dataStr = fs.readFileSync(datasetPath, 'utf-8');
                    dataset = JSON.parse(dataStr);
                }
            } catch (e) {
                console.error('Failed to read or parse dataset.json', e);
            }
            
            // Check if exact pair already exists
            const duplicate = dataset.find(item => 
                item.instruction.trim() === instruction.trim() &&
                item.output.trim() === output.trim()
            );
            
            if (!duplicate) {
                dataset.push({
                    instruction: instruction.trim(),
                    output: output.trim()
                });
                
                try {
                    fs.writeFileSync(datasetPath, JSON.stringify(dataset, null, 2), 'utf-8');
                    console.log(`Appended conversation to SFT dataset.json successfully. Total entries: ${dataset.length}`);
                } catch (e) {
                    console.error('Failed to write to dataset.json', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Failed to write dataset' }));
                }
            } else {
                console.log(`Blocked duplicate SFT dataset entry`);
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ 
                status: 'success', 
                message: 'Successfully injected conversation into local SFT dataset!', 
                totalEntries: dataset.length 
            }));
        });
        return;
    }
    
    // ── Public config endpoint ─────────────────────────────────────────
    const rawPath = req.url.split('?')[0];
    // ── Survey → Telegram ────────────────────────────────────────────────
    if (rawPath === '/api/survey' && req.method === 'POST') {
        let body = '';
        req.on('data', d => body += d);
        req.on('end', async () => {
            try {
                const data  = JSON.parse(body);
                const token = CONFIG.telegramBotToken;
                const chatId= CONFIG.telegramChatId;
                if (!token || !chatId) {
                    res.writeHead(400, {'Content-Type':'application/json'});
                    return res.end(JSON.stringify({ok:false,error:'Telegram not configured in .env'}));
                }
                const labels = {
                    trash:'ขยะตกค้าง', traffic:'การจราจรติดขัด',
                    toilet:'กลิ่นห้องน้ำ', drain:'กลิ่นท่อระบาย',
                    other:'มลพิษอื่นๆ',
                };
                const emoji = {true:'🔴',false:'🟢'};
                const lines = Object.entries(data.answers||{})
                    .map(([k,v]) => {
                        const remarkText = (data.remarks||{})[k] ? ' — ' + data.remarks[k] : '';
                        return emoji[v] + ' ' + (labels[k]||k) + ': ' + (v?'พบ':'ไม่พบ') + remarkText;
                    });
                const loc = data.location ? data.location.lat+', '+data.location.lng : 'ไม่ทราบ';
                const title = data.survey_title || 'แบบสำรวจ';
                const msg = [
                    '📋 *' + title + '*',
                    '━━━━━━━━━━━━━━━━',
                    '📅 วันที่: ' + (data.survey_date||data.timestamp||'-'),
                    '👤 ผู้สำรวจ: ' + (data.surveyor||'ไม่ระบุ'),
                    '━━━━━━━━━━━━━━━━',
                    ...lines,
                    '━━━━━━━━━━━━━━━━',
                    '📍 ตำแหน่ง: ' + loc,
                    '🕐 เวลาส่ง: ' + (data.timestamp||'-'),
                ].join('\n');
                const tgRes = await fetch(
                    'https://api.telegram.org/bot'+token+'/sendMessage',
                    { method:'POST',
                      headers:{'Content-Type':'application/json'},
                      body:JSON.stringify({chat_id:chatId,text:msg,parse_mode:'Markdown'}) }
                );
                const tgData = await tgRes.json();
                res.writeHead(200,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
                res.end(JSON.stringify({ok:tgData.ok,error:tgData.description||null}));
            } catch(e) {
                res.writeHead(500,{'Content-Type':'application/json'});
                res.end(JSON.stringify({ok:false,error:e.message}));
            }
        });
        return;
    }

    if (rawPath === '/api/config') {
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify({ googleClientId: CONFIG.googleClientId, ngrokUrl: CONFIG.ngrokUrl }));
    }

    // ── Auth pages (always accessible) ──────────────────────────────
    if (rawPath === '/field-survey' || rawPath === '/field-survey.html') {
        const fsf = require('path').join(__dirname, 'field-survey.html');
        fs.readFile(fsf, (e, d) => {
            if (e) { res.writeHead(404); return res.end('Not found'); }
            res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(d);
        });
        return;
    }

    if (rawPath === '/presentation' || rawPath === '/presentation.html') {
        const pf = require('path').join(__dirname, 'presentation.html');
        fs.readFile(pf, (e, d) => {
            if (e) { res.writeHead(404); return res.end('Not found'); }
            res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(d);
        });
        return;
    }

    if (rawPath === '/survey' || rawPath === '/survey.html') {
        const sf = require('path').join(__dirname, 'survey.html');
        fs.readFile(sf, (e, d) => {
            if (e) { res.writeHead(404); return res.end('Not found'); }
            res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(d);
        });
        return;
    }

    if (rawPath === '/login' || rawPath === '/login.html') {
        const lf = require('path').join(__dirname, 'login.html');
        fs.readFile(lf, (e, d) => {
            if (e) { res.writeHead(404); return res.end('Not found'); }
            res.writeHead(200, { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*' });
            res.end(d);
        });
        return;
    }
    if (rawPath === '/auth.js') {
        const af = require('path').join(__dirname, 'auth.js');
        fs.readFile(af, (e, d) => {
            if (e) { res.writeHead(404); return res.end('Not found'); }
            res.writeHead(200, { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' });
            res.end(d);
        });
        return;
    }

    // Serve static files
    // Strip query parameters (?v=...) from the URL to resolve files correctly on the disk
    const parsedUrl = req.url.split('?')[0];
    // "/" → landing page, "/app" → chatbot, "/login" → login
    let urlMap = { '/': 'landing.html', '/app': 'index.html', '/chat': 'index.html' };
    let resolvedUrl = urlMap[parsedUrl] || parsedUrl;
    let filePath = path.join(__dirname, resolvedUrl);
    
    // Safety check to prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        console.log(`[${timestamp}] Response: 403 Forbidden`);
        return res.end('Access Forbidden');
    }
    
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                console.log(`[${timestamp}] Response: 404 Not Found (File: ${filePath})`);
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                console.log(`[${timestamp}] Response: 500 Internal Error (File: ${filePath})`);
                res.end(`Internal Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
            // Successfully served file
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Lumina Custom Web Server (Real Backend) active at http://localhost:${PORT}`);
});
