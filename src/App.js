import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Login } from './Login';
import { Landing } from './Landing';
import { Join } from './Join';
import { CourseProvider } from './components/common/CourseContext';
import { UserProvider } from './components/common/UserContext';
import MemberList from './components/member/admin/MemberList';
import CourseList from './components/course/admin/CourseList';
import AdminNoticeList from './components/notice/admin/AdminNoticeList';
import StudentNoticeList from './components/notice/student/StudentNoticeList';
import AttendanceList from './components/attendance/admin/AttendanceList';
import ClubList from './components/club/ClubList';
import AdminJournalList from './components/journal/admin/AdminJournalList';
import StudentJournalList from './components/journal/StudentJournalList';
import StudentMainPage from './components/member/StudentMainPage';
import AdminClubList from './components/club/admin/AdminClubList';
import StudentAttendanceList
  from './components/attendance/student/AttendanceList';

// 404 페이지 처리를 위한 컴포넌트
const NotFoundHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 세션 스토리지에서 토큰 정보 삭제
    sessionStorage.removeItem('token');         // Access Token
    sessionStorage.removeItem('refreshToken');  // Refresh Token
    // 메인 페이지로 리다이렉트
    navigate('/');
  }, [navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 컨텍스트가 필요 없는 페이지 */}
        <Route path="/" element={<Landing />} />
        <Route path="/login/student" element={<Login role="student" />} />
        <Route path="/login/admin" element={<Login role="admin" />} />
        <Route path="/join" element={<Join />} />

        {/* 컨텍스트가 필요한 페이지 */}
        <Route
          path="*"
          element={
            <UserProvider>
              <CourseProvider>
                <Routes>
                  {/* Admin Pages */}
                  <Route path="/admin/member" element={<MemberList />} />
                  <Route path="/admin/course" element={<CourseList />} />
                  <Route path="/admin/notice" element={<AdminNoticeList />} />
                  <Route path="/admin/attendance"
                         element={<AttendanceList />} />
                  <Route path="/admin/club" element={<AdminClubList />} />
                  <Route path="/admin/journal" element={<AdminJournalList />} />

                  {/* Student Pages */}
                  <Route path="/main" element={<StudentMainPage />} />
                  <Route path="/notice" element={<StudentNoticeList />} />
                  <Route path="/club" element={<ClubList />} />
                  <Route path="/journal" element={<StudentJournalList />} />
                  <Route path="/attendance"
                         element={<StudentAttendanceList />} />

                  {/* 정의되지 않은 경로는 로그아웃 처리 후 메인 페이지로 이동 */}
                  <Route path="*" element={<NotFoundHandler />} />
                </Routes>
              </CourseProvider>
            </UserProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
