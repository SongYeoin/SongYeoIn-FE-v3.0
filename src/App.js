import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './Login';
import { Landing } from './Landing';
import { Join } from './Join';
import {CourseProvider} from './components/common/CourseContext';
import MemberList from './components/member/admin/MemberList';
import CourseList from './components/course/admin/CourseList';
import AdminNoticeList from './components/notice/admin/AdminNoticeList';
import StudentNoticeList from './components/notice/student/StudentNoticeList';
import AttendanceList from './components/attendance/admin/AttendanceList';
import ClubList from './components/club/ClubList';
import AdminClubList from './components/club/admin/AdminClubList';

function App() {
  return (
    <CourseProvider>
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
        <Route path="/admin/notice" element={<AdminNoticeList />} />
        <Route path="/admin/attendance" element={<AttendanceList />} />
        <Route path="/admin/club" element={<AdminClubList />} />


        {/* Student Pages */}
        <Route path="/notice" element={<StudentNoticeList />} />
        <Route path="/club" element={<ClubList />} />
      </Routes>
    </Router>
    </CourseProvider>
  );
}
export default App;
