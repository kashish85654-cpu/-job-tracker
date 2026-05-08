const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');

const app = express();
const db = new Database('jobs.db');

app.use(cors());
app.use(express.json());

// Create table
db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'Applied',
    date TEXT DEFAULT CURRENT_DATE,
    notes TEXT
  )
`);

// Get all jobs
app.get('/jobs', (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs').all();
  res.json(jobs);
});

// Add job
app.post('/jobs', (req, res) => {
  const { company, role, status, notes } = req.body;
  const stmt = db.prepare('INSERT INTO jobs (company, role, status, notes) VALUES (?, ?, ?, ?)');
  const result = stmt.run(company, role, status || 'Applied', notes || '');
  res.json({ id: result.lastInsertRowid, company, role, status, notes });
});

// Update status
app.put('/jobs/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// Delete job
app.delete('/jobs/:id', (req, res) => {
  db.prepare('DELETE FROM jobs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => console.log('Server running on port 5000'));