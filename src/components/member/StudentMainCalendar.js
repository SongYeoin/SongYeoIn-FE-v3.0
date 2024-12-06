import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentMainCalendar.css';
import { studentJournalApi } from '../../api/journalApi';
import StudentJournalDetail from '../journal/StudentJournalDetail';

const StudentMainCalendar = ({ courseId, onDateChange }) => {
  const [value, setValue] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());  // 현재 보고 있는 월을 추적하기 위한 상태 추가
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchJournals(currentMonth);  // currentMonth를 기준으로 데이터 가져오기
    }
  }, [courseId, currentMonth]);  // value 대신 currentMonth를 의존성으로 변경

  const fetchJournals = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
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

  const handleDateChange = (date) => {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(date);
    console.log("선택된 날짜: " + formattedDate);
    setValue(date);
    onDateChange(formattedDate); // 부모 컴포넌트에 선택된 날짜 전달
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={handleDateChange} // 클릭 시 날짜 변경 핸들러 호출
        value={value}
        locale="ko"
        formatMonth={(locale, date) => date.toLocaleString('ko', { month: 'long' })}
        navigationLabel={({ date }) => `${date.getFullYear()}년 ${date.toLocaleString('ko', { month: 'long' })}`}
        tileContent={({ date }) => {
          const journalsForDate = journals.filter(journal =>
            new Date(journal.createdAt).toDateString() === date.toDateString()
          );
          console.log('Journals for date', date, ':', journalsForDate);
          return journalsForDate.length > 0 ? (
            <div className="text-xs mt-1">
              {journalsForDate.map(journal => (
                <div key={journal.id} className="text-blue-500">●</div>
              ))}
            </div>
          ) : null;
        }}
      />
    </div>
  );
};

export default StudentMainCalendar;