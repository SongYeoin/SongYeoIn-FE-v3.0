// components/member/StudentMainCalendar.js
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './StudentMainCalendar.css';
import { studentJournalApi } from '../../api/journalApi';

const StudentMainCalendar = ({ courseId }) => {
  const [value, setValue] = useState(new Date());
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (courseId) {
      fetchJournals();
    }
  }, [courseId, value]);

  const fetchJournals = async () => {
    try {
      // 선택된 월의 첫날과 마지막날 계산
      const year = value.getFullYear();
      const month = value.getMonth();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      console.log('Fetching journals for period:', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const response = await studentJournalApi.getList(courseId, {
        pageNum: 1,
        amount: 31,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      console.log('Fetched journals:', response.data);
      setJournals(response.data.data);
    } catch (error) {
      console.error('교육일지 조회 실패:', error);
    }
  };

  return (
    <div className="calendar-container">
      <Calendar
        onChange={setValue}
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