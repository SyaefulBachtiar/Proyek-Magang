import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function Kalender({ close, refTrigger }) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(today); // Default ke hari ini
    const [startDate, setStartDate] = useState(today); // Default ke hari ini (bukan kemarin)
    const [dueDate, setDueDate] = useState(today); // Default ke hari ini
    const [dueTime, setDueTime] = useState("8:55");
    const [reminder, setReminder] = useState("None");
    const [selectionStep, setSelectionStep] = useState("none"); // 'none', 'start', 'due'
    const modalRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target) &&
                refTrigger &&
                !refTrigger.contains(e.target)
            ) {
                close();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef, refTrigger]);

    // Helper function to check if date is in the past
    const isPastDate = (date) => {
        const dateOnly = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        const todayOnly = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        return dateOnly < todayOnly;
    };

    // Get month and year for display
    const monthNames = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "October",
        "November",
        "Desember",
    ];

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToPreviousYear = () => {
        setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
    };

    const goToNextYear = () => {
        setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
    };

    // Get calendar days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Get previous month's last days
    const prevMonth = new Date(currentYear, currentMonth - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const calendarDays = [];

    // Previous month's trailing days
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
        calendarDays.push({
            day: daysInPrevMonth - i,
            isCurrentMonth: false,
            isNextMonth: false,
            date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
        });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: true,
            isNextMonth: false,
            date: new Date(currentYear, currentMonth, day),
        });
    }

    // Next month's leading days
    const remainingCells = 42 - calendarDays.length;
    for (let day = 1; day <= remainingCells; day++) {
        calendarDays.push({
            day,
            isCurrentMonth: false,
            isNextMonth: true,
            date: new Date(currentYear, currentMonth + 1, day),
        });
    }

    // Helper functions for date checking
    const isSelectedDate = (dateInfo) => {
        if (!dateInfo.isCurrentMonth) return false;

        const dateStr = dateInfo.date.toDateString();
        const isStartDate = startDate && dateStr === startDate.toDateString();
        const isDueDate = dueDate && dateStr === dueDate.toDateString();

        return isStartDate || isDueDate;
    };

    const isInRange = (dateInfo) => {
        if (!dateInfo.isCurrentMonth || !startDate || !dueDate) return false;

        const date = dateInfo.date;
        const start = new Date(startDate);
        const end = new Date(dueDate);

        return date > start && date < end;
    };

    const handleDateClick = (dateInfo) => {
        if (!dateInfo.isCurrentMonth) return;

        // Check if the date is in the past
        if (isPastDate(dateInfo.date)) {
            return; // Don't allow selection of past dates
        }

        const clickedDate = new Date(dateInfo.date);

        // If both checkboxes are unchecked, do nothing
        if (!startDate && !dueDate) {
            return;
        }

        // If only start date is checked
        if (startDate && !dueDate) {
            setStartDate(clickedDate);
            setSelectedDate(clickedDate);
            return;
        }

        // If only due date is checked
        if (!startDate && dueDate) {
            setDueDate(clickedDate);
            setSelectedDate(clickedDate);
            return;
        }

        // If both are checked, logika baru:
        // Jika tanggal diklik lebih dari due date, set sebagai due date
        // Jika tanggal diklik kurang dari due date, set sebagai start date
        if (startDate && dueDate) {
            if (clickedDate > dueDate) {
                // Tanggal diklik lebih dari due date, set sebagai due date baru
                setDueDate(clickedDate);
            } else if (clickedDate < dueDate) {
                // Tanggal diklik kurang dari due date, set sebagai start date baru
                setStartDate(clickedDate);
            } else {
                // Tanggal diklik sama dengan due date, tidak ada perubahan
                // Atau bisa diatur sesuai keinginan
            }
            setSelectedDate(clickedDate);
        }
    };

    const formatDateForInput = (date) => {
        if (!date) return "";
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    // Handle manual date input validation
    const handleDateInputChange = (value, isStartDate) => {
        if (value) {
            const [month, day, year] = value.split("/");
            if (month && day && year) {
                const newDate = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );

                // Check if the manually entered date is in the past
                if (!isPastDate(newDate)) {
                    if (isStartDate) {
                        setStartDate(newDate);
                    } else {
                        setDueDate(newDate);
                    }
                } else {
                    // If past date is entered, reset to today
                    if (isStartDate) {
                        setStartDate(today);
                    } else {
                        setDueDate(today);
                    }
                }
            }
        } else {
            if (isStartDate) {
                setStartDate(null);
            } else {
                setDueDate(null);
            }
        }
    };

    return (
        <div
            ref={modalRef}
            className="w-80 absolute top-11 right-36 bg-white rounded-lg border shadow-[0_5px_10px_rgba(0,0,0,0.25)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium text-black">Waktu</h2>
                <X
                    onClick={close}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    size={20}
                />
            </div>

            <div className="p-4">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToPreviousYear}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 17l-5-5 5-5M18 17l-5-5 5-5"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={goToPreviousMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    </div>

                    <span className="font-medium text-gray-700">
                        {monthNames[currentMonth]} {currentYear}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={goToNextMonth}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={goToNextYear}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5-5 5M6 7l5 5-5 5"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="mb-4">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div
                                    key={day}
                                    className="text-center text-xs font-medium text-gray-500 py-2"
                                >
                                    {day}
                                </div>
                            )
                        )}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.slice(0, 42).map((dateInfo, index) => {
                            const isSelected = isSelectedDate(dateInfo);
                            const inRange = isInRange(dateInfo);
                            const isStart =
                                startDate &&
                                dateInfo.isCurrentMonth &&
                                dateInfo.date.toDateString() ===
                                    startDate.toDateString();
                            const isEnd =
                                dueDate &&
                                dateInfo.isCurrentMonth &&
                                dateInfo.date.toDateString() ===
                                    dueDate.toDateString();
                            const isPast =
                                dateInfo.isCurrentMonth &&
                                isPastDate(dateInfo.date);

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(dateInfo)}
                                    disabled={isPast}
                                    className={`
                                        h-8 text-sm flex items-center justify-center rounded relative
                                        ${
                                            !dateInfo.isCurrentMonth
                                                ? "text-gray-300"
                                                : isPast
                                                ? "text-gray-300 cursor-not-allowed opacity-50"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-700"
                                        }
                                        ${
                                            isSelected && !isPast
                                                ? "bg-blue-500 text-white "
                                                : ""
                                        }
                                        ${
                                            inRange && !isPast
                                                ? "bg-blue-100 "
                                                : ""
                                        }
                                        ${
                                            isStart && !isPast
                                                ? "bg-blue-500 text-white"
                                                : ""
                                        }
                                        ${
                                            isEnd && !isPast
                                                ? "bg-yellow-300 text-white"
                                                : ""
                                        }
                                    `}
                                >
                                    {dateInfo.day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Start date */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <input
                            type="checkbox"
                            checked={!!startDate}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setStartDate(today); // Set to today instead of yesterday
                                } else {
                                    setStartDate(null);
                                    setSelectionStep("none");
                                }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Waktu Mulai
                        </span>
                    </div>
                    <div className="ml-7">
                        <input
                            type="text"
                            value={
                                startDate ? formatDateForInput(startDate) : ""
                            }
                            onChange={(e) =>
                                handleDateInputChange(e.target.value, true)
                            }
                            placeholder="M/D/YYYY"
                            disabled={!startDate}
                            className={`w-full border rounded px-3 py-1.5 text-sm ${
                                startDate
                                    ? "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }`}
                        />
                    </div>
                </div>

                {/* Due date */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <input
                            type="checkbox"
                            checked={!!dueDate}
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setDueDate(today);
                                } else {
                                    setDueDate(null);
                                    setSelectionStep("none");
                                }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                            Tenggat Waktu
                        </span>
                    </div>
                    <div className="ml-7 flex gap-2">
                        <input
                            type="text"
                            value={dueDate ? formatDateForInput(dueDate) : ""}
                            onChange={(e) =>
                                handleDateInputChange(e.target.value, false)
                            }
                            placeholder="M/D/YYYY"
                            disabled={!dueDate}
                            className={`flex-1 border rounded px-3 py-1.5 text-sm ${
                                dueDate
                                    ? "border-blue-400 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }`}
                        />
                        <input
                            type="text"
                            value={dueDate ? dueTime : ""}
                            onChange={(e) => setDueTime(e.target.value)}
                            placeholder="Jam"
                            disabled={!dueDate}
                            className={`w-full border rounded px-3 py-1.5 text-sm ${
                                dueDate
                                    ? "border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            }`}
                        />
                    </div>
                </div>

                {/* Reminder */}
                <div className="mb-4">
                    <label className="block mb-2 text-sm text-gray-700">
                        Set Pengingat Tenggat Waktu
                    </label>
                    <select
                        value={reminder}
                        onChange={(e) => setReminder(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>None</option>
                        <option>5 menit sebelumnya</option>
                        <option>10 menit sebelumnya</option>
                        <option>30 menit sebelumnya</option>
                        <option>1 jam sebelumnya</option>
                        <option>1 hari sebelumnya</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
