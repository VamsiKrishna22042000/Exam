import { useEffect, useState } from "react";

import Cookies from "js-cookie";

import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";

import { Hourglass } from "react-loader-spinner";

import {
  useParams,
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";

import "./mcqcurrentaffairs.css";

const MCQCurrentAffairs = () => {
  const params = useParams();
  const location = useLocation();

  const [currentQuestion, setCurrent] = useState("");
  const [mcqquestions, setQuestions] = useState(() => {
    return [];
  });
  const [allQuestion, setAllQuestions] = useState(() => {
    return [];
  });
  const [submitted, setSubmitted] = useState("");
  const [showResults, setResults] = useState(false);
  const [totalCount, setCount] = useState(0);

  const [totalQuestions, setTotalQuestion] = useState(0);
  const [load, setLoad] = useState(true);
  const [load2, setLoad2] = useState(false);
  const [page, setPage] = useState(1);
  const history = useHistory();

  useEffect(() => {
    const evTypep = window.performance.getEntriesByType("navigation")[0].type;
    if (evTypep === "reload" || evTypep === "back_forward") {
      window.location.replace("/");
    }
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const objectString = queryParams.get("data");
    if (objectString) {
      const myObject = JSON.parse(decodeURIComponent(objectString));
      setCount(myObject.length);
      setQuestions(myObject);
      setCurrent(1);
      setTotalQuestion(1);
      setLoad(false);
      setLoad2(true);
      const element = document.getElementById("scrollToStart");
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, [location.search, page]);

  const Results = () => {
    const [data, setData] = useState([
      { name: "Correct", value: 0 },
      { name: "Wrong", value: 0 },
    ]);
    useEffect(() => {
      const updatedData = allQuestion.reduce(
        (acc, each) => {
          if (each.answered === each[each.answer]) {
            acc[0].value += 1; // Increment 'Correct' value
          } else {
            acc[1].value += 1; // Increment 'Wrong' value
          }
          return acc;
        },
        [...data] // Use a copy of the existing data to ensure immutability
      );
      updatedData.push({ name: "Attempted", value: allQuestion.length });
      updatedData.push({
        name: "Not Attempted",
        value: totalCount - allQuestion.length,
      });
      setData(updatedData);
      addingResultsToLeaderBoard(data[0].value * 2 - data[0].value * 0.5);
    }, []);
    const addingResultsToLeaderBoard = async (marks) => {
      try {
        const url = `https://exam-back-end.vercel.appadmin/createLeaderBoard`;
        const reqConfigure = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mockId: params.id,
            userId: Cookies.get("jwt_userID"),
            totalMark: marks,
          }),
        };
        await fetch(url, reqConfigure);
      } catch (error) {
        console.error(error);
      }
    };
    const COLORS = ["#00C49F", "#cc0000", "#FFBB28", "#598BAF"];
    return (
      <>
        <div className="submitBackground"></div>
        <div className="results">
          <h1>Results</h1>
          <ResponsiveContainer width="50%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx={200}
                cy={200}
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="results-sub">
            {data.map((each) => (
              <p>
                {each.name === "Correct" ? (
                  <span style={{ backgroundColor: COLORS[0] }}></span>
                ) : each.name === "Wrong" ? (
                  <span style={{ backgroundColor: COLORS[1] }}></span>
                ) : each.name === "Attempted" ? (
                  <span style={{ backgroundColor: COLORS[2] }}></span>
                ) : (
                  each.name === "Not Attempted" && (
                    <span style={{ backgroundColor: COLORS[3] }}></span>
                  )
                )}
                {each.name} - {each.value}
              </p>
            ))}
            <p style={{ fontWeight: "bolder", marginTop: "5%" }}>
              Total Marks - {totalCount * 2}&nbsp; &nbsp; ObtainedMarks -{" "}
              {data[0].value * 2 - data[0].value * 0.5}
            </p>
            <button
              onClick={() => {
                history.push("/");
              }}
              className="cls"
              type="button"
            >
              Go To Home Page
            </button>
          </div>
        </div>
      </>
    );
  };
  const SubmitExam = () => {
    return (
      <>
        <div className="submitBackground"></div>
        <div className="submitExam">
          <h1 style={{ fontSize: "3rem" }}>{submitted}</h1>
          <button
            onClick={() => {
              setResults(true);
            }}
            className="submit"
            type="button"
          >
            Submit
          </button>
          <button
            id="close"
            className="close"
            onClick={() => {
              setSubmitted("");
            }}
            type="button"
          >
            Close
          </button>
        </div>
      </>
    );
  };
  const handleAns = (id, ans, ea) => {
    const answeredArr = mcqquestions.map((each) =>
      each._id === id ? { ...each, answered: ans } : each
    );
    let match = false;
    let changedArr = [];
    allQuestion.map((each) => {
      if (each._id === id) {
        changedArr.push({ ...each, answered: ans });
        match = true;
      } else {
        changedArr.push(each);
      }
    });
    setQuestions(answeredArr);
    setAllQuestions(
      match === true ? changedArr : [...changedArr, { ...ea, answered: ans }]
    );
  };
  return (
    <>
      {submitted !== "" && <SubmitExam />}
      {showResults === true && <Results />}
      <div id="scrollToStart"></div>
      {!load ? (
        <div className="mcq-con">
          <h1 style={{ marginBottom: "5" }}>Current Affairs</h1>

          {mcqquestions.length > 0 && (
            <div className="questions-box">
              {mcqquestions.map((each) => (
                <div key={each._id}>
                  <h3>Q. {each.question}</h3>
                  <div className="options">
                    <div>
                      <input
                        style={{ cursor: "pointer" }}
                        type="radio"
                        id="radio1"
                        name={each._id}
                        value={each.answered}
                        checked={each.answered === each.option1}
                        onChange={() => {
                          handleAns(each._id, each.option1, each);
                        }}
                      />
                      <p>{each.option1}</p>
                    </div>
                    <div>
                      <input
                        style={{ cursor: "pointer" }}
                        type="radio"
                        id="radio2"
                        name={each._id}
                        value={each.answered}
                        checked={each.answered === each.option2}
                        onChange={() => {
                          handleAns(each._id, each.option2, each);
                        }}
                      />
                      <p>{each.option2}</p>
                    </div>
                    <div>
                      <input
                        style={{ cursor: "pointer" }}
                        type="radio"
                        id="radio3"
                        name={each._id}
                        checked={each.answered === each.option3}
                        value={each.answered}
                        onChange={() => {
                          handleAns(each._id, each.option3, each);
                        }}
                      />
                      <p>{each.option3}</p>
                    </div>
                    <div>
                      <input
                        style={{ cursor: "pointer" }}
                        type="radio"
                        id="radio4"
                        name={each._id}
                        value={each.answered}
                        checked={each.answered === each.option4}
                        onChange={() => {
                          handleAns(each._id, each.option4, each);
                        }}
                      />
                      <p>{each.option4}</p>
                    </div>
                  </div>
                  {currentQuestion > 1 && load2 && (
                    <button
                      onClick={() => {
                        setPage(currentQuestion - 1);
                      }}
                      className="prev"
                      type="button"
                    >
                      « Prev
                    </button>
                  )}
                  {currentQuestion < totalQuestions && load2 && (
                    <button
                      onClick={() => {
                        setPage(currentQuestion + 1);
                      }}
                      className="next"
                      type="button"
                    >
                      Next »
                    </button>
                  )}
                  {currentQuestion === totalQuestions &&
                    allQuestion.length > 0 && (
                      <button
                        onClick={() => {
                          setSubmitted("Are you sure to submit ?");
                        }}
                        className="next"
                        type="button"
                      >
                        Submit Exam
                      </button>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="mcq-con"
        >
          <Hourglass colors={["#ffffff", "#ffffff"]} />
        </div>
      )}
    </>
  );
};

export default MCQCurrentAffairs;