import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, Sparkles, Check } from 'lucide-react';
import { isDateBlocked } from '../data/houseData';

interface BookingCalendarProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onSelectDates: (checkIn: string, checkOut: string) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  checkIn,
  checkOut,
  onSelectDates,
}) => {
  // Use Sept 2026 as starting reference or checkIn month
  const initialDate = checkIn ? new Date(`${checkIn}T00:00:00`) : new Date(2026, 8, 1); // 8 is Sept
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(initialDate.getMonth()); // 0-11
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatDateStr = (year: number, month: number, day: number) => {
    const mStr = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
    const dStr = day < 10 ? `0${day}` : `${day}`;
    return `${year}-${mStr}-${dStr}`;
  };

  const handleDayClick = (dateStr: string) => {
    if (isDateBlocked(dateStr)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start new selection
      onSelectDates(dateStr, '');
    } else if (checkIn && !checkOut) {
      // Check if selected date is after check-in
      const dIn = new Date(`${checkIn}T00:00:00`);
      const dClick = new Date(`${dateStr}T00:00:00`);

      if (dClick <= dIn) {
        onSelectDates(dateStr, '');
      } else {
        // Check if any date in between is blocked
        let hasBlockedBetween = false;
        const temp = new Date(dIn);
        temp.setDate(temp.getDate() + 1);
        while (temp < dClick) {
          const y = temp.getFullYear();
          const m = temp.getMonth();
          const d = temp.getDate();
          if (isDateBlocked(formatDateStr(y, m, d))) {
            hasBlockedBetween = true;
            break;
          }
          temp.setDate(temp.getDate() + 1);
        }

        if (hasBlockedBetween) {
          // Restart with clicked date
          onSelectDates(dateStr, '');
        } else {
          onSelectDates(checkIn, dateStr);
        }
      }
    }
  };

  // Helper to test if a day is in range
  const isDateInRange = (dateStr: string) => {
    if (!checkIn) return false;
    if (checkIn && checkOut) {
      return dateStr > checkIn && dateStr < checkOut;
    }
    if (checkIn && !checkOut && hoverDate) {
      return dateStr > checkIn && dateStr <= hoverDate;
    }
    return false;
  };

  // Day rate estimate for display
  const getApproxRateForDay = (y: number, m: number, d: number) => {
    const dayOfWeek = new Date(y, m, d).getDay();
    const monthNum = m + 1;
    const isHighSeason = monthNum === 12 || monthNum === 1 || monthNum === 2 || monthNum === 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    if (monthNum === 12 && d >= 28) return 'R$750';
    if (isHighSeason) return isWeekend ? 'R$420' : 'R$360';
    return isWeekend ? 'R$320' : 'R$240';
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-6 shadow-xs">
      {/* Calendar Header with Controls */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
        <div>
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-600" />
            <span>{monthNames[currentMonth]} {currentYear}</span>
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Clique para selecionar o <strong>Check-in</strong> e depois o <strong>Check-out</strong>
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekdays header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((wd, i) => (
          <span
            key={wd}
            className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
              i === 0 || i === 6 ? 'text-amber-800' : 'text-stone-400'
            }`}
          >
            {wd}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty spaces */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-12 sm:h-14" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
          const blocked = isDateBlocked(dateStr);
          const isCheckIn = checkIn === dateStr;
          const isCheckOut = checkOut === dateStr;
          const inRange = isDateInRange(dateStr);
          const approxRate = getApproxRateForDay(currentYear, currentMonth, dayNum);

          let cellClass = 'relative h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center text-xs transition-all select-none ';

          if (blocked) {
            cellClass += 'bg-stone-100/90 text-stone-400 cursor-not-allowed line-through opacity-70';
          } else if (isCheckIn || isCheckOut) {
            cellClass += 'bg-stone-900 text-white font-bold shadow-md ring-2 ring-amber-400/80 z-10';
          } else if (inRange) {
            cellClass += 'bg-amber-100/90 text-amber-950 font-semibold rounded-none';
          } else {
            cellClass += 'hover:bg-amber-50/80 text-stone-800 cursor-pointer border border-transparent hover:border-amber-200';
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={blocked}
              onClick={() => handleDayClick(dateStr)}
              onMouseEnter={() => !blocked && setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              className={cellClass}
              title={blocked ? 'Data indisponível / já reservada' : `Disponível - aprox. ${approxRate}`}
            >
              <span className="text-xs sm:text-sm">{dayNum}</span>
              {!blocked && (
                <span className={`text-[9px] sm:text-[10px] leading-tight mt-0.5 ${
                  isCheckIn || isCheckOut ? 'text-amber-300' : 'text-stone-500 font-mono'
                }`}>
                  {approxRate}
                </span>
              )}
              {blocked && (
                <span className="text-[8px] text-rose-500 font-semibold uppercase leading-tight mt-0.5">
                  Ocupado
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-600">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-stone-900" />
          <span>Sua Seleção</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-amber-100 border border-amber-300" />
          <span>Período da Estadia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-stone-100 border border-stone-200 line-through text-[8px] flex items-center justify-center text-stone-400">✕</span>
          <span>Reservado / Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-white border border-stone-300" />
          <span>Disponível</span>
        </div>
      </div>

      {/* Clear dates button if selected */}
      {(checkIn || checkOut) && (
        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => onSelectDates('', '')}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium underline"
          >
            Limpar seleção de datas
          </button>
        </div>
      )}
    </div>
  );
};
