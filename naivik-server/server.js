import 'dotenv/config';
import express from 'express';
import { google } from 'googleapis';
import { VertexAI } from '@google-cloud/vertexai';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const project = process.env.GOOGLE_PROJECT_ID; 
const location = 'us-central1';

// --- CONFIGURATION ---
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const authClient = await auth.getClient();
const sheets = google.sheets({ version: 'v4', auth: authClient });

const vertexAI = new VertexAI({ project, location });
const generativeModel = vertexAI.getGenerativeModel({
  model: 'gemini-2.0-flash-lite-001',
  generationConfig: { responseMimeType: 'application/json' }
});

function formatForUI(rows) {
  if (!rows || rows.length <= 1) return [];
  return rows.slice(1).map(row => ({
    id: row[0] || '',
    task: row[1] || '',
    owner: row[2] || '',
    priority: row[3] || '',
    date: row[4] || ''
  }));
}

// --- ROUTES ---

app.get('/tasks', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E',
    });
    res.json({ success: true, items: formatForUI(response.data.values) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // 1. Fetch current data
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:E',
    });
    const allRows = sheetData.data.values || [];
    const fullLog = JSON.stringify(formatForUI(allRows));

    // 2. Define prompt inside the route so fullLog and message are in scope
    const finalPrompt = `
You are Naivik, a world-class Project Management Consultant.


### THE NO-DATA PROTOCOL (CRITICAL)
- **NEVER** use bullet points, dashes, or lists in your "assistant_reply".
- **NEVER** write out task titles, dates, or priority levels in the chat.
- **UI RULE:** The user sees all data in the "Quick Look" sidebar. Your text is for **ANALYSIS ONLY**.
- If asked "Show me Jordan's tasks," your reply MUST be: "I have isolated Jordan's tasks in the sidebar. He is currently a critical bottleneck with 4 High-priority items."
- If you print a list of tasks, you have failed the protocol.


### CONTEXT
CURRENT LOG DATA: ${fullLog}
USER REQUEST: "${message}"


### WORKLOAD LOGIC
- 5+ tasks = Overloaded.
- 3+ 'High' priority tasks = Critical Bottleneck.
- Compare overlaps (e.g., "SSL" vs "Cert") to find time-wasters.


### OUTPUT SCHEMA (STRICT JSON ONLY)
{
 "intent": "QUERY" | "ANALYZE" | "ADD" | "REMOVE",
 "data": {
    "name": "Jordan",
    "analysis_targets": ["Jordan"],
    "relevant_ids": ["N-001", "N-002", "N-003", "N-004", "N-005", "N-012"]
 },
 "assistant_reply": "Analytical insight ONLY. No lists. No bullet points. Max 3 sentences."
}`;

    // 3. Ask Gemini
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }]
    });

    const brain = JSON.parse(result.response.candidates[0].content.parts[0].text);

    // 4. FILTERING THE QUICK LOOK
    let itemsToReturn = formatForUI(allRows);

    if (brain.data?.relevant_ids?.length > 0) {
        itemsToReturn = itemsToReturn.filter(item => 
            brain.data.relevant_ids.includes(item.id)
        );
    } else if (brain.data?.analysis_targets?.length > 0) {
        const targets = brain.data.analysis_targets.map(t => t.toLowerCase());
        itemsToReturn = itemsToReturn.filter(item => 
            targets.some(name => item.owner.toLowerCase().includes(name))
        );
    }

    res.json({
      reply: brain.assistant_reply,
      items: itemsToReturn
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Logic error.", items: [] });
  }
});

app.listen(3001, () => console.log('🚀 Server: 3001'));