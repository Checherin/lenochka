/**
 * Example Node.js lead API. Not enabled by pushing static HTML alone.
 * DEPLOY behind same-origin /api/lead; configure production persistence inside Russia.
 * Requirements: NODE >= 20, HTTPS reverse proxy, LEAD_WEBHOOK_URL, LEAD_BOT_URL.
 * The upstream webhook must durably save lead + versioned consent evidence and return 2xx.
 */
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const { LEAD_WEBHOOK_URL, LEAD_BOT_URL, PORT = '8787' } = process.env;
if (!LEAD_WEBHOOK_URL || !LEAD_BOT_URL) {
  console.error('Configure LEAD_WEBHOOK_URL and LEAD_BOT_URL before starting.');
  process.exit(1);
}
const webhook = new URL(LEAD_WEBHOOK_URL);
const bot = new URL(LEAD_BOT_URL);
if (webhook.protocol !== 'https:' || bot.protocol !== 'https:' || !['t.me','telegram.me'].includes(bot.hostname)) {
  throw Error('Secure webhook and Telegram URLs are required.');
}
const json = (res, status, value) => {
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
  res.end(JSON.stringify(value));
};
const receive = async req => {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 8192) throw Error('too_large');
  }
  return JSON.parse(body);
};
createServer(async (req, res) => {
  if (req.url !== '/api/lead') return json(res,404,{ok:false});
  if (req.method !== 'POST') return json(res,405,{ok:false});
  if (!String(req.headers['content-type']||'').startsWith('application/json')) return json(res,415,{ok:false});
  // Enforce same-origin via reverse proxy; add CSRF origin validation and rate limiting there.
  try {
    const d = await receive(req);
    const name = String(d.name||'').trim().slice(0,100);
    const contact = String(d.contact||'').trim().slice(0,120);
    const business = String(d.business||'').trim().slice(0,150);
    const goal = String(d.goal||'').trim().slice(0,100);
    if (!name || !contact || !d.consent || d.consentVersion !== '2026-11-23' || d.website) {
      return json(res,400,{ok:false,error:'invalid_application'});
    }
    // Never include a Telegram link in API error replies.
    const record = {
      id:randomUUID(), name, contact, business, goal,
      consent:{version:'2026-11-23',granted:true,at:new Date().toISOString(),source:'lenochka-site',form:'lead'},
      receivedAt:new Date().toISOString()
    };
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(),10000);
    let saved;
    try {
      saved = await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(record),signal:controller.signal});
    } finally { clearTimeout(timeout); }
    if (!saved.ok) throw Error('persist_failed');
    return json(res,200,{ok:true,botUrl:bot.toString()});
  } catch (err) {
    console.error('Lead handling failed:',String(err?.message||err).slice(0,160));
    return json(res,503,{ok:false,error:'temporarily_unavailable'});
  }
}).listen(Number(PORT),'127.0.0.1',()=>console.log('Lenochka lead API ready'));
