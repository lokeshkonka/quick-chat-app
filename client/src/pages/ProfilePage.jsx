import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

function ProfilePage() {
  const { authUser, updateProfile } = useContext(AuthContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser.fullName);
  const [bio, setBio] = useState(authUser.bio);
  const navigate = useNavigate();

  const profilePreview = selectedImg
    ? URL.createObjectURL(selectedImg)
    : authUser.profilePic || null;

  const initials = (authUser.fullName || "User")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({ profilePic: base64Image, fullName: name, bio });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-blue-950 to-black flex items-center justify-center p-6">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl bg-black/40 border border-blue-400/30 rounded-2xl flex items-center justify-between max-sm:flex-col-reverse text-blue-200 shadow-lg shadow-blue-900/40">
        
        {/* ====== Form Section ====== */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-10 flex-1">
          <h3 className="text-lg font-semibold text-blue-300">Profile Details</h3>

          {/* Avatar Upload */}
          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer text-blue-200 hover:text-blue-400 transition">
            <input
              onChange={(e) => setSelectedImg(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="Avatar"
                className="w-12 h-12 object-cover rounded-full ring-2 ring-blue-500/50 shadow-md shadow-blue-900/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-full ring-2 ring-blue-500/50 shadow-md shadow-blue-900/40 bg-linear-to-br from-blue-600/60 to-cyan-400/40 flex items-center justify-center text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            Upload Profile Image
          </label>

          {/* Name Input */}
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="p-2 rounded-md bg-black/30 border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-300 text-blue-200"
            type="text"
            required
            placeholder="Your Name"
          />

          {/* Bio Textarea */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
            className="p-2 rounded-md bg-black/30 border border-blue-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-300 text-blue-200"
            rows={4}
          ></textarea>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-linear-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white p-3 rounded-full text-lg cursor-pointer shadow-md shadow-blue-900/50 transition"
          >
            Save
          </button>
        </form>

        {/* ====== Logo Section ====== */}
        <img
          className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ring-2 ring-blue-500/40 shadow-lg shadow-blue-900/40 ${
            selectedImg ? "rounded-full" : ""
          }`}
          src={authUser.profilePic || assets.logo_icon}
          alt="Logo"
        />
      </div>
    </div>
  );
}

export default ProfilePage;
