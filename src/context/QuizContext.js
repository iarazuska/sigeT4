
// src/context/QuizContext.js

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
  } from "react";
  import { shuffleArray } from "../utils/shuffleArray"; // Importa shuffleArray desde utils
  import { formatTime } from "../utils/formatters"; // Importa formatTime desde utils
  
  const QuizContext = createContext();
  
  // Hook personalizado para acceder al contexto
  export const useQuiz = () => {
    const context = useContext(QuizContext);
    if (!context) {
      throw new Error("useQuiz must be used within a QuizProvider");
    }
    return context;
  };
  
  // Proveedor del contexto
  export const QuizProvider = ({ children }) => {
    const [hasStarted, setHasStarted] = useState(false); // Estado para controlar el inicio del examen
    const [questions, setQuestions] = useState([]); // Preguntas seleccionadas
    const [allQuestions, setAllQuestions] = useState([]); // Todas las preguntas disponibles
    const [selectedAnswers, setSelectedAnswers] = useState({}); // Respuestas seleccionadas por el usuario
    const [score, setScore] = useState(0); // Puntuación actual
    const [showResults, setShowResults] = useState(false); // Mostrar resultados
    const [loading, setLoading] = useState(true); // Estado de carga
    const [currentPage, setCurrentPage] = useState(0); // Página actual
    const [selectedTheme, setSelectedTheme] = useState(""); // Tema seleccionado
    const [timer, setTimer] = useState(0); // Temporizador
    const [isTimerRunning, setIsTimerRunning] = useState(false); // Estado del temporizador
    const [allQuestionsUsed, setAllQuestionsUsed] = useState(false); // Si se han usado todas las preguntas
    const questionsPerPage = 5; // Número de preguntas por página
    const [questionCount, setQuestionCount] = useState(""); // Por defecto, 20 preguntas
    const [questionsPerTheme, setQuestionsPerTheme] = useState({}); // Estado para almacenar el número total de preguntas por tema
    const [title, setTitle] = useState(""); // Estado para el título del tema
  
    // Función para obtener el número total de preguntas por tema
    // Función para obtener el número total de preguntas por tema
    useEffect(() => {
      const fetchQuestionsCount = async () => {
        const themes = ["tema1", "tema2", "tema3", "tema4", "tema5"];
        const questionsCount = {};
        const titles = {};
  
        for (const theme of themes) {
          try {
            const response = await fetch(
              `${process.env.PUBLIC_URL}/${theme}.json`
            );
            if (!response.ok) {
              throw new Error(`No se pudo cargar el archivo JSON para ${theme}.`);
            }
  
            const data = await response.json();
            const quizQuestions = data.quiz || [];
            questionsCount[theme] = quizQuestions.length; // Guarda el número total de preguntas
  
            // Guardar el título del tema
            titles[theme] = data.title || "";
  
            // Si hay un tema seleccionado, establecer su título
            if (selectedTheme === theme) {
              setTitle(data.title || "");
            }
          } catch (error) {
            console.error(
              `Error cargando el total de preguntas para ${theme}:`,
              error
            );
            questionsCount[theme] = 0;
            titles[theme] = "";
          }
        }
  
        setQuestionsPerTheme(questionsCount);
      };
  
      fetchQuestionsCount();
    }, [selectedTheme]); // Añadimos selectedTheme como dependencia
  
    // Función para cargar preguntas
    const loadQuestions = useCallback(
      async (selectedTheme) => {
        setLoading(true);
        try {
          const response = await fetch(
            `${process.env.PUBLIC_URL}/${selectedTheme}.json`
          );
          if (!response.ok) {
            throw new Error("No se pudo cargar el archivo JSON.");
          }
  
          const data = await response.json();
          const quizQuestions = data.quiz || [];
  
          const usedQuestionIndices =
            JSON.parse(localStorage.getItem(`usedQuestions_${selectedTheme}`)) ||
            [];
  
          const availableQuestions = quizQuestions.filter(
            (_, index) => !usedQuestionIndices.includes(index)
          );
  
          if (availableQuestions.length < 25) {
            localStorage.removeItem(`usedQuestions_${selectedTheme}`);
          }
  
          const shuffledAvailableQuestions = shuffleArray(availableQuestions);
          const selectedQuestions = shuffledAvailableQuestions
            .slice(0, questionCount)
            .map((question) => ({
              ...question,
              options: shuffleArray(question.options),
            }));
  
          const updatedUsedQuestionIndices = Array.from(
            new Set([
              ...usedQuestionIndices,
              ...selectedQuestions.map((_, index) =>
                quizQuestions.indexOf(shuffledAvailableQuestions[index])
              ),
            ])
          );
          localStorage.setItem(
            `usedQuestions_${selectedTheme}`,
            JSON.stringify(updatedUsedQuestionIndices)
          );
  
          setAllQuestions((prev) => ({
            ...prev,
            [selectedTheme]: quizQuestions,
          }));
          setQuestions(selectedQuestions);
        } catch (error) {
          console.error("Error loading questions:", error);
        } finally {
          setLoading(false);
        }
      },
      [shuffleArray, questionCount]
    );
  
    const loadThemeTitle = useCallback(async (theme) => {
      if (!theme) return;
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/${theme}.json`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el archivo JSON.");
        }
        const data = await response.json();
        setTitle(data.title || "");
      } catch (error) {
        console.error("Error loading theme title:", error);
        setTitle("");
      }
    }, []);
  
    // Añade el useEffect para el título aquí
    useEffect(() => {
      if (selectedTheme) {
        loadThemeTitle(selectedTheme);
      }
    }, [selectedTheme, loadThemeTitle]);
  
    // Efecto para iniciar la carga de preguntas cuando `hasStarted` cambia
    useEffect(() => {
      if (hasStarted) {
        loadQuestions(selectedTheme);
      }
    }, [selectedTheme, loadQuestions, hasStarted]);
  
    // Efecto para calcular la puntuación
    useEffect(() => {
      let calculatedScore = 0;
      const scorePerCorrectAnswer = questionCount === 25 ? 0.4 : 0.5; // Valor por respuesta correcta
      const penaltyPerWrongAnswer = questionCount === 25 ? -0.2 : -0.25; // Penalización por respuesta incorrecta
  
      questions.forEach((question, index) => {
        if (selectedAnswers[index] === undefined) {
          calculatedScore += 0;
        } else if (selectedAnswers[index] === question.answer) {
          calculatedScore += scorePerCorrectAnswer;
        } else if (selectedAnswers[index]) {
          calculatedScore += penaltyPerWrongAnswer;
        }
      });
      setScore(calculatedScore.toFixed(2));
      if (calculatedScore < 0) {
        setScore(0); 
        } 
    }, [selectedAnswers, questions, questionCount]);
  
    // Función para manejar la selección de respuestas
    const handleAnswerSelect = useCallback(
      (questionIndex, option) => {
        if (!isTimerRunning && Object.keys(selectedAnswers).length === 0) {
          setIsTimerRunning(true);
        }
  
        setSelectedAnswers((prev) => {
          const newAnswers = { ...prev };
          if (prev[questionIndex] === option) {
            delete newAnswers[questionIndex]; // Desselecciona si ya estaba seleccionada
          } else {
            newAnswers[questionIndex] = option; // Guarda la respuesta seleccionada
          }
          return newAnswers;
        });
      },
      [isTimerRunning, selectedAnswers]
    );
  
    // Función para validar respuestas
    const handleValidateAnswers = () => {
      setShowResults(true);
      setIsTimerRunning(false);
    };
  
    // Función para navegar entre preguntas
    const navigateToQuestion = (index) => {
      const newPage = Math.floor(index / questionsPerPage);
      setCurrentPage(newPage);
  
      setTimeout(() => {
        const questionElement = document.getElementById(`question-${index}`);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    };
  
    // Función para reiniciar el cuestionario
    const resetQuiz = () => {
      localStorage.removeItem(`usedQuestions_${selectedTheme}`);
      setSelectedAnswers({});
      setScore(0);
      setShowResults(false);
      setCurrentPage(0);
      setTimer(0);
      setIsTimerRunning(false);
      setAllQuestionsUsed(false);
      loadQuestions(selectedTheme);
    };
  
    // Función para obtener el estado de una pregunta
    const getQuestionStatus = (index) => {
      if (!showResults) {
        return selectedAnswers[index] ? "answered" : "unanswered";
      }
      if (!selectedAnswers[index]) return "unanswered";
      return selectedAnswers[index] === questions[index]?.answer
        ? "correct"
        : "incorrect";
    };
  
  
    // Efecto para verificar si se han usado todas las preguntas
    useEffect(() => {
      const checkCompletion = () => {
        const used =
          JSON.parse(localStorage.getItem(`usedQuestions_${selectedTheme}`)) ||
          [];
        setAllQuestionsUsed(
          used.length >= allQuestions.length && allQuestions.length > 0
        );
      };
      checkCompletion();
    }, [allQuestions, selectedTheme]);
  
    // Efecto para manejar el temporizador
    useEffect(() => {
      let interval;
      if (isTimerRunning) {
        interval = setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isTimerRunning]);
  
    // Función para cambiar de página
    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
      setTimeout(() => {
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    };
  
    // Función para obtener las preguntas actuales según la página
    const getCurrentQuestions = () => {
      const start = currentPage * questionsPerPage;
      return questions.slice(start, start + questionsPerPage);
    };
  
    // Valor proporcionado por el contexto
    const value = {
      hasStarted,
      setHasStarted,
      questions,
      allQuestions,
      selectedAnswers,
      setSelectedAnswers,
      score,
      setScore,
      showResults,
      setShowResults,
      loading,
      currentPage,
      setCurrentPage,
      selectedTheme,
      setSelectedTheme,
      timer,
      setTimer,
      isTimerRunning,
      setIsTimerRunning,
      allQuestionsUsed,
      questionsPerPage,
      loadQuestions,
      handleAnswerSelect,
      handleValidateAnswers,
      navigateToQuestion,
      resetQuiz,
      getQuestionStatus,
      handlePageChange,
      getCurrentQuestions,
      formatTime,
      shuffleArray,
      questionCount,
      setQuestionCount,
      questionsPerTheme,
      title,
      setTitle,
      loadThemeTitle,
    };
  
    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
  };