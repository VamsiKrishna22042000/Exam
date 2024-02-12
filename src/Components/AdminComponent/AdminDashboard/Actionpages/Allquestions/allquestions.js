// QuestionsPage.jsx
import React, { useState, useEffect, useDeferredValue } from "react";
import { TailSpin } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineClose } from "react-icons/ai";
import "./allquestions.css";
import Pagination from "./pagination";

const QuestionsPage = () => {
  const [updatedFormData, setUpdatedFormData] = useState({});
  const handlePageChange = (pageNumber) => {
    const validPageNumber = isNaN(pageNumber) ? 1 : pageNumber;

    setCurrentPage(validPageNumber);
    setLoading(true);

    fetchQuestionsData(validPageNumber);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [questionsPerPage] = useState(10);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [showUpdateContainer, setShowUpdateContainer] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [selectedQuestionData, setSelectedQuestionData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: "",
    difficultyLevel: "",
  });

  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContainer, setShowContainer] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    difficultyLevel: "",
    categoryId: "",
    topicId: "",
    subtopicId: "",
    quizId: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    answer: "",
    description: "",
    type: "",
  });
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questionDetails, setQuestionDetails] = useState({});
  const [updateFormData, setupdateFormData] = useState({});
  useEffect(() => {
    fetchQuestionsData(currentPage);
  }, [updateFormData]);

  console.log("Current Page:", currentPage);
  console.log("Total Pages:", totalPages);

  useEffect(() => {
    fetchDropdownData();
  }, [updateFormData]);

  useEffect(() => {
    fetchQuestionsData(currentPage); // Call fetchQuestionsData with the initial currentPage value
  }, []); // Empty dependency array to ensure it runs only once on mount
  const handleUpdate = (question) => {
    setShowUpdateContainer(true);
    setSelectedQuestion(question);
    console.log(question);
    // Populate updatedFormData with existing details of the selected question
    setupdateFormData({
      type: question.type,
      description: question.description,
      selectedCategory: question.categoryId,
      selectedTopic: question.topicId,
      selectedSubtopic: question.subtopicId,
      selectedQuiz: question.quizId,
      question: question.question,
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
      answer: question.answer,
      difficultyLevel: question.difficultyLevel,
    });
  };
  useEffect(() => {
    if (selectedQuestion) {
      setUpdatedFormData({
        type: selectedQuestion.type,
        description: selectedQuestion.description || "",
        selectedCategory: selectedQuestion.categoryId || "",
        selectedTopic: selectedQuestion.topicId || "",
        selectedSubtopic: selectedQuestion.subtopicId || "",
        selectedQuiz: selectedQuestion.quizId || "",
        question: selectedQuestion.question || "",
        option1: selectedQuestion.option1 || "",
        option2: selectedQuestion.option2 || "",
        option3: selectedQuestion.option3 || "",
        option4: selectedQuestion.option4 || "",
        answer: selectedQuestion.answer || "",
        difficultyLevel: selectedQuestion.difficultyLevel || "",
      });
    }
  }, [selectedQuestion]);
  const handleCancelUpdate = () => {
    setShowUpdateContainer(false);
    setSelectedQuestion(null);
  };

  const handleUpdateSubmit = () => {
    if (selectedQuestionData && selectedQuestionData._id) {
      const { _id } = selectedQuestionData;

      const dataToSend = {
        ...updatedFormData,
        categoryId: updatedFormData.selectedCategory,
        topicId: updatedFormData.selectedTopic,
        subtopicId: updatedFormData.selectedSubtopic,
        quizId: updatedFormData.selectedQuiz,
      };

      fetch(`https://exam-back-end-2.vercel.app/admin/updateQuestions/${_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Question updated successfully:", data);
          toast.success("Question updated successfully");

          setTimeout(() => {
            handleCancelUpdate();
            fetchQuestionsData(currentPage);
          }, 3000);
        })
        .catch((error) => {
          console.error("Error updating question:", error);
          toast.error("Error updating question. Please try again.");
        });

      // Assuming setQuestionsData is a state updater function
      setQuestionsData((prevData) =>
        prevData.map((question) =>
          question._id === _id ? { ...question, ...dataToSend } : question
        )
      );

      setSelectedQuestionData(null);
    } else {
      console.error("Selected question data or _id is null.");
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;

    setSelectedCategory(value);
    setSelectedTopic("");
    setSelectedSubtopic("");
    setSelectedQuiz("");
  };

  const handleTopicChange = (e) => {
    const { value } = e.target;
    setSelectedTopic(value);
    setSelectedSubtopic("");
    setSelectedQuiz("");
  };

  const handleSubtopicChange = (e) => {
    const { value } = e.target;
    setSelectedSubtopic(value);
    setSelectedQuiz("");
  };

  const handleQuizChange = (e) => {
    const { value } = e.target;
    setSelectedQuiz(value);
  };

  const fetchQuestionsData = (pageNumber) => {
    fetch(
      `https://exam-back-end-2.vercel.app/admin/getAllQuestions?page=${pageNumber}`
    )
      .then((response) => response.json())
      .then((data) => {
        setQuestionsData(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(pageNumber);

        setLoading(false);

        const detailsMap = {};
        data.data.forEach((question) => {
          detailsMap[question._id] = question;
        });

        setQuestionDetails(detailsMap);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching questions data:", error);
        setLoading(false);
      });
  };

  const fetchDropdownData = () => {
    const baseApi = "https://exam-back-end-2.vercel.app/admin/";

    // Fetch categories
    fetch(`${baseApi}getAllCategory`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data.data);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    // Fetch topics
    fetch(`${baseApi}getAllTopics`)
      .then((response) => response.json())
      .then((data) => {
        setTopics(data.data);
      })
      .catch((error) => {
        console.error("Error fetching topics:", error);
      });

    // Fetch subtopics
    fetch(`${baseApi}getAllSubTopics`)
      .then((response) => response.json())
      .then((data) => {
        setSubtopics(data.data);
      })
      .catch((error) => {
        console.error("Error fetching subtopics:", error);
      });

    // Fetch quizzes
    fetch(`${baseApi}getAllQuizName`)
      .then((response) => response.json())
      .then((data) => {
        setQuizzes(data.data);
      })
      .catch((error) => {
        console.error("Error fetching quizzes:", error);
      });
  };

  const handleAddComponent = () => {
    setShowContainer(true);
  };

  const handleContainerClose = () => {
    setShowContainer(false);
  };
  useEffect(() => {
    if (selectedQuestion) {
      setUpdatedFormData({
        type: selectedQuestion.type,
        description: selectedQuestion.description || "",
        selectedCategory: selectedQuestion.categoryId || "",
        selectedTopic: selectedQuestion.topicId || "",
        selectedSubtopic: selectedQuestion.subtopicId || "",
        selectedQuiz: selectedQuestion.quizId || "",
        question: selectedQuestion.question || "",
        option1: selectedQuestion.option1 || "",
        option2: selectedQuestion.option2 || "",
        option3: selectedQuestion.option3 || "",
        option4: selectedQuestion.option4 || "",
        answer: selectedQuestion.answer || "",
        difficultyLevel: selectedQuestion.difficultyLevel || "",
      });
    }
  }, [selectedQuestion]);
  const handleChange = (e, isUpdated = false) => {
    const { name, value } = e.target;

    if (isUpdated) {
      setUpdatedFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Validate selectedYear for previousYear option
    if (name === "type" || name === "selectedYear") {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        selectedYear:
          value === "previousYear" && !formData.selectedYear
            ? "Please select a year for the Previous Year option"
            : "",
      }));
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;

    console.log(`Updating ${name} to ${value}`);

    setUpdatedFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "", // Clear validation error when the field is updated
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitButton = document.querySelector(".submitbutton");
    submitButton.setAttribute("disabled", "true");

    const errors = {};
    // ... (your existing validation logic)

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      submitButton.removeAttribute("disabled");
      return;
    }

    const dataToSend = {
      ...formData,
      categoryId: selectedCategory,
      topicId: selectedTopic,
      subtopicId: selectedSubtopic,
      quizId: selectedQuiz,
    };

    fetch("https://exam-back-end-2.vercel.app/admin/createQuestions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Question added successfully:", data);
        toast.success("Question added successfully");

        // Re-enable the button after successful submission

        setTimeout(() => {
          submitButton.removeAttribute("disabled");
          handleContainerClose();
          fetchQuestionsData(currentPage);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error adding question:", error);

        // Re-enable the button on error
        submitButton.removeAttribute("disabled");
        toast.error("Error adding question. Please try again.");
      });
  };

  const handleDelete = (question) => {
    const { _id } = question;

    fetch(`https://exam-back-end-2.vercel.app/admin/deleteQuestion/${_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Question deleted successfully:", data);
        toast.success("Question deleted successfully");
        fetchQuestionsData(currentPage);

        // After successful deletion, update your questions data
      })
      .catch((error) => {
        console.error("Error deleting question:", error);
        toast.error("Error deleting question. Please try again.");
      });
  };

  return (
    <div className="questions-page-container">

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
      {loading ? (
        <div className="loading-container">
          <TailSpin height={"10%"} width={"10%"} color={"#FFFFFF"} />
        </div>
      ) : (
        <div className="toping">
          <h2>Questions Page</h2>

          <button
            type="button"
            className="addcomponentbutton"
            onClick={handleAddComponent}
          >
            Add Question
          </button>
        </div>
      )}


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
          <div className="overlay" onClick={handleContainerClose}>
            <div className="containering" onClick={(e) => e.stopPropagation()}>
              <form className="form" onSubmit={handleSubmit}>
                <label htmlFor="type">Select Type:</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="currentAffair">Current Affair</option>
                  <option value="previousYear">Previous Year</option>
                  <option value="misc">Misc</option>
                </select>
                {validationErrors.type && (
                  <span className="error">{validationErrors.type}</span>
                )}
                {formData.type === "previousYear" && (
                  <>
                    <label htmlFor="selectedYear">Select Year:</label>
                    <select
                      id="selectedYear"
                      name="selectedYear"
                      value={formData.selectedYear}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a year</option>
                      {/* get all years from 50 yaers */}
                      {Array.from({ length: 21 }, (_, index) => {
                        const year = new Date().getFullYear() - index;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                    {validationErrors.selectedYear && (
                      <span className="error">
                        {validationErrors.selectedYear}
                      </span>
                    )}
                  </>
                )}
                <label htmlFor="description">Description:</label>
                <textarea
                  rows={3}
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {validationErrors.description && (
                  <span className="error">{validationErrors.description}</span>
                )}
                <label htmlFor="categoryId">Category:</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="topicId">Topic:</label>
                <select
                  id="topicId"
                  name="topicId"
                  value={selectedTopic}
                  onChange={handleTopicChange}
                  required={selectedCategory !== ""}
                >
                  <option value="">Select a topic</option>
                  {topics
                    .filter((topic) => topic.categoryId === selectedCategory)
                    .map((topic) => (
                      <option key={topic._id} value={topic._id}>
                        {topic.name}
                      </option>
                    ))}
                </select>
                <label htmlFor="subtopicId">Subtopic:</label>
                <select
                  id="subtopicId"
                  name="subtopicId"
                  value={selectedSubtopic}
                  onChange={handleSubtopicChange}
                  required={selectedTopic !== ""}
                >
                  <option value="">Select a subtopic</option>
                  {subtopics
                    .filter((subtopic) => subtopic.topicId === selectedTopic)
                    .map((subtopic) => (
                      <option key={subtopic._id} value={subtopic._id}>
                        {subtopic.name}
                      </option>
                    ))}
                </select>
                <label htmlFor="quizId">Quiz:</label>
                <select
                  id="quizId"
                  name="quizId"
                  value={selectedQuiz}
                  onChange={handleQuizChange}
                  required={selectedSubtopic !== ""}
                >
                  <option value="">Select a quiz</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id}>
                      {quiz.name}
                    </option>
                  ))}
                </select>
                <label htmlFor="question">Question:</label>
                <textarea
                  rows={5}
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                ></textarea>
                {validationErrors.question && (
                  <span className="error">{validationErrors.question}</span>
                )}
                <label htmlFor="option1">Option 1:</label>
                <input
                  type="text"
                  id="option1"
                  name="option1"
                  value={formData.option1}
                  onChange={handleChange}
                  required
                />
                {validationErrors.option1 && (
                  <span className="error">{validationErrors.option1}</span>
                )}
                <label htmlFor="option2">Option 2:</label>
                <input
                  type="text"
                  id="option2"
                  name="option2"
                  value={formData.option2}
                  onChange={handleChange}
                  required
                />
                {validationErrors.option2 && (
                  <span className="error">{validationErrors.option2}</span>
                )}
                <label htmlFor="option3">Option 3:</label>
                <input
                  type="text"
                  id="option3"
                  name="option3"
                  value={formData.option3}
                  onChange={handleChange}
                  required
                />
                {validationErrors.option3 && (
                  <span className="error">{validationErrors.option3}</span>
                )}
                <label htmlFor="option4">Option 4:</label>
                <input
                  type="text"
                  id="option4"
                  name="option4"
                  value={formData.option4}
                  onChange={handleChange}
                  required
                />
                {validationErrors.option4 && (
                  <span className="error">{validationErrors.option4}</span>
                )}
                <label htmlFor="answer">Correct Answer:</label>
                <select
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select correct answer</option>
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                  <option value="option3">Option 3</option>
                  <option value="option4">Option 4</option>
                </select>
                {validationErrors.correctAnswer && (
                  <span className="error">
                    {validationErrors.correctAnswer}
                  </span>
                )}
                <label htmlFor="difficultyLevel">Difficulty Level:</label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select difficulty level</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="veryHard">Very Hard</option>
                </select>
                {validationErrors.difficultyLevel && (
                  <span className="error">
                    {validationErrors.difficultyLevel}
                  </span>
                )}
                <button type="submit" className="submitbutton">
                  Add Question
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
      {loading ? (
        <div className="loading-container">
          <TailSpin height={"10%"} width={"10%"} color={"#FFFFFF"} />
        </div>
      ) : (
        <ul className="QuestionsList">
          {questionsData.map((question) => (
            <li key={question._id} className="QuestionItem">
              <div className="question-details">
                <div id="detail">
                  <strong>ID:</strong> &nbsp;{question._id}
                </div>

                <div id="detail">
                  <strong> Category ID:</strong> &nbsp;{question.categoryId}
                </div>
                <div id="detail">
                  <strong> Topic ID:</strong> &nbsp;{question.topicId}
                </div>
                <div id="detail">
                  <strong> Quiz ID:</strong> &nbsp;{question.quizId}
                </div>
                <div id="detail">
                  <strong> Created At:</strong> &nbsp;
                  {new Date(question.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="rightsidedetails">
                <div id="detail">
                  <span className="QuestionName">
                    <strong>Question:</strong>
                  </span>
                  &nbsp;
                  {question.question}
                </div>
                <div className="question-answer">
                  <strong>Difficulty Level :</strong> &nbsp;
                  {question.difficultyLevel}
                </div>
                <div className="question-options">
                  <div id="option">Option 1: {question.option1}</div>
                  <div id="option">Option 2: {question.option2}</div>
                  <div id="option">Option 3: {question.option3}</div>
                  <div id="option">Option 4: {question.option4}</div>
                </div>
                <div className="question-answer">
                  <strong>Correct Answer:</strong> &nbsp;{question.answer}
                </div>
                {question.description && (
                  <div className="question-description">
                    <strong>Description:</strong> &nbsp;{question.description}
                  </div>
                )}
              </div>
              <div className="buttonsspace">
                <button
                  type="submit"
                  className="delete-button"
                  onClick={() => {
                    handleUpdate(question);
                  }}
                >
                  Update
                </button>
                <button
                  type="submit"
                  className="delete-button"
                  onClick={() => {
                    handleDelete(question);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {loading ? (
        <div className="loading-container">
          <TailSpin height={"10%"} width={"10%"} color={"#FFFFFF"} />
        </div>
      ) : (
        totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )
      )}

      {showUpdateContainer && selectedQuestion && (
        <div className="overlay" onClick={handleContainerClose}>
          <div className="update-details-container">
            <form
              className="update-details-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateSubmit(updatedFormData);
              }}
            >
              <label htmlFor="type">Select Type:</label>
              <select
                id="type"
                name="type"
                value={updatedFormData.type}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Select</option>
                <option value="currentAffair">Current Affair</option>
                <option value="previousYear">Previous Year</option>
                <option value="misc">Misc</option>
              </select>
              {validationErrors.type && (
                <span className="error">{validationErrors.type}</span>
              )}

              <label htmlFor="description">Description:</label>
              <textarea
                rows={3}
                id="description"
                name="description"
                value={updatedFormData.description}
                onChange={handleUpdateChange}
              />
              {validationErrors.description && (
                <span className="error">{validationErrors.description}</span>
              )}

              <label htmlFor="categoryId">Category:</label>
              <select
                id="categoryId"
                name="categoryId"
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <label htmlFor="topicId">Topic:</label>
              <select
                id="topicId"
                name="topicId"
                value={selectedTopic}
                onChange={handleTopicChange}
                required={selectedCategory !== ""}
              >
                <option value="">Select a topic</option>
                {topics
                  .filter((topic) => topic.categoryId === selectedCategory)
                  .map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.name}
                    </option>
                  ))}
              </select>

              <label htmlFor="subtopicId">Subtopic:</label>
              <select
                id="subtopicId"
                name="subtopicId"
                value={selectedSubtopic}
                onChange={handleSubtopicChange}
                required={selectedTopic !== ""}
              >
                <option value="">Select a subtopic</option>
                {subtopics
                  .filter((subtopic) => subtopic.topicId === selectedTopic)
                  .map((subtopic) => (
                    <option key={subtopic._id} value={subtopic._id}>
                      {subtopic.name}
                    </option>
                  ))}
              </select>

              <label htmlFor="quizId">Quiz:</label>
              <select
                id="quizId"
                name="quizId"
                value={selectedQuiz}
                onChange={handleQuizChange}
                required={selectedSubtopic !== ""}
              >
                <option value="">Select a quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.name}
                  </option>
                ))}
              </select>

              <label htmlFor="question">Question:</label>
              <textarea
                rows={5}
                id="question"
                name="question"
                value={updatedFormData.question}
                onChange={handleUpdateChange}
                required
              ></textarea>
              {validationErrors.question && (
                <span className="error">{validationErrors.question}</span>
              )}

              <label htmlFor="option1">Option 1:</label>
              <input
                type="text"
                id="option1"
                name="option1"
                value={updatedFormData.option1}
                onChange={handleUpdateChange}
                required
              />
              {validationErrors.option1 && (
                <span className="error">{validationErrors.option1}</span>
              )}

              <label htmlFor="option2">Option 2:</label>
              <input
                type="text"
                id="option2"
                name="option2"
                value={updatedFormData.option2}
                onChange={handleUpdateChange}
                required
              />
              {validationErrors.option2 && (
                <span className="error">{validationErrors.option2}</span>
              )}

              <label htmlFor="option3">Option 3:</label>
              <input
                type="text"
                id="option3"
                name="option3"
                value={updatedFormData.option3}
                onChange={handleUpdateChange}
                required
              />
              {validationErrors.option3 && (
                <span className="error">{validationErrors.option3}</span>
              )}

              <label htmlFor="option4">Option 4:</label>
              <input
                type="text"
                id="option4"
                name="option4"
                value={updatedFormData.option4}
                onChange={handleUpdateChange}
                required
              />
              {validationErrors.option4 && (
                <span className="error">{validationErrors.option4}</span>
              )}

              <label htmlFor="answer">Correct Answer:</label>
              <select
                id="answer"
                name="answer"
                value={updatedFormData.answer}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Select correct answer</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
                <option value="option4">Option 4</option>
              </select>
              {validationErrors.correctAnswer && (
                <span className="error">{validationErrors.correctAnswer}</span>
              )}
              <label htmlFor="difficultyLevel">Difficulty Level:</label>
              <select
                id="difficultyLevel"
                name="difficultyLevel"
                value={updatedFormData.difficultyLevel}
                onChange={handleUpdateChange}
                required
              >
                <option value="">Select difficulty level</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="veryHard">Very Hard</option>
              </select>
              {validationErrors.difficultyLevel && (
                <span className="error">
                  {validationErrors.difficultyLevel}
                </span>
              )}

              <button
                type="submit"
                className="update-submit-button"
                onClick={() => handleUpdateSubmit(updatedFormData)}
              >
                Update Question
              </button>
              <button
                type="button"
                onClick={handleCancelUpdate}
                className="update-cancel-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCancelUpdate}
                className="close-button"
              >
                <AiOutlineClose />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;
