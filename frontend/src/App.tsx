import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Calendar from './pages/Calendar';
import Ideas from './pages/Ideas';
import Analytics from './pages/Analytics';
import Connections from './pages/Connections';
import AutoReply from './pages/AutoReply';
import Settings from './pages/Settings';
import VideoPage from './pages/Video';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/auto-reply" element={<AutoReply />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
