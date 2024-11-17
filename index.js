require('dotenv').config();  // Load .env variables at the start
const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const app = express();
const fs = require('fs');

// Express JSON middleware to handle JSON body
app.use(express.json());

// Google Sheets setup
const SHEET_ID = process.env.SHEET_ID; // Add your Google Sheet ID here
const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_CREDENTIALS_PATH, 'utf-8'));


// Authenticate with Google
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Webhook endpoint to receive order data
app.post('/order-webhook', async (req, res) => {
    const order = req.body;

    // Extract order details
    const date = new Date().toLocaleDateString();
    const customerName = order.customer_name || "N/A"; // Update with actual key from the order payload
    const customerPhone = order.phone || "N/A"; // Update with actual key from the order payload
    const address = order.address || "N/A"; // Update with actual key from the order payload
    const parentCode = order.products?.[0]?.parent_code || "N/A";
    const sku = order.products?.[0]?.sku || "N/A";
    const price = order.products?.[0]?.price || 0;
    const qty = order.products?.[0]?.qty || 0;
    const deliveryCost = order.delivery_cost || 0; // Update with actual key
    const grandTotal = order.total_price || 0;

    // Send SMS
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SENDER_ID;
    const smsApiUrl = process.env.SMS_API_URL;

    const message = `সম্মানিত গ্রাহক, আপনার অর্ডারটি কনফার্ম করা হয়েছে, ডেলিভারি এজেন্ট কল দিলে, অবশ্যই পার্সেলটি রিসিভ করে নিবেন। 
টোটাল বিল: ${grandTotal} টাকা। 
কল করুন 01303559063 chinatobd.shop সাথে থাকার জন্য ধন্যবাদ`;

    const fullSmsApiUrl = `${smsApiUrl}?api_key=${apiKey}&type=text&contacts=${customerPhone}&senderid=${senderId}&msg=${encodeURIComponent(message)}`;

    try {
        // Send SMS
        await axios.get(fullSmsApiUrl);
        console.log("SMS sent successfully");

        // Append data to Google Sheet
        const sheetData = [
            [date, customerName, customerPhone, address, parentCode, sku, price, qty, deliveryCost, grandTotal],
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: "Shopyfy C to BD", // Adjust sheet name and range as needed
            valueInputOption: "USER_ENTERED",
            resource: { values: sheetData },
        });

        console.log("Order data added to Google Sheet successfully");
        res.sendStatus(200);
    } catch (error) {
        console.error("Error handling order data:", error);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
