// frontend/App.jsx
import { useEffect, useRef, useState } from "react";
import {
  login,
  setToken,
  getToken,
  clearToken,
  voiceProposeTask,
  createTask,
  listTasks,
  updateTaskStatus,
  listAudit,
} from "./api";

function Login({ onLoggedIn }) {
  const [email, setEmail] = useState("admin@cook.test");
  const [password, setPassword] = useState("admin123!");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await login(email, password);
      setToken(data.token);
      onLoggedIn(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 420, margin: "40px auto" }}>
      <h1>SaaS Compta AI</h1>
      <p style={{ color: "#666" }}>Connexion (MVP)</p>

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
        />
        <button disabled={busy}>{busy ? "..." : "Se connecter"}</button>
        {error && <div style={{ color: "crimson" }}>Erreur: {error}</div>}
      </form>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  // audio
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // proposal
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("GREEN");

  // tasks
  const [tasks, setTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("ALL"); // Sprint 2.2 C
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // audit (Sprint 2.1 B)
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    const t = getToken();
    if (t) setUser({}); // minimal gate
  }, []);

  async function refreshTasks() {
    try {
      const data = await listTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }

  async function refreshAudit() {
    try {
      const data = await listAudit();
      setAudit(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (user) {
      refreshTasks();
      refreshAudit();
    }
  }, [user]);

  async function startRecording() {
    setError("");
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setSelectedFile(file);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch {
      setError("Microphone inaccessible. Autorise le micro.");
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") mr.stop();
    setIsRecording(false);
  }

  async function handlePropose() {
    setBusy(true);
    setError("");
    try {
      const data = await voiceProposeTask(selectedFile);
      setTranscript(data.transcript || "");
      setTitle(data.proposal?.title || "");
      setDescription(data.proposal?.description || "");
      setPriority(data.proposal?.priority || "GREEN");
      await refreshAudit();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateTask() {
    setBusy(true);
    setError("");
    try {
      await createTask({ title, description, priority });
      await refreshTasks();
      await refreshAudit();

      // reset MVP
      setTitle("");
      setDescription("");
      setPriority("GREEN");
      setTranscript("");
      setSelectedFile(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleStatus(task) {
    setBusy(true);
    setError("");
    try {
      const next = task.status === "DONE" ? "TODO" : "DONE";
      await updateTaskStatus(task.id, next);
      await refreshTasks();
      await refreshAudit();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  // Sprint 2.2 (C): filtre + split TODO/DONE
  const filteredTasks = tasks.filter((t) =>
    priorityFilter === "ALL" ? true : t.priority === priorityFilter
  );
  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");

  if (!user) return <Login onLoggedIn={setUser} />;

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>SaaS Compta AI — Sprint 2 UI (MVP)</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <p style={{ color: "#444" }}>IA = assistant. Elle propose, tu valides.</p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>1) Audio → Proposition</h2>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <button onClick={startRecording} disabled={isRecording || busy}>🎙️ Record</button>
            <button onClick={stopRecording} disabled={!isRecording || busy}>⏹ Stop</button>

            <label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>

            <button onClick={handlePropose} disabled={!selectedFile || busy}>
              {busy ? "..." : "Proposer une tâche"}
            </button>
          </div>

          <div style={{ fontSize: 12, color: "#666" }}>
            Fichier sélectionné : {selectedFile ? selectedFile.name : "aucun"}
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Transcript</label>
            <textarea value={transcript} readOnly rows={3} style={{ width: "100%", padding: 8 }} />
          </div>

          {error && <div style={{ marginTop: 12, color: "crimson" }}>Erreur: {error}</div>}
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>2) Validation → Création tâche</h2>

          <label style={{ display: "block", marginBottom: 8 }}>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 8 }}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            />
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 6 }}
            >
              <option value="GREEN">GREEN</option>
              <option value="ORANGE">ORANGE</option>
              <option value="RED">RED</option>
            </select>
          </label>

          <button onClick={handleCreateTask} disabled={!title.trim() || busy}>
            {busy ? "..." : "Créer la tâche (humain valide)"}
          </button>
        </div>
      </div>

      {/* ✅ Sprint 2.2 C: tâches */}
      <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>Tâches</h2>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="ALL">Toutes priorités</option>
              <option value="RED">RED</option>
              <option value="ORANGE">ORANGE</option>
              <option value="GREEN">GREEN</option>
            </select>

            <button onClick={refreshTasks} disabled={busy}>Rafraîchir</button>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "10px 0" }}>À faire</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {todoTasks.length ? todoTasks.map((t) => (
              <div key={t.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <strong>{t.title}</strong>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>status: {t.status}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{t.priority}</span>
                    <button onClick={() => handleToggleStatus(t)} disabled={busy}>✅ Done</button>
                  </div>
                </div>

                <div style={{ color: "#555", marginTop: 6 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                  created_by: {t.created_by}
                </div>
              </div>
            )) : (
              <div style={{ color: "#666" }}>Aucune tâche à faire</div>
            )}
          </div>

          <h3 style={{ margin: "18px 0 10px" }}>Terminées</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {doneTasks.length ? doneTasks.map((t) => (
              <div
                key={t.id}
                style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, opacity: 0.7 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <div>
                    <strong style={{ textDecoration: "line-through" }}>{t.title}</strong>
                    <div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>status: {t.status}</div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{t.priority}</span>
                    <button onClick={() => handleToggleStatus(t)} disabled={busy}>↩️ Reopen</button>
                  </div>
                </div>

                <div style={{ color: "#555", marginTop: 6 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                  created_by: {t.created_by}
                </div>
              </div>
            )) : (
              <div style={{ color: "#666" }}>Aucune tâche terminée</div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Sprint 2.1 B: audit lisible */}
      <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Audit (dernières actions)</h2>
          <button onClick={refreshAudit} disabled={busy}>Rafraîchir</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {audit.length ? (
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Quand</th>
                  <th align="left">Action</th>
                  <th align="left">Acteur</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                    <td>{new Date(a.created_at).toLocaleString()}</td>
                    <td>{a.action}</td>
                    <td style={{ fontSize: 11, color: "#666" }}>{a.actor_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ color: "#666" }}>Aucune action auditée</div>
          )}
        </div>
      </div>
    </div>
  );
}
