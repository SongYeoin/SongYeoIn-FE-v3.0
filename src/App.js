import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Login } from './Login';
import { Landing } from './Landing';
import { Join } from './Join';
import { CourseProvider } from './components/common/CourseContext';
import { UserProvider, useUser } from './components/common/UserContext';
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
import {
  AdminProtectedRoute,
  StudentProtectedRoute,
} from './api/ProtectedRoutes';

// 404 페이지 처리를 위한 컴포넌트
const NotFoundHandler = () => {
  const { logout } = useUser(); // UserContext에서 로그아웃 함수 가져오기

  useEffect(() => {
    logout(); // 로그아웃 처리
  }, [logout]);

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

        {/* 보호된 라우트들 */}
        <Route path="*" element={
          <UserProvider>
            <CourseProvider>
              <Routes>
                {/* 관리자 페이지 */}
                <Route path="/admin/member" element={
                  <AdminProtectedRoute>
                    <MemberList />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/course" element={
                  <AdminProtectedRoute>
                    <CourseList />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/notice" element={
                  <AdminProtectedRoute>
                    <AdminNoticeList />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/attendance" element={
                  <AdminProtectedRoute>
                    <AttendanceList />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/club" element={
                  <AdminProtectedRoute>
                    <AdminClubList />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/journal" element={
                  <AdminProtectedRoute>
                    <AdminJournalList />
                  </AdminProtectedRoute>
                } />

                {/* 학생 페이지 */}
                <Route path="/main" element={
                  <StudentProtectedRoute>
                    <StudentMainPage />
                  </StudentProtectedRoute>
                } />
                <Route path="/notice" element={
                  <StudentProtectedRoute>
                    <StudentNoticeList />
                  </StudentProtectedRoute>
                } />
                <Route path="/club" element={
                  <StudentProtectedRoute>
                    <ClubList />
                  </StudentProtectedRoute>
                } />
                <Route path="/journal" element={
                  <StudentProtectedRoute>
                    <StudentJournalList />
                  </StudentProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <StudentProtectedRoute>
                    <StudentAttendanceList />
                  </StudentProtectedRoute>
                } />

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
