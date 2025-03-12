import React from 'react';
import { useQuiz } from '../context/QuizContext';
import { Header } from './Header';
import { Pagination } from './Pagination';
import { Question } from './Question';
import { QuestionGrid } from './QuestionGrid';
import { LandingPage } from './LandingPage';

export const Quiz = () => {
  const {
    hasStarted,
    loading,
    allQuestionsUsed,
    showResults,
    questions,
    currentPage,
    questionsPerPage,
    resetQuiz,
    selectedAnswers,
    score,
    setCurrentPage,
    totalPages,
  } = useQuiz();

  // Función para obtener el estado de una pregunta
  const getQuestionStatus = (index) => {
    if (!showResults) {
      return selectedAnswers[index] ? 'answered' : 'unanswered';
    }
    if (!selectedAnswers[index]) return 'unanswered';
    return selectedAnswers[index] === questions[index]?.answer ? 'correct' : 'incorrect';
  };

  // Función para navegar a una pregunta específica
  const navigateToQuestion = (index) => {
    const newPage = Math.floor(index / questionsPerPage);
    setCurrentPage(newPage);
    
    // Asegurarnos que el elemento exista en el DOM antes de hacer scroll
    const scrollToQuestion = () => {
      const questionElement = document.getElementById(`question-${index}`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Si el elemento aún no existe, intentar de nuevo en unos milisegundos
        requestAnimationFrame(scrollToQuestion);
      }
    };
  
    requestAnimationFrame(scrollToQuestion);
  };
  // Función para obtener las preguntas actuales según la página actual
  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    const end = start + questionsPerPage;
    return questions.slice(start, end); // Devuelve solo las preguntas correspondientes a la página actual
  };

  // Renderizado condicional
  if (!hasStarted) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div className="header">
        <h2>Cargando preguntas...</h2>
      </div>
    );
  }

  if (allQuestionsUsed) {
    return (
      <div className="header">
        <h2>¡Has completado todas las preguntas de esta unidad!</h2>
        <button className="button" onClick={resetQuiz}>
          Reiniciar cuestionario
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Contenido principal */}
      <div className="main-content">
        {/* Encabezado */}
        <Header />
        {/* Paginación */}
        <Pagination totalPages={totalPages} onPageChange={(newPage) => setCurrentPage(newPage)} />

        {/* Mostrar resultados o preguntas */}
        {showResults ? (
          <div className="results">
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
              Resultado Final: {score}/10
            </h2>
            {questions.map((question, index) => (
              <Question key={index} question={question} index={index} showResults={true} />
            ))}
          </div>
        ) : (
          <div>
            {/* Renderiza las preguntas actuales según la página */}
            {getCurrentQuestions().map((question, pageIndex) => {
              const questionIndex = currentPage * questionsPerPage + pageIndex;
              return (
                <Question
                  key={questionIndex}
                  question={question}
                  index={questionIndex}
                  showResults={false}
                />
              );
            })}
            {/* Paginación */}
            <Pagination totalPages={totalPages} onPageChange={(newPage) => setCurrentPage(newPage)} />
          </div>
        )}
      </div>

      {/* Barra lateral con cuadrícula de preguntas */}
      <QuestionGrid
        getQuestionStatus={getQuestionStatus}
        navigateToQuestion={navigateToQuestion}
      />
    </div>
  );
};