import React from 'react';
import { useQuiz } from '../context/QuizContext';

export const Header = () => {
    const { 
      selectedTheme, 
      timer, 
      selectedAnswers, 
      questions,
      resetQuiz,
      setHasStarted,
      setIsTimerRunning,
      setTimer,
      setSelectedAnswers,
      setSelectedTheme,
      setQuestionCount,
      formatTime,
      questionCount
    } = useQuiz();
  
    const progressPercentage = (Object.keys(selectedAnswers).length / questions.length) * 100;
  
    return (
      <div className="header">
        <div className="theme-selector">
          <h1>Unidad {selectedTheme.slice(-1)}</h1>
          <h2>Preguntas en este examen: {questionCount}</h2>
        </div>
        <div className="timer">Tiempo: {formatTime(timer)}</div>
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span>Progreso: {progressPercentage.toFixed(0)}%</span>
        </div>
        <button className="button" onClick={resetQuiz}>
          Reiniciar
        </button>
        <button
          className="button button-secondary"
          onClick={() => {
            setHasStarted(false);
            setIsTimerRunning(false);
            setTimer(0);
            setSelectedAnswers({});
            setSelectedTheme('');
            setQuestionCount("");           
          }}
        >
          Volver a Inicio
        </button>
      </div>
    );
  };