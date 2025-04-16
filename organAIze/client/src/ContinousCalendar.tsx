'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import moment from 'moment';
import api from './axios-api';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'homework' | 'lecture/meetings' | 'general' | 'free time' | 'other';
  time?: string;
}

interface ContinuousCalendarProps {
  onClick?: (_day: number, _month: number, _year: number) => void;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({ onClick }) => {
  const today = new Date();
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [showTodoListModal, setShowTodoListModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'general',
    time: '',
  });
  
  const monthOptions = monthNames.map((month, index) => ({ name: month, value: `${index}` }));

  const scrollToDay = (monthIndex: number, dayIndex: number) => {
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) => ref && ref.getAttribute('data-month') === `${monthIndex}` && ref.getAttribute('data-day') === `${dayIndex}`,
    );

    const targetElement = dayRefs.current[targetDayIndex];

    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector('.calendar-container');
      const elementRect = targetElement.getBoundingClientRect();
      const is2xl = window.matchMedia('(min-width: 1536px)').matches;
      const offsetFactor = is2xl ? 3 : 2.5;

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const offset = elementRect.top - containerRect.top - (containerRect.height / offsetFactor) + (elementRect.height / 2);

        container.scrollTo({
          top: container.scrollTop + offset,
          behavior: 'smooth',
        });
      } else {
        const offset = window.scrollY + elementRect.top - (window.innerHeight / offsetFactor) + (elementRect.height / 2);
  
        window.scrollTo({
          top: offset,
          behavior: 'smooth',
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    scrollToDay(monthIndex, 1);
  };

  const handleTodayClick = () => {
    setYear(today.getFullYear());
    scrollToDay(today.getMonth(), today.getDate());
  };

  const handleDayClick = (day: number, month: number, year: number) => {
    let selectedDate = new Date(year, month, day);
    if (month < 0) {
      selectedDate = new Date(year - 1, 11, day);
    }
    
    setSelectedDate(selectedDate);
    setShowTodoListModal(true);
    
    if (onClick) {
      if (month < 0) {
        onClick(day, 11, year - 1);
      } else {
        onClick(day, month, year);
      }
    }
  };

  const handleAddEventClick = (e: React.MouseEvent, day: number, month: number, year: number) => {
    e.stopPropagation();

    let selectedDate = new Date(year, month, day);
    if (month < 0) {
      selectedDate = new Date(year - 1, 11, day);
    }
    
    setSelectedDate(selectedDate);
    setShowEventModal(true);
  };
  
  const handleGlobalAddEventClick = () => {
    setSelectedDate(new Date());
    setShowEventModal(true);
  };
  
  const handleCloseEventModal = () => {
    setShowEventModal(false);
    setNewEvent({ title: '', description: '', type: 'general', time: '' });
  };

  const handleCloseTodoListModal = () => {
    setShowTodoListModal(false);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title.trim() === '') return;

    try {
      // Format date to YYYY-MM-DD for backend
      const formattedDate = selectedDate.toISOString().split('T')[0];

      // Send request to backend
      const response = await api.post('/tasks', {
        name: newEvent.title,
        description: newEvent.description,
        type: newEvent.type as Event['type'],
        time: newEvent.time,
        date: formattedDate
      });

      if (response.data.success) {
        // Create event for frontend display
        const event: Event = {
          id: Date.now().toString(),
          title: newEvent.title,
          description: newEvent.description,
          date: moment(formattedDate).toDate(),
          type: newEvent.type as Event['type'],
          time: newEvent.time,
        };

        const updatedEvents = [...events, event];

        // Sort events by time
        updatedEvents.sort((a, b) => {
          const aDate = a.date;
          const bDate = b.date;

          if (
              aDate.getFullYear() === bDate.getFullYear() &&
              aDate.getMonth() === bDate.getMonth() &&
              aDate.getDate() === bDate.getDate()
          ) {
            const aTime = a.time ? moment(a.time, 'h:mm A') : moment('11:59 PM', 'h:mm A').add(1, 'minute');
            const bTime = b.time ? moment(b.time, 'h:mm A') : moment('11:59 PM', 'h:mm A').add(1, 'minute');
            return aTime.diff(bTime);
          }

          return aDate.getTime() - bDate.getTime();
        });

        setEvents(updatedEvents);
        setNewEvent({ title: '', description: '', type: 'general', time: '' });
        setShowEventModal(false);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Failed to save task. Please try again.");
    }
  };

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };


  const hasEventOnDate = (day: number, month: number) => {
    return events.some(event => {
      const eventDate = event.date;
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const getEventsForDate = (day: number, month: number) => {
    return events.filter(event => {
      const eventDate = event.date;
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const generateCalendar = useMemo(() => {
    const today = new Date();

    const daysInYear = (): { month: number; day: number }[] => {
      const daysInYear = [];
      const startDayOfWeek = new Date(year, 0, 1).getDay();

      if (startDayOfWeek < 6) {
        for (let i = 0; i < startDayOfWeek; i++) {
          daysInYear.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          daysInYear.push({ month, day });
        }
      }

      const lastWeekDayCount = daysInYear.length % 7;
      if (lastWeekDayCount > 0) {
        const extraDaysNeeded = 7 - lastWeekDayCount;
        for (let day = 1; day <= extraDaysNeeded; day++) {
          daysInYear.push({ month: 0, day });
        }
      }
    
      return daysInYear;
    };

    const calendarDays = daysInYear();

    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const calendar = calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full" key={`week-${weekIndex}`}>
        {week.map(({ month, day }, dayIndex) => {
          const index = weekIndex * 7 + dayIndex;
          const isNewMonth = index === 0 || calendarDays[index - 1].month !== month;
          const isToday = today.getMonth() === month && today.getDate() === day && today.getFullYear() === year;
          const hasEvent = month >= 0 && hasEventOnDate(day, month);

          return (
            <div
              key={`${month}-${day}`}
              ref={(el) => { dayRefs.current[index] = el; }}
              data-month={month}
              data-day={day}
              onClick={() => handleDayClick(day, month, year)}
              className={`relative z-10 m-[-0.5px] group aspect-square w-full grow cursor-pointer rounded-xl border font-medium transition-all hover:z-20 hover:border-cyan-400 sm:-m-px sm:size-20 sm:rounded-2xl sm:border-2 lg:size-36 lg:rounded-3xl 2xl:size-40`}
            >
              <span className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isToday ? 'bg-blue-500 font-semibold text-white' : ''} ${month < 0 ? 'text-slate-400' : 'text-slate-800'}`}>
                {day}
              </span>
              {isNewMonth && (
                <span className="absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-semibold text-slate-300 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-2xl">
                  {monthNames[month]}
                </span>
              )}
              {month >= 0 && getEventsForDate(day, month).length > 0 && (
                  <div className="absolute bottom-1.5 left-1 right-1 space-y-0.5 overflow-hidden px-1 text-[10px] sm:text-xs lg:text-sm">
                    {getEventsForDate(day, month)
                        .slice(0, 3)
                        .map((event) => {
                          const colorMap: Record<Event['type'], string> = {
                            homework: 'bg-red-500',
                            'lecture/meetings': 'bg-yellow-500',
                            general: 'bg-blue-500',
                            'free time': 'bg-green-500',
                            other: 'bg-purple-500',
                          };

                          return (
                              <div
                                  key={event.id}
                                  className={`flex items-center gap-1 rounded px-1 py-0.5 text-white ${colorMap[event.type]} bg-opacity-90`}
                              >
                                {event.time && <span className="font-mono">{event.time}</span>}
                                <span className="truncate">{event.type}</span>
                              </div>
                          );
                        })}
                    {getEventsForDate(day, month).length > 3 && (
                        <div className="text-[10px] text-gray-400">+{getEventsForDate(day, month).length - 3} more</div>
                    )}
                  </div>
              )}

              <button 
                type="button" 
                className="absolute right-2 top-2 rounded-full opacity-0 transition-all focus:opacity-100 group-hover:opacity-100"
                onClick={(e) => handleAddEventClick(e, day, month, year)}
              >
                <svg className="size-8 scale-90 text-blue-500 transition-all hover:scale-100 group-focus:scale-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13V7.757Z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    ));

    return calendar;
  }, [year, events]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Format date to YYYY-MM-DD for backend query
        const formattedDate = selectedDate.toISOString().split('T')[0];

        const response = await api.get(`/tasks?date=${formattedDate}`);

        if (response.data.success) {
          // Transform backend tasks to frontend events
          const fetchedEvents = response.data.tasks.map((task: any) => ({
            id: task._id,
            title: task.name,
            description: task.description || '',
            date: moment(task.date, 'YYYY-MM-DD').toDate(),
            type: task.type,
            time: task.time
          }));

          fetchedEvents.sort((a: Event, b: Event) => {
            const aDate = a.date;
            const bDate = b.date;

            if (
                aDate.getFullYear() === bDate.getFullYear() &&
                aDate.getMonth() === bDate.getMonth() &&
                aDate.getDate() === bDate.getDate()
            ) {
              const aTime = a.time ? moment(a.time, 'h:mm A') : moment('11:59 PM', 'h:mm A').add(1, 'minute');
              const bTime = b.time ? moment(b.time, 'h:mm A') : moment('11:59 PM', 'h:mm A').add(1, 'minute');
              return aTime.diff(bTime);
            }

            return aDate.getTime() - bDate.getTime();
          });

          setEvents(fetchedEvents);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    if (selectedDate) fetchTasks();

    const calendarContainer = document.querySelector('.calendar-container');

    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const month = parseInt(entry.target.getAttribute('data-month')!, 10);
              setSelectedMonth(month);
            }
          });
        },
        {
          root: calendarContainer,
          rootMargin: '-75% 0px -25% 0px',
          threshold: 0,
        },
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute('data-day') === '15') {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [selectedDate]);

  return (
    <div className="no-scrollbar calendar-container max-h-full overflow-y-scroll rounded-t-2xl bg-white pb-10 text-slate-800 shadow-xl">
      <div className="sticky -top-px z-50 w-full rounded-t-2xl bg-white px-5 pt-7 sm:px-8 sm:pt-8">
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select name="month" value={`${selectedMonth}`} options={monthOptions} onChange={handleMonthChange} />
            <button onClick={handleTodayClick} type="button" className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 lg:px-5 lg:py-2.5">
              Today
            </button>
            <button 
              type="button" 
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 sm:rounded-xl lg:px-5 lg:py-2.5"
              onClick={handleGlobalAddEventClick}
            >
              + Add Event
            </button>
          </div>
          <div className="flex w-fit items-center justify-between">
            <button
              onClick={handlePrevYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15 19-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">{year}</h1>
            <button
              onClick={handleNextYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg className="size-5 text-slate-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-b border-slate-200 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">
        {generateCalendar}
      </div>
      
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl/50">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Add Event - {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-500"
                onClick={handleCloseEventModal}
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleEventSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                  Event Title
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={newEvent.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter event title"
                    required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={newEvent.description}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                    placeholder="Event description (optional)"
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700">
                  Task Type
                </label>
                <select
                    id="type"
                    name="type"
                    value={newEvent.type}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="homework">Homework</option>
                  <option value="lecture/meetings">Lecture / Meetings</option>
                  <option value="general">General</option>
                  <option value="free time">Free Time</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="time" className="mb-2 block text-sm font-medium text-gray-700">
                  Time
                </label>
                <div className="flex gap-2">
                  <input
                      type="text"
                      name="time"
                      placeholder="e.g. 3:30"
                      value={newEvent.time.replace(/\s?(AM|PM)$/i, '')}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNewEvent((prev) => ({
                          ...prev,
                          time: `${value} ${prev.time.includes('PM') ? 'PM' : 'AM'}`.trim(),
                        }));
                      }}
                      className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                      name="amPm"
                      value={newEvent.time.includes('PM') ? 'PM' : 'AM'}
                      onChange={(e) => {
                        const amPm = e.target.value;
                        const timeOnly = newEvent.time.replace(/\s?(AM|PM)$/i, '');
                        setNewEvent((prev) => ({
                          ...prev,
                          time: `${timeOnly} ${amPm}`,
                        }));
                      }}
                      className="w-24 rounded-lg border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={handleCloseEventModal}
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Todo List Modal */}
      {showTodoListModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl/50">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  To-Do List - {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
                </h3>
                <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleCloseTodoListModal}
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="mb-2 text-lg font-medium text-gray-700">Events for this day:</h4>
              
              {getEventsForDate(selectedDate.getDate(), selectedDate.getMonth()).length > 0 ? (
                <ul className="space-y-2">
                  {getEventsForDate(selectedDate.getDate(), selectedDate.getMonth()).map((event) => (
                    <li key={event.id} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-gray-800">
                          {event.title}
                          <span className="ml-2 text-xs text-gray-500">({event.type})</span>
                          {event.time && <span className="ml-1 text-xs text-blue-500">@ {event.time}</span>}
                        </h5>

                        <button
                            onClick={() => deleteEvent(event.id)}
                            className="rounded-full p-1 text-red-500 hover:bg-red-50"
                        >
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No events scheduled for this day.</p>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleCloseTodoListModal}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTodoListModal(false);
                  setShowEventModal(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add New Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export interface SelectProps {
  name: string;
  value: string;
  label?: string;
  options: { 'name': string, 'value': string }[];
  onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const Select = ({ name, value, label, options = [], onChange, className }: SelectProps) => (
  <div className={`relative ${className}`}>
    {label && (
      <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="cursor-pointer rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:rounded-xl sm:py-2.5 sm:pl-3 sm:pr-8"
      required
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-1 sm:pr-2">
      <svg className="size-5 text-slate-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clipRule="evenodd" />
      </svg>
    </span>
  </div>
);