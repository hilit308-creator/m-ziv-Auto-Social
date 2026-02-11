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
import MomMode from './pages/MomMode';
import './index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Mom Mode - simplified UI without Layout */}
          <Route path="/mom" element={<MomMode />} />
          
          {/* Advanced Mode with full Layout */}
          <Route element={<Layout><Dashboard /></Layout>} path="/" />
          <Route path="/posts" element={<Layout><Posts /></Layout>} />
          <Route path="/calendar" element={<Layout><Calendar /></Layout>} />
          <Route path="/ideas" element={<Layout><Ideas /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/connections" element={<Layout><Connections /></Layout>} />
          <Route path="/auto-reply" element={<Layout><AutoReply /></Layout>} />
          <Route path="/video" element={<Layout><VideoPage /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
