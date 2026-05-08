const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'jobs.json');

const readJobs = () => {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeJobs = (jobs) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(jobs, null, 2));
};

app.get('/jobs', (req, res) => {
  res.json(readJobs());
});

app.post('/jobs', (req, res) => {
  const jobs = readJobs();
  const newJob = {
    id: Date.now(),
    company: req.body.company,
    role: req.body.role,
    status: req.body.status || 'Applied',
    notes: req.body.notes || '',
    date: new Date().toISOString().split('T')[0]
  };
  jobs.push(newJob);
  writeJobs(jobs);
  res.json(newJob);
});

app.put('/jobs/:id', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find(j => j.id == req.params.id);
  if (job) job.status = req.body.status;
  writeJobs(jobs);
  res.json({ success: true });
});

app.delete('/jobs/:id', (req, res) => {
  let jobs = readJobs();
  jobs = jobs.filter(j => j.id != req.params.id);
  writeJobs(jobs);
  res.json({ success: true });
});

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));