const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const User = require('./models/User');
        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin user found:', admin.email, admin.collegeId);

        const axios = require('axios');
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: admin._id, role: admin.role, collegeId: admin.collegeId }, process.env.JWT_SECRET, { expiresIn: '7d' });

        const urls = [
            '/api/admin/applications',
            '/api/admin/opportunities',
            '/api/admin/pending-drives',
            '/api/admin/placement/recruiters'
        ];

        for (let url of urls) {
            try {
                const res = await axios.get('http://localhost:5000' + url, { headers: { Authorization: 'Bearer ' + token } });
                console.log(url, 'SUCCESS', res.data.length, 'records');
            } catch (err) {
                console.log(url, 'FAILED', err.response?.status, err.response?.data?.message || err.message);
            }
        }

    } catch (err) {
        console.log('Error:', err);
    }
    process.exit(0);
});
