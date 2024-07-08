import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://test3-99k4.onrender.com/",
  headers: {
    "Content-Type": "application/json",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});
