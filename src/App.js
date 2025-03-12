import { QuizProvider } from './context/QuizContext';
import { Quiz } from './components/Quiz';
import './App.css';

const App = () => {
  return (
    <QuizProvider>
      <Quiz />
    </QuizProvider>
  );
};

export default App;