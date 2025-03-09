import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentMainCalendar.css';
import { studentJournalApi } from '../../api/journalApi';
import StudentJournalDetail from '../journal/StudentJournalDetail'; // 상세보기 컴포넌트 import

const StudentMainCalendar = ({ courseId, onDateChange }) => {
  const [value, setValue] = useState(new Date());
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null); // 선택된 교육일지 상태 추가
  const [currentMonth, setCurrentMonth] = useState(new Date());  // 현재 보고있는 월을 추적

  const fetchJournals = async (date) => {
    if (!courseId) return;

    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const response = await studentJournalApi.getList(courseId, {
        pageNum: 1,
        amount: 31,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      setJournals(response.data.data);
    } catch (error) {
      console.error('교육일지 조회 실패:', error);
    }
  };

  // 초기 로딩 시 현재 월의 데이터 fetch
  useEffect(() => {
    setJournals([]);
    setSelectedJournal(null);


    if (courseId) {
      fetchJournals(currentMonth);
    }
  }, [courseId, currentMonth]);

  const handleDateChange = (date) => {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(date);
    setValue(date);
    onDateChange(formattedDate);
  };

  // 달력 navigation 변경 시 호출되는 함수
  const handleActiveStartDateChange = ({ activeStartDate }) => {
    if (activeStartDate) {
      setCurrentMonth(activeStartDate);
    }
  };

  const handleJournalClick = (e, journal) => {
    e.stopPropagation(); // 달력 날짜 선택 이벤트와 분리
    setSelectedJournal(journal);
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={value}
        locale="ko"
        formatMonth={(locale, date) => date.toLocaleString('ko', { month: 'long' })}
        navigationLabel={({ date }) => `${date.getFullYear()}년 ${date.toLocaleString('ko', { month: 'long' })}`}
        onActiveStartDateChange={handleActiveStartDateChange}  // 월 변경 이벤트 핸들러 추가
        tileContent={({ date }) => {
          const journalsForDate = journals.filter(journal =>
            new Date(journal.educationDate).toDateString() === date.toDateString()
          );

          return journalsForDate.length > 0 ? (
            <div className="journal-entry">
              {journalsForDate.map(journal => (
                <div
                  key={journal.id}
                  className="journal-title"
                  onClick={(e) => handleJournalClick(e, journal)}
                  title={journal.title}
                >
                  {journal.title}
                </div>
              ))}
            </div>
          ) : null;
        }}
      />

      {/* 상세보기 모달 */}
      {selectedJournal && (
        <StudentJournalDetail
          journalId={selectedJournal.id}
          courseId={courseId}
          onClose={() => {
            setSelectedJournal(null);
            fetchJournals(currentMonth);  // 현재 보고있는 월의 데이터 새로고침
          }}
        />
      )}
    </div>
  );
};

export default StudentMainCalendar;