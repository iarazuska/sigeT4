import React, { useState, useEffect } from "react";
import './App.css';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    fetch("/preguntas.json")
      .then((response) => response.json())
      .then((data) => {
        const quizQuestions = data.quiz;
        const usedQuestionIndices = JSON.parse(localStorage.getItem("usedQuestions")) || [];
        const availableQuestions = quizQuestions.filter(
          (_, index) => !usedQuestionIndices.includes(index)
        );

        if (availableQuestions.length < 25) {
          localStorage.removeItem("usedQuestions");
        }

        const shuffledAvailableQuestions = shuffleArray(availableQuestions);
        const selectedQuestions = shuffledAvailableQuestions.slice(0, 25);

        const updatedUsedQuestionIndices = Array.from(
          new Set([...usedQuestionIndices, ...selectedQuestions.map((_, index) => quizQuestions.indexOf(selectedQuestions[index]))])
        );
        localStorage.setItem("usedQuestions", JSON.stringify(updatedUsedQuestionIndices));

        setAllQuestions(quizQuestions);
        setQuestions(selectedQuestions);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let calculatedScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) {
        calculatedScore += 0.4;
      } else if (selectedAnswers[index]) {
        calculatedScore -= 0.2;
      }
    });
    setScore(calculatedScore.toFixed(1));
  }, [selectedAnswers, questions]);

  const handleAnswerSelect = (questionIndex, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const navigateToQuestion = (index) => {
    const newPage = Math.floor(index / questionsPerPage);
    setCurrentPage(newPage);
    
    // Esperar a que se actualice la página antes de hacer scroll
    setTimeout(() => {
      const questionElement = document.getElementById(`question-${index}`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const resetQuiz = () => {
    setSelectedAnswers({});
    setScore(0);
    setShowResults(false);
    setCurrentPage(0);

    const usedQuestionIndices = JSON.parse(localStorage.getItem("usedQuestions")) || [];
    const availableQuestions = allQuestions.filter(
      (_, index) => !usedQuestionIndices.includes(index)
    );

    if (availableQuestions.length >= 25) {
      const shuffledAvailableQuestions = shuffleArray(availableQuestions);
      const selectedQuestions = shuffledAvailableQuestions.slice(0, 25);

      setQuestions(selectedQuestions);

      const updatedUsedQuestionIndices = Array.from(
        new Set([...usedQuestionIndices, ...selectedQuestions.map((_, index) => allQuestions.indexOf(selectedQuestions[index]))])
      );
      localStorage.setItem("usedQuestions", JSON.stringify(updatedUsedQuestionIndices));
    } else {
      alert("No hay suficientes preguntas nuevas. Se usarán preguntas previamente seleccionadas.");
      fetchQuestions();
    }
  };

  const fetchQuestions = () => {
    fetch("/preguntas.json")
      .then((response) => response.json())
      .then((data) => {
        const quizQuestions = data.quiz;
        localStorage.removeItem("usedQuestions");
        const shuffledQuestions = shuffleArray(quizQuestions);
        const selectedQuestions = shuffledQuestions.slice(0, 25);
        localStorage.setItem("usedQuestions", JSON.stringify(selectedQuestions.map((_, index) => quizQuestions.indexOf(selectedQuestions[index]))));
        setAllQuestions(quizQuestions);
        setQuestions(selectedQuestions);
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
      });
  };

  const getQuestionStatus = (index) => {
    if (!showResults) {
      return selectedAnswers[index] ? "answered" : "unanswered";
    }
    if (!selectedAnswers[index]) return "unanswered";
    return selectedAnswers[index] === questions[index].answer ? "correct" : "incorrect";
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const progressPercentage = (Object.keys(selectedAnswers).length / questions.length) * 100;

  if (loading) {
    return (
      <div className="header">
        <h2>Cargando preguntas...</h2>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="main-content">
        <div className="header">
          <h1>
            Cuestionario ERP-CRM{" "}
            <span className="subtitle">({questions.length} preguntas en total)</span>
          </h1>
          <h3>Total preguntas en BD: {allQuestions.length}</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span style={{ marginLeft: "10px" }}>
              Progreso: {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <button className="button" onClick={resetQuiz}>
            Reiniciar
          </button>
        </div>
        {showResults ? (
          <div className="results">
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Resultado Final: {score}/10 ({((score / 10) * 100).toFixed(1)}%)
            </h2>
            <p style={{ textAlign: "center" }}>
              Haz clic en las preguntas para revisar tus respuestas.
            </p>
            {questions.map((question, index) => (
              <div key={index} id={`question-${index}`} className="question">
                <h3>Pregunta {index + 1}: {question.question}</h3>
                <div>
                  {question.options.map((option, i) => (
                    <label
                      key={i}
                      className={`option ${
                        getQuestionStatus(index) === "correct" && option === question.answer
                          ? "correct"
                          : getQuestionStatus(index) === "incorrect" && option === question.answer
                          ? "correct"
                          : getQuestionStatus(index) === "incorrect" && option === selectedAnswers[index]
                          ? "incorrect"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={false}
                        disabled={true}
                        style={{ marginRight: "10px" }}
                      />
                      {String.fromCharCode(97 + i)}) {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {getCurrentQuestions().map((question, pageIndex) => {
              const questionIndex = currentPage * questionsPerPage + pageIndex;
              return (
                <div key={questionIndex} id={`question-${questionIndex}`} className="question">
                  <h3>Pregunta {questionIndex + 1}: {question.question}</h3>
                  <div>
                    {question.options.map((option, i) => (
                      <label
                        key={i}
                        className={`option ${
                          getQuestionStatus(questionIndex) === "correct" && option === question.answer
                            ? "correct"
                            : getQuestionStatus(questionIndex) === "incorrect" && option === question.answer
                            ? "correct"
                            : getQuestionStatus(questionIndex) === "incorrect" && option === selectedAnswers[questionIndex]
                            ? "incorrect"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={option}
                          checked={!showResults && selectedAnswers[questionIndex] === option}
                          onChange={() => handleAnswerSelect(questionIndex, option)}
                          disabled={showResults}
                          style={{ marginRight: "10px" }}
                        />
                        {String.fromCharCode(97 + i)}) {option}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="pagination">
              <button
                className="button button-auto"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Anterior
              </button>
              <span>Página {currentPage + 1} de {totalPages}</span>
              <button
                className="button button-auto"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Siguiente
              </button>
            </div>
            <button
              className="button"
              onClick={() => setShowResults(true)}
            >
              Validar respuestas
            </button>
          </div>
        )}
      </div>
      <div className="sidebar">
        <h3>Preguntas</h3>
        <div className="question-grid">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`question-number ${getQuestionStatus(index)}`}
              onClick={() => navigateToQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
        {!showResults && (
          <button
            className="button"
            onClick={() => setShowResults(true)}
          >
            Validar respuestas
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;