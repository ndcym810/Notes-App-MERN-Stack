import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/EmptyCard/EmptyCard";

const Home = () => {
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [notes, setNotes] = useState([]);

  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  const [inSearch, setInSearch] = useState(false);

  const [toast, setToast] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  // Check if user is authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login");
      return;
    }
    getUserInfo();
    getAllNotes();
  }, []);

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get all notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-notes");
      if (response.data && response.data.notes) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleEditNote = (note) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: note });
  };

  const deleteNote = async (note) => {
    const noteId = note._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        handleShowToast("Note deleted successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.error("An unexpected error occurred:", error);
      }
    }
  };

  const pinNote = async (note) => {
    const noteId = note._id;
    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + noteId,
        {
          isPinned: !note.isPinned,
        }
      );

      if (response.data && !response.data.error) {
        handleShowToast("Note pinned successfully", "pin");
        getAllNotes();
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleCloseModal = () => {
    setOpenAddEditModal({ isShown: false, type: "add", data: null });
  };

  const handleShowToast = (message, type) => {
    setToast({ isShown: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ isShown: false, message: "" });
  };

  const handleSearch = async (query) => {
    try {
      const response = await axiosInstance.get("/search-note", {
        params: { query },
      });
      if (response.data && response.data.notes) {
        setInSearch(true);
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
    }
  };

  const handleClearSearch = () => {
    setInSearch(false);
    getAllNotes();
  };

  return (
    <div>
      <Navbar
        userInfo={userInfo}
        onSearch={handleSearch}
        onClear={handleClearSearch}
      />
      <div className="container mx-auto px-4 py-8">
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={note.createdAt}
                content={note.content}
                tags={note.tags}
                isPinned={note.isPinned}
                onEdit={() => handleEditNote(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => pinNote(note)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard
            message={
              inSearch
                ? "No notes found"
                : "Start creating your first note! Click on the + button to create a new note."
            }
          />
        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({
            isShown: true,
            type: "add",
            data: null,
          });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
          },
          content: {
            width: "40%",
            maxHeight: "75vh",
            margin: "auto",
            marginTop: "3.5rem",
            padding: "1.25rem",
            borderRadius: "0.375rem",
            overflow: "auto",
          },
        }}
        contentLabel="Add/Edit Note"
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={handleCloseModal}
          getAllNotes={getAllNotes}
          handleShowToast={handleShowToast}
        />
      </Modal>
      <Toast
        isShown={toast.isShown}
        message={toast.message}
        type={toast.type}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default Home;
