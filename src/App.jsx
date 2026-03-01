import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import Layout from './components/Layout';
import { DocumentProvider } from './context/DocumentContext';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </DocumentProvider>
  );
}

export default App;