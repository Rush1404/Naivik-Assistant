import 'dotenv/config';
import { google } from 'googleapis';

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function testConnection() {
  console.log("🔍 Testing connection to Sheet ID:", SPREADSHEET_ID);
  
  try {
    const auth = new google.auth.GoogleAuth({
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/cloud-platform'
      ],
    });
    const authClient = await auth.getClient(); 

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1:E1', // Test reading the header
    });

    if (response.data.values) {
      console.log("✅ SUCCESS! Found headers:", response.data.values[0]);
    } else {
      console.log("⚠️ CONNECTED, but the sheet appears to be empty.");
    }
  } catch (err) {
    console.error("❌ FAILED to connect to Google Sheets.");
    console.error("Reason:", err.message);
    if (err.message.includes("not found")) {
      console.log("👉 Tip: Check if SPREADSHEET_ID is correct in your .env");
    }
  }
}

testConnection();