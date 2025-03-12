import React from 'react';
import { useQuiz } from '../context/QuizContext';

export const Question = ({ question, index, showResults }) => {
  const { selectedAnswers, handleAnswerSelect } = useQuiz();

  const getOptionClass = (option) => {
    let optionClass = 'option-container';
    if (showResults) {
      if (option === question.answer) {
        optionClass += ' correct';
      } else if (selectedAnswers[index] === option) {
        optionClass += ' incorrect';
      }
    }
    return optionClass;
  };

  return (
    <div id={`question-${index}`} className="question">
      <h3>Pregunta {index + 1}: {question.question}</h3>
      <div className='options-container'>
        {question.options.map((option, i) => (
          <div
            key={i}
            className={getOptionClass(option)}
            onClick={() => !showResults && handleAnswerSelect(index, option)}
          >
            <label className="option-label">
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                readOnly={showResults}
                checked={selectedAnswers[index] === option}
              />
              <strong>{String.fromCharCode(97 + i)}</strong> {option} {/* Letra en negrita */}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};