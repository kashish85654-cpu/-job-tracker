import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", role: "", status: "Applied", notes: "" });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/jobs");
      setJobs(res.data);
    } catch(err) {
      console.log("Error fetching jobs:", err.message);
    }
  };

  const addJob = async () => {
    if (!form.company || !form.role) return alert("Please fill Company and Role!");
    try {
      await axios.post("http://localhost:5000/jobs", form);
      setForm({ company: "", role: "", status: "Applied", notes: "" });
      fetchJobs();
    } catch(err) {
      alert("Error adding job: " + err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/jobs/${id}`, { status });
      fetchJobs();
    } catch(err) {
      alert("Error updating: " + err.message);
    }
  };

  const deleteJob = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/jobs/${id}`);
      fetchJobs();
    } catch(err) {
      alert("Error deleting: " + err.message);
    }
  };

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s] = jobs.filter((j) => j.status === s);
    return acc;
  }, {});

  return (
    <div className="app">
      <h1>🗂️ Job Application Tracker</h1>

      <div className="form">
        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button onClick={addJob}>+ Add Job</button>
      </div>

      <div className="board">
        {STATUSES.map((status) => (
          <div className="column" key={status}>
            <h2>{status} <span>{grouped[status].length}</span></h2>
            {grouped[status].map((job) => (
              <div className="card" key={job.id}>
                <h3>{job.company}</h3>
                <p>{job.role}</p>
                {job.notes && <p className="notes">{job.notes}</p>}
                <p className="date">{job.date}</p>
                <select
                  value={job.status}
                  onChange={(e) => updateStatus(job.id, e.target.value)}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className="del" onClick={() => deleteJob(job.id)}>🗑️ Delete</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;