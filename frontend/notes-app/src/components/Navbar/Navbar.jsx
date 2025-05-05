import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
const Navbar = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate;
  const handleLogout = () => {
    navigate("/login");
  };
  const handleSearch = () => {};
  const handleClear = () => {
    setSearch("");
  };
  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>
      <SearchBar
        value={search}
        onChange={({ target }) => {
          setSearch(target.value);
        }}
        handleSearch={handleSearch}
        handleClear={handleClear}
      />
      <ProfileInfo handleLogout={handleLogout} />
    </div>
  );
};

export default Navbar;
