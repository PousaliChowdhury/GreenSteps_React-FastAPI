import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // backend URL
});

export const logHabit = async (user, activity) => {
  const res = await API.post("/log", { user, activity }); // ✅ must match backend
  return res.data;
};


export async function getScore(user) {
  try {
    const res = await API.get(`/score/${user}`);
    return res.data;
  } catch (err) {
    console.error("Error fetching score:", err);
    return { score: 0, trees: 0, tree_breakdown: [] };
  }
}

export async function plantTree(user, tree) {
  try {
    const res = await API.post("/plant", { user, tree });
    return res.data;
  } catch (err) {
    console.error("Error planting tree:", err);
    return null;
  }
}
