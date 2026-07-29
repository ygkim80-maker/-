require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');

const adminRoutes = require('./src/routes/admin');
const customerRoutes = require('./src/routes/customer');
const scheduler = require('./src/services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/customer', customerRoutes);

app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.use('/r', express.static(path.join(__dirname, 'public', 'customer')));
app.get('/r/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer', 'index.html'));
});

app.get('/', (req, res) => res.redirect('/admin'));

app.listen(PORT, () => {
  console.log(`카드 재배송 자동안내 시스템 실행 중: http://localhost:${PORT}/admin`);
  scheduler.start();
});
