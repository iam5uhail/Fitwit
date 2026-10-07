const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT TO MONGODB (Using Legacy URI to bypass SRV block!)
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// DEFINE USER SCHEMA
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  joined: { type: Date, default: Date.now },
  totalSteps: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// DEFINE DAILY STEPS SCHEMA
const dailyStepSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  steps: { type: Number, default: 0 },
  goal: { type: Number, default: 8000 }
});
// Ensure only 1 record per user per day
dailyStepSchema.index({ email: 1, date: 1 }, { unique: true });
const DailyStep = mongoose.model('DailyStep', dailyStepSchema);

// In-memory store for OTPs (OTPs are temporary, so memory is fine)
const otpStore = new Map(); // email -> otp

// Setup Nodemailer with your personal Gmail account
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/auth/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP (expires in 5 mins)
    otpStore.set(email, { otp, expires: Date.now() + 5 * 60000 });

    try {
        let info = await transporter.sendMail({
            from: '"FitWit App" <smartlearners365@gmail.com>', // MUST match the auth user email above
            to: email,
            subject: 'Your FitWit Verification Code',
            text: `Your login code is: ${otp}`,
            html: `<b>Your login code is: <span style="font-size:24px; color:#1DB954;">${otp}</span></b>`
        });

        console.log(`\n=========================================`);
        console.log(`📨 GMAIL SENT TO: ${email}`);
        console.log(`🔑 OTP CODE: ${otp}`);
        console.log(`=========================================\n`);

        res.json({ success: true, message: 'Code sent successfully' });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({ error: 'Failed to send real email. Make sure you are only sending to your registered Resend email address!' });
    }
});

app.post('/api/auth/verify-code', async (req, res) => {
    const { email, code } = req.body;
    
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const storedData = otpStore.get(email);
    
    if (!storedData) {
        return res.status(400).json({ error: 'No code requested for this email' });
    }

    if (Date.now() > storedData.expires) {
        otpStore.delete(email);
        return res.status(400).json({ error: 'Code has expired' });
    }

    if (storedData.otp !== code) {
        return res.status(400).json({ error: 'Invalid code' });
    }

    // Success! Clear the OTP
    otpStore.delete(email);

    try {
        // Find or create user in MongoDB!
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
            await user.save();
            console.log(`👤 New user created in MongoDB: ${email}`);
        } else {
            console.log(`👋 Existing user logged in: ${email}`);
        }

        res.json({ success: true, user, message: 'Logged in successfully' });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 🔄 SYNC DAILY STEPS API
app.post('/api/steps/sync', async (req, res) => {
    const { email, date, steps, goal } = req.body;
    if (!email || !date) return res.status(400).json({ error: 'Email and date required' });
    
    try {
        // Upsert the step record (Update if exists, insert if new)
        await DailyStep.findOneAndUpdate(
            { email, date },
            { steps, goal },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: 'Steps synced successfully' });
    } catch (error) {
        console.error('Sync Error:', error);
        res.status(500).json({ error: 'Failed to sync steps' });
    }
});

// 📊 GET MONTHLY STEPS API
app.get('/api/steps/monthly', async (req, res) => {
    const { email, month } = req.query; // month format: 'YYYY-MM'
    if (!email || !month) return res.status(400).json({ error: 'Email and month required' });
    
    try {
        // Find all step records for this user in this month
        const records = await DailyStep.find({
            email,
            date: { $regex: `^${month}` } // Matches 'YYYY-MM-...'
        }).sort({ date: 1 });
        
        res.json({ success: true, data: records });
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch monthly data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 FitWit Backend running on http://localhost:${PORT}`);
});
