import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentMainCalendar.css';
import { studentJournalApi } from '../../api/journalApi';

const StudentMainCalendar = ({ courseId, onDateChange }) => {
  const [value, setValue] = useState(new Date());
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    // Ensure that the courseId exists before fetching data
    if (courseId) {
      const fetchJournals = async () => {
        try {
          const currentMonth = new Date();
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

      fetchJournals();  // Fetch journals if courseId is valid
    }
  }, [courseId]);  // courseId가 변경될 때마다 useEffect가 실행됩니다.

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