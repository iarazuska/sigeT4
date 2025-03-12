import React, { useState } from "react";
import { useQuiz } from "../context/QuizContext";

export const LandingPage = () => {
  const {
    selectedTheme,
    setSelectedTheme,
    setHasStarted,
    questionsPerTheme,
    questionCount,
    setQuestionCount,
    title,
    setTitle,
    loading,
  } = useQuiz();

  const [showQuestionCountSelector, setShowQuestionCountSelector] =
    useState(false); // Estado para el selector de preguntas
  const [showInstructions, setShowInstructions] = useState(false); // Estado para las instrucciones
  const [isTitleLoading, setIsTitleLoading] = useState(false);

  const handleThemeChange = async (event) => {
    const newTheme = event.target.value;

    if (newTheme) {
      setSelectedTheme(newTheme);
      setIsTitleLoading(true);

      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/${newTheme}.json`
        );
        if (!response.ok) {
          throw new Error(
            `No se pudo cargar el archivo JSON para ${newTheme}.`
          );
        }
        const data = await response.json();
        setTitle(data.title || "");
      } catch (error) {
        console.error("Error cargando el título:", error);
        setTitle("");
      } finally {
        setIsTitleLoading(false); // Finalizar carga
      }

      // Habilita el selector de número de preguntas
      setShowQuestionCountSelector(true);
      setShowInstructions(false); // Asegúrate de que las instrucciones no aparezcan todavía
    } else {
      setSelectedTheme(" ");
      setTitle("");
      setShowQuestionCountSelector(false);
      setShowInstructions(false);
    }
  };

  const handleQuestionCountChange = (event) => {
    setQuestionCount(Number(event.target.value));

    // Si ya hay un tema seleccionado, muestra las instrucciones
    if (selectedTheme) {
      setShowInstructions(true);
    }
  };

  return (
    <div className="landing-page">
      <img
        src={`${process.env.PUBLIC_URL}/logo.jpg`}
        alt="Logo"
        className="logo"
        onError={(e) => {
          e.target.style.display = "none";
          console.error("Error cargando el logo:", e.target.src);
        }}
      />
      <h1>SISTEMAS DE GESTIÓN EMPRESARIAL</h1>

      {/* Título del tema */}
      {selectedTheme ? (
        <h2>{title || "Cargando descripción..."}</h2>
      ) : (
        <h2>Selecciona un tema para ver su descripción</h2>
      )}

      {/* Selector de temas */}
      <div className="theme-selector">
        <label>Selecciona una unidad:</label>
        <select
          value={selectedTheme}
          onChange={handleThemeChange}
          className="theme-dropdown"
        >
          <option value="" disabled hidden>
            Selecciona una unidad
          </option>
          {Object.keys(questionsPerTheme).map((theme) => (
            <option key={theme} value={theme}>
              {`Unidad ${theme.slice(-1)}`}
            </option>
          ))}
        </select>
      </div>

      {/* Mostrar el número de preguntas si hay un tema seleccionado */}
      {selectedTheme && (
        <div className="questions-per-theme">
          <label className="theme-label">
            Total de preguntas disponibles: {questionsPerTheme[selectedTheme]}
          </label>
        </div>
      )}

      {/* Selector de número de preguntas */}
      {showQuestionCountSelector && (
        <div className="question-count-selector">
          <label>Selecciona el número de preguntas:</label>
          <select
            value={questionCount}
            onChange={handleQuestionCountChange}
            className="question-count-dropdown"
          >
            <option value="" disabled hidden>
              Selecciona numero de preguntas
            </option>
            <option value="20">20 preguntas</option>
            <option value="25">25 preguntas</option>
          </select>
        </div>
      )}

      {/* Instrucciones */}
      {showInstructions && (
        <div className="instructions">
          <h2>Instrucciones</h2>
          <ul>
            <li>{questionCount} preguntas por examen</li>
            <li>Tiempo ilimitado</li>
            <li>
              +{questionCount === 25 ? "0.4" : "0.5"} puntos por respuesta
              correcta
            </li>
            <li>
              -{questionCount === 25 ? "0.2" : "0.25"} puntos por respuesta
              incorrecta
            </li>
            <li>Mínimo para aprobar: 5 puntos</li>
          </ul>
        </div>
      )}

      {/* Botón "Comenzar Examen" */}
      <button
        className="button start-button"
        onClick={() => setHasStarted(true)}
        disabled={!selectedTheme || !questionCount || !showInstructions} // Deshabilita si no están completas las selecciones
      >
        Comenzar Examen
      </button>
    </div>
  );
};