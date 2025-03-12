import React,{ useState} from 'react';
import { useQuiz } from '../context/QuizContext';
export const QuestionGrid = ({ getQuestionStatus, navigateToQuestion }) => {
    const { questions, showResults, handleValidateAnswers } = useQuiz();
    const [isCollapsed, setIsCollapsed] = useState(false);
  
    return (
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Botón toggle solo visible en móvil */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? '↑' : '↓'}
      </button>
        <h1 className="sidebar-title">Respuestas</h1>
        <div className="question-grid">
          {questions.map((_, index) => (
            <div
            key={index}
            className={`question-number ${getQuestionStatus(index)}`}
            onClick={(e) => {
              e.preventDefault();
              navigateToQuestion(index);
            }}
          >
              {index + 1}
            </div>
          ))}
        </div>
        {!showResults && (
          <button
            className="button btn-validar"
            onClick={handleValidateAnswers}
          >
            Validar respuestas
          </button>
        )}
      </div>
    );
  };