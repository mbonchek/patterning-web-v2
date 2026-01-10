import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { Library } from './pages/admin/Library';
import { Prompts } from './pages/admin/Prompts';
import { PromptEditor } from './pages/admin/PromptEditor';
import { BriefLab } from './pages/admin/BriefLab';
import { ImageLab } from './pages/admin/ImageLab';
import { VoiceLab } from './pages/admin/VoiceLab';
import Branching from './pages/admin/Branching';
import PatternPlay from './pages/admin/PatternPlay';
import PatternDetail from './pages/PatternDetail';
import Gallery from './pages/public/Gallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Gallery Home */}
        <Route path="/" element={<Gallery />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="library" element={<Library />} />
              <Route path="prompts" element={<Prompts />} />
              <Route path="prompts/:id" element={<PromptEditor />} />
              <Route path="voice" element={<VoiceLab />} />
              <Route path="branching" element={<Branching />} />
              <Route path="pattern-play" element={<PatternPlay />} />
              <Route path="test-brief" element={<BriefLab />} />
              <Route path="test-image" element={<ImageLab />} />
              <Route path="playground" element={<div className="text-white">Playground (Coming Soon)</div>} />
              <Route path="settings" element={<div className="text-white">Settings (Coming Soon)</div>} />
            </Routes>
          </AdminLayout>
        } />
        
        {/* Public Pattern Detail Routes - Must come after /admin/* */}
        <Route path="/pattern/word/:id" element={<PatternDetail />} />
        <Route path="/:word" element={<PatternDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
