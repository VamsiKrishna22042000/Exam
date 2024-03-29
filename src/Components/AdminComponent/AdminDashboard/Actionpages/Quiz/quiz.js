// QuizPage.jsx
import React, { useState, useEffect } from "react";
import "./quiz.css"; // Update with your actual CSS file
import { TailSpin } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineClose } from "react-icons/ai";

const capitalizeFirstLetter = (string) => {
  if (typeof string !== "undefined" && string !== null) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  return "";
};

const QuizPage = () => {
  const [showUpdateContainer, setShowUpdateContainer] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [updateFormData, setUpdateFormData] = useState({
    name: "",
    description: "",
    key: "",
  });
  const [isUpdatingQuiz, setIsUpdatingQuiz] = useState(false);

  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContainer, setShowContainer] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    key: "",
  });
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);

  useEffect(() => {
    getAllQuiz();
  }, []);

  const getAllQuiz = () => {
    setQuizData([]);
    fetch("https://exam-back-end-2.vercel.app/admin/getAllQuizName")
      .then((response) => response.json())
      .then((data) => {
        setQuizData(data.data);
        setLoading(false);
        // Log the quiz data to the console
        console.log("Quiz Data:", data.data);
      })

      .catch((error) => {
        console.error("Error fetching quiz data:", error);
        setLoading(false);
      });
  };
  const handleUpdateQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setUpdateFormData({
      name: quiz.name,
      description: quiz.description,
      key: quiz.key,
    });
    setShowUpdateContainer(true);
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const getAdminIdFromCookie = () => {
    const cookieName = "jwt_AdminId";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${cookieName}=`)) {
        // Extract the adminId value from the cookie
        const adminId = cookie.substring(cookieName.length + 1);
        return adminId;
      }
    }

    // Return a default value or handle the case where the cookie is not found
    return null;
  };
  const getAdminTokenFromCookie = () => {
    const cookieName = "jwt_AdminToken";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${cookieName}=`)) {
        // Extract the token value from the cookie
        return cookie.substring(cookieName.length + 1);
      }
    }

    // Return a default value or handle the case where the cookie is not found
    return null;
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();

    if (
      !updateFormData.name ||
      !updateFormData.description ||
      !updateFormData.key
    ) {
      console.error("Updated Quiz name, description, and key are required");
      return;
    }

    // Disable the button to prevent multiple clicks
    setIsUpdatingQuiz(true);
    const adminId = getAdminIdFromCookie();
    const adminToken = getAdminTokenFromCookie();

    fetch(
      `https://exam-back-end-2.vercel.app/admin/updateQuiz/${selectedQuiz._id}/${adminId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(updateFormData),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Quiz updated successfully:", data);

       
        // Re-enable the button after a successful operation
        setIsUpdatingQuiz(false);

        
          handleUpdateContainerClose();
          getAllQuiz();
          toast.success("Quiz updated successfully");

        
      })
      .catch((error) => {
        console.error("Error updating Quiz:", error);

        toast.error("Error updating Quiz. Please try again.");

        // Re-enable the button after an error
        setIsUpdatingQuiz(false);
      });
  };

  const handleUpdateContainerClose = () => {
    setShowUpdateContainer(false);
    setSelectedQuiz(null);
    setUpdateFormData({
      name: "",
      description: "",
      key: "",
    });
    getAllQuiz();
  };

  const handleAddComponent = () => {
    setShowContainer(true);
    setFormData({
      name: "",
      description: "",
    });
  };

  const handleContainerClose = () => {
    setShowContainer(false);
    getAllQuiz();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.key) {
      console.error("Quiz name, description, and key are required");
      return;
    }

    // Disable the button to prevent multiple clicks
    setIsAddingQuiz(true);
    const adminId = getAdminIdFromCookie();
    const adminToken = getAdminTokenFromCookie();

    fetch(`https://exam-back-end-2.vercel.app/admin/addQuiz/${adminId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Quiz added successfully:", data);

      

        // Re-enable the button after a successful operation
        setIsAddingQuiz(false);

        handleContainerClose();
        getAllQuiz();
        toast.success("Quiz added successfully");
      })
      .catch((error) => {
        console.error("Error adding Quiz:", error);

        toast.error("Error adding Quiz. Please try again.");

        // Re-enable the button after an error
        setIsAddingQuiz(false);
      });
  };

  const handleDelete = async (quizId) => {
    try {
      console.log("Deleting quiz with ID:", quizId);

      const response = await fetch(
        `https://exam-back-end-2.vercel.app/admin/deleteQuiz/${quizId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        const data = await response.json();

        console.log("Quiz deleted successfully:", data);

        toast.success("Quiz deleted successfully");

        getAllQuiz();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="themain">
      
      <div className="QuizPage">
        {loading ? (
          <div className="loading-container">
            <TailSpin height={"10%"} width={"10%"} color={"#FFFFFF"} />
          </div>
        ) : (
          <div className="toping">
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <h2>Quiz Page</h2>
            <button
              type="button"
              className="addcomponentbutton"
              onClick={handleAddComponent}
            >
              Add Quiz
            </button>
          </div>
        )}
        <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
        {showContainer && (
          <>
           
            <div
              style={{
                position: "absolute",
                top: "10%",
                bottom: "0",
                left: "15%",
                right: "0",
                background: "#22222250",
              }}
            ></div>

            <div className="overlay" onClick={handleContainerClose}>
              <div
                className="containering"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="form" onSubmit={handleSubmit}>
                  <label htmlFor="name">Quiz Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <label htmlFor="description">Description:</label>
                  <textarea
                    rows={5}
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>

                  <label htmlFor="key">Key:</label>
                  <input
                    type="text"
                    id="key"
                    name="key"
                    value={formData.key}
                    onChange={handleChange}
                    required
                  />
                  <span
                    style={{
                      color: "red",
                      fontSize: "14px",
                      fontStyle: "italic",
                      marginBottom: "10px",
                    }}
                  >
                    The key should be unique. Don't give a key which is already
                    in use.
                  </span>

                  <button
                    type="submit"
                    className="submitbutton"
                    disabled={isAddingQuiz}
                  >
                    {isAddingQuiz ? <span>Adding...</span> : "Add Quiz"}
                  </button>
                  <button
                    type="button"
                    onClick={handleContainerClose}
                    className="close-button"
                  >
                    <AiOutlineClose />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
        {showUpdateContainer && selectedQuiz && (
          <>
            <div
              style={{
                position: "absolute",
                top: "10%",
                bottom: "0",
                left: "15%",
                right: "0",
                background: "#22222250",
              }}
            ></div>
            
            <div className="overlay" onClick={handleUpdateContainerClose}>
              <div
                className="containering"
                onClick={(e) => e.stopPropagation()}
              >
                <form className="form" onSubmit={handleUpdateSubmit}>
                  <label htmlFor="updateName">Quiz Name:</label>
                  <input
                    type="text"
                    id="updateName"
                    name="name"
                    value={updateFormData.name}
                    onChange={handleUpdateChange}
                    required
                  />

                  <label htmlFor="updateDescription">Description:</label>
                  <textarea
                    rows={5}
                    id="updateDescription"
                    name="description"
                    value={updateFormData.description}
                    onChange={handleUpdateChange}
                    required
                  ></textarea>

                  <label htmlFor="updateKey">Updated Key:</label>
                  <input
                    type="text"
                    id="updateKey"
                    name="key"
                    value={updateFormData.key}
                    onChange={handleUpdateChange}
                    required
                  />

                  <button
                    type="submit"
                    className="submitbutton"
                    disabled={isUpdatingQuiz}
                  >
                    {isUpdatingQuiz ? <span>Updating...</span> : "Update Quiz"}
                  </button>

                  <button
                    type="button"
                    onClick={handleUpdateContainerClose}
                    className="close-button"
                  >
                    <AiOutlineClose />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
        {loading ? (
          <div className="loading-container">
            <TailSpin height={"10%"} width={"10%"} color={"#ffffff"} />
          </div>
        ) : (
          <ul className="QuizList">
            {quizData.map((quiz) => (
              <li key={quiz._id} className="QuizItem">
                <div className="theDetails">
                  <div id="detail">
                    <strong>Quiz ID:</strong> &nbsp;{quiz._id}
                  </div>
                  <div id="detail">
                    <span className="QuizName">
                      <strong>Name:</strong>
                    </span>
                    &nbsp;
                    {capitalizeFirstLetter(quiz.name)}
                  </div>
                  <div id="detail">
                    <strong> Created At:</strong> &nbsp;
                    {new Date(quiz.createdAt).toLocaleString()}
                  </div>
                </div>
                <div id="detail">
                  <strong> Key:</strong> &nbsp;
                  {quiz.key}
                </div>

                {quiz.description && (
                  <div className="description">
                    <strong>Description:</strong> &nbsp;{quiz.description}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleUpdateQuiz(quiz)}
                  className="logoutbutton"
                >
                  Update Quiz
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
