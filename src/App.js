import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './Login';
import { Landing } from './Landing';
import { Join } from './Join';
import MemberList from './components/member/admin/MemberList';
import CourseList from './components/course/admin/CourseList';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Student Login */}
        <Route path="/login/student" element={<Login role="student" />} />

        {/* Admin Login */}
        <Route path="/login/admin" element={<Login role="admin" />} />

        {/* Registration */}
        <Route path="/join" element={<Join />} />

        {/* Admin Pages */}
        <Route path="/admin/member" element={<MemberList />} />
        <Route path="/admin/course" element={<CourseList />} />
      </Routes>
    </Router>
  );
}

export default App;
