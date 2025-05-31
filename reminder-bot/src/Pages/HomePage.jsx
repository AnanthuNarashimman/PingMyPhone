import { useState } from "react";
import '../Styles/PageStyles/HomePage.css';

function HomePage() {
  const [telegramId, setTelegramId] = useState("");
  const [task, setTask] = useState("");
  const [time, setTime] = useState("");

  const submit = async () => {
    await fetch("http://localhost:5000/add-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telegram_id: telegramId, task, time }),
    });
    alert("Reminder added!");
  };

  return (
    <div className="home-container">
      <h2>Telegram Reminder</h2>
      <input
        className="input-field"
        placeholder="Telegram Chat ID"
        onChange={(e) => setTelegramId(e.target.value)}
      /><br />
      <input
        className="input-field"
        placeholder="Task"
        onChange={(e) => setTask(e.target.value)}
      /><br />
      <input
        className="input-field"
        type="datetime-local"
        onChange={(e) => setTime(e.target.value.replace("T", " "))}
      /><br />
      <button className="submit-button" onClick={submit}>Set Reminder</button>
    </div>
  );
}

export default HomePage;
