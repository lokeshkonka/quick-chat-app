import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

function LoginPage() {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmithandler = (event) => {
    event.preventDefault();

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const credentials =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };

    login(currState === "Sign up" ? "signup" : "login", credentials);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col p-4">
      {/* Logo */}
      <img
        src={assets.logo_big}
        alt="logo"
        className="w-[min(30vw,250px)] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
      />

      {/* Auth Form */}
      <form
        onSubmit={onSubmithandler}
        className="backdrop-blur-2xl bg-black/40 border border-blue-400/20 shadow-lg shadow-blue-900/30 p-6 flex flex-col gap-6 rounded-2xl w-[min(90vw,400px)] text-white"
      >
        <h2 className="font-semibold text-2xl flex justify-between items-center text-blue-300">
          {currState}
          {isDataSubmitted && currState === "Sign up" && (
            <img
              onClick={() => setIsDataSubmitted(false)}
              src={assets.arrow_icon}
              alt="back"
              className="w-5 cursor-pointer hover:scale-110 transition"
            />
          )}
        </h2>

        {/* Step 1: Full Name */}
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            placeholder="Full Name"
            required
            className="p-2 rounded-md bg-black/30 border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-200/50"
          />
        )}

        {/* Step 1: Email & Password */}
        {!isDataSubmitted && (
          <>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              placeholder="Email Address"
              required
              className="p-2 rounded-md bg-black/30 border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-200/50"
            />
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
              required
              className="p-2 rounded-md bg-black/30 border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-200/50"
            />
          </>
        )}

        {/* Step 2: Bio */}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={4}
            placeholder="Provide bio for your profile..."
            required
            className="p-2 rounded-md bg-black/30 border border-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-200/50"
          ></textarea>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 transition text-white rounded-md shadow-md shadow-blue-900/50"
        >
          {currState === "Sign up"
            ? isDataSubmitted
              ? "Submit Bio"
              : "Create Account"
            : "Login Now"}
        </button>

        {/* Terms */}
        {currState === "Sign up" && (
          <div className="flex items-center gap-2 text-sm text-blue-200/70">
            <input type="checkbox" required />
            <p>Agree to the terms and conditions</p>
          </div>
        )}

        {/* Switch Mode */}
        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-blue-200/70">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-blue-400 cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          ) : (
            <p className="text-sm text-blue-200/70">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setCurrState("Sign up");
                  setIsDataSubmitted(false);
                }}
                className="font-medium text-blue-400 cursor-pointer hover:underline"
              >
                Sign up here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
