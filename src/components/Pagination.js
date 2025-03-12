import React from 'react';
import { useQuiz } from '../context/QuizContext';
export const Pagination = () => {
    const { currentPage, setCurrentPage, questions, questionsPerPage } = useQuiz();
    const totalPages = Math.ceil(questions.length / questionsPerPage);
  
    const handlePageChange = (newPage) => {
      setCurrentPage(newPage);
      setTimeout(() => {
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    };
  
    return (
      <div className="pagination">
        <button
          className="button button-auto"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Anterior
        </button>
        <span>
          Página {currentPage + 1} de {totalPages}
        </span>
        <button
          className="button button-auto"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          Siguiente
        </button>
      </div>
    );
  };