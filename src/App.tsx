import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './index.css';
import Home from './pages/Home';
import TopicCollection from './pages/TopicCollection';
import ArticleDetail from './pages/ArticleDetail';
import Upload from './pages/Upload';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topic-collection" element={<TopicCollection />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
