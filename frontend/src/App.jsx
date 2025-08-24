import { useState, useEffect } from "react";
import { logHabit, getScore, plantTree } from "./services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./styles.css";

// Activities and tree options
const activities = [
  { activity: "Used reusable bottle", points: 10 },
  { activity: "Walked instead of car", points: 20 },
  { activity: "Recycled domestic waste", points: 15 },
  { activity: "Planted a seed in locality", points: 30 },
   { activity: "Turned Off AC", points: 5 },
  { activity: "Turned off lights when not needed", points: 5 },
  { activity: "Public Transport / Cycle", points: 10 },
];
const specialActivities = [
  { activity: "Fed stray animals", points: 50 },
  { activity: "Participated in area cleanup", points: 75 },
  { activity: "Beach Cleanup", points: 80 },
  { activity: "Recycled Electronics", points: 50 },
  { activity: "Cleaning water campaign", points: 75 },
  { activity: "Watered community plants", points: 60 },
  { activity: "Green Donation", points: 100 },
];


const treeTypes = ["Pine", "Oak", "Mango", "Lemon", "Sunflower","Lily", "Tulip", "Banana",  "Apple", "Lotus",  "Coconut", "Tangerine"];
const treeColors = ["#01be53ff", "#FFD700", "#FF7F50", "#c8ff50ff", "#ffeb50ff","#fcc6edff", "#fb58cdff", "#43f986ff", "#fe0404ff", "#6d82fbff", "#02fb3cff", "#ff7707ff",];

export default function App() {
  const [user] = useState("guest");
  const [habit, setHabit] = useState(activities[0].activity);
  const [score, setScore] = useState(0);
  const [trees, setTrees] = useState(0);
  const [treeBreakdown, setTreeBreakdown] = useState([]);
  const [selectedTree, setSelectedTree] = useState(treeTypes[0]);

  // Fetch user score + trees
async function fetchData() {
  const res = await getScore(user);
  console.log("Fetched Score:", res);  // <-- check in browser console
  if (res) {
    setScore(res.score);
    setTrees(res.trees);
    setTreeBreakdown(res.tree_breakdown || []);
  }
}



  // Log habit
async function handleHabit(activityObj) {
  const res = await logHabit(user, activityObj.activity); // correct
 // ✅ only send string
  if (res) {
    setScore(res.score);
    setTrees(res.trees);
    setTreeBreakdown(res.tree_breakdown ?? treeBreakdown);
  }
}






  // Plant tree (only if score >= 100)
  async function handlePlantTree() {
    if (score < 100) {
      alert("You need at least 100 points to plant a tree!");
      return;
    }
    await plantTree(user, selectedTree);
    setScore(score - 100); // deduct 100 pts
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
  <div className="app">
    <h1>🌍 GreenSteps – Eco Habit Tracker</h1>

    {/* Left Column */}
    <div className="left">
      {/* Eco Score Box */}
      <div className="card eco-score-box">
        <h2>🎯 Your Eco Score</h2>
        <p><b>Score:</b> {score}</p>
        <p><b>Trees Planted:</b> {trees}</p>

        {/* Pie Chart */}
        {treeBreakdown.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
  data={treeBreakdown.length ? treeBreakdown : [{ name: "No Trees", count: 1 }]}
  dataKey="count"
  nameKey="name"
  outerRadius={80}
  label
>
  {treeBreakdown.length
    ? treeBreakdown.map((entry, index) => (
        <Cell key={index} fill={treeColors[index % treeColors.length]} />
      ))
    : <Cell fill="#ccc" />}
</Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

{/* Plant a Tree Section */}
      <div className="card">
        <h2>🌳 Plant a Tree</h2>
        <div className="plant-tree">
          <select
            value={selectedTree}
            onChange={(e) => setSelectedTree(e.target.value)}
          >
            {treeTypes.map((t, i) => (
              <option key={i} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button onClick={handlePlantTree}>Plant Tree (100 pts)</button>
        </div>
      </div>

      {/* Log Habits */}
      <div className="card">
        <h2>✅ Log a Habit</h2>
        <div className="habits">
          {/* Regular Habits */}
          {activities.map((h) => (
  <button key={h.activity} onClick={() => handleHabit(h)}>
    {h.activity} (+{h.points})
  </button>
))}

          {/* Special Habits */}
          {specialActivities.map((s) => (
  <button key={s.activity} onClick={() => handleHabit(s)} className="special-habit">
    ⭐ {s.activity} (+{s.points})
  </button>
))}

        </div>
      </div>

      
    </div>

    {/* Right Column */}
    <div className="right">
<div className="card green-quotes">
  <h2>💡 GreenSteps Inspiration</h2>
  <ul>
    {[
      "🌱 Small steps today, greener world tomorrow.",
      "🌍 Every action counts – take your GreenSteps!",
      "🪴 Plant hope, grow change, one step at a time.",
      "♻️ Eco habits today, thriving planet tomorrow.",
      "💚 GreenSteps: where good deeds grow into forests."
    ].map((quote, i) => (
      <li key={i}>{quote}</li>
    ))}
  </ul>
</div>
 
      {/* Activity Points Board */}
      <div className="card">
        <h2>🪴 Activity Points Board</h2>
        <table className="points-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a, i) => (
              <tr key={i}>
                <td>{a.activity}</td>
                <td>+{a.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

      {/* Special Activities Section */}
      <div className="card">
        <h2>⭐ Special Activities</h2>
        <table className="special-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {specialActivities.map((s, i) => (
              <tr key={i}>
                <td>⭐ {s.activity}</td>
                <td>+{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
    </div>
  </div>
);
}
