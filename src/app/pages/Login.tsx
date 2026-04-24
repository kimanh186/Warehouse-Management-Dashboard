import { useState } from "react";
import { login } from "../../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login(username, password);

      localStorage.setItem("token", res.token);
      localStorage.setItem("username", res.username);

      window.location.href = "/";
    } catch {
      alert("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-80 border">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Đăng nhập
        </h2>

        <input
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}