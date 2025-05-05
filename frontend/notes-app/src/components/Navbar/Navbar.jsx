import React, { useState } from "react";
import ProfileInfo from "../Cards/ProfileInfo";
import { useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";

const Navbar = ({ userInfo, onSearch, onClear }) => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    onSearch(search);
  };
  const handleClear = () => {
    setSearch("");
    onClear();
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
      <ProfileInfo userInfo={userInfo} handleLogout={handleLogout} />
    </div>
  );
};

export default Navbar;
