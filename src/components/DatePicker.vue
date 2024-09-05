<template>
  <div>
    <!-- Input field that triggers the date picker dialog -->
    <div class="datepicker-input" @click="openDatePicker">
      <input
        type="text"
        :value="formattedDate"
        placeholder="Select date"
        readonly
      />
      <span class="datepicker-icon">📅</span>
    </div>

    <!-- Date picker dialog -->
    <div class="datepicker-overlay" v-if="showPicker">
      <div class="datepicker-dialog">
        <div class="datepicker-container">
          <div class="calendar">
            <div class="calendar-header">
              <button v-if="isYearSelection || isMonthSelection" @click="prevYearsOrMonths">«</button>
              <button v-else @click="prevMonth">«</button>
              <transition name="fade">
                <span @click="toggleYearSelection">{{ currentMonth }} {{ currentYear }}</span>
              </transition>
              <button v-if="isYearSelection || isMonthSelection" @click="nextYearsOrMonths">»</button>
              <button v-else @click="nextMonth">»</button>
            </div>

            <transition name="fade">
              <div v-if="isYearSelection" class="year-selection">
                <div
                  v-for="year in visibleYears"
                  :key="year"
                  :class="{ selected: year === currentYear }"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="isMonthSelection" class="month-selection">
                <div
                  v-for="(month, index) in months"
                  :key="month"
                  :class="{ selected: index + 1 === currentMonth }"
                  @click="selectMonth(index)"
                >
                  {{ month }}
                </div>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="!isYearSelection && !isMonthSelection" class="calendar-grid">
                <div v-for="day in daysOfWeek" :key="day" class="calendar-day-header">
                  {{ day }}
                </div>
                <div
                  v-for="day in daysInMonth"
                  :key="day.date"
                  :class="['calendar-day', { selected: isSelected(day.date) }]"
                  @click="selectDate(day.date)"
                >
                  {{ day.day }}
                </div>
              </div>
            </transition>
          </div>

          <div v-if="withTime" class="time-selection">
            <div class="time-scroller">
              <div class="time-label">{{ translations.hh }}</div>
              <transition name="fade">
                <ul class="time-list">
                  <li
                    v-for="hour in 24"
                    :key="hour"
                    :class="{ selected: selectedHour === hour - 1 }"
                    @click="selectHour(hour - 1)"
                  >
                    {{ pad(hour - 1) }}
                  </li>
                </ul>
              </transition>
            </div>
            <div class="time-scroller">
              <div class="time-label">{{ translations.mm }}</div>
              <transition name="fade">
                <ul class="time-list">
                  <li
                    v-for="minute in 60"
                    :key="minute"
                    :class="{ selected: selectedMinute === minute - 1 }"
                    @click="selectMinute(minute - 1)"
                  >
                    {{ pad(minute - 1) }}
                  </li>
                </ul>
              </transition>
            </div>
            <div class="time-scroller">
              <div class="time-label">{{ translations.ss }}</div>
              <transition name="fade">
                <ul class="time-list">
                  <li
                    v-for="second in 60"
                    :key="second"
                    :class="{ selected: selectedSecond === second - 1 }"
                    @click="selectSecond(second - 1)"
                  >
                    {{ pad(second - 1) }}
                  </li>
                </ul>
              </transition>
            </div>
          </div>
        </div>

        <div class="actions">
          <transition name="fade">
            <button @click="confirmSelection">{{ translations.ok }}</button>
          </transition>
          <transition name="fade">
            <button @click="cancelSelection">{{ translations.cancel }}</button>
          </transition>
          <transition name="fade">
            <button @click="switchCalendar">{{ isHijri ? translations.switchToGregorian : translations.switchToHijri }}</button>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import moment from 'moment-hijri';
import { format, addMonths, subMonths } from 'date-fns';

const props = defineProps({
  initialType: {
    type: String,
    default: 'gregorian',
  },
  withTime: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en',
  },
  format: {
    type: String,
    default: '', // Allows passing a custom format
  },
});

const emit = defineEmits(['update:modelValue', 'cancel']);

const isHijri = ref(props.initialType === 'hijri');
const showPicker = ref(false); // Initially hidden
const currentDate = ref(isHijri.value ? moment().startOf('day').toDate() : new Date());
const selectedDate = ref(currentDate.value);
const selectedHour = ref(0);
const selectedMinute = ref(0);
const selectedSecond = ref(0);
const isYearSelection = ref(false);
const isMonthSelection = ref(false);
const yearRangeStart = ref(isHijri.value ? 1400 : 2000);

const translations = computed(() => {
  return props.language === 'ar'
    ? {
      ok: 'موافق',
      cancel: 'إلغاء',
      switchToGregorian: 'التبديل إلى الميلادي',
      switchToHijri: 'التبديل إلى الهجري',
      hh: 'ساعة',
      mm: 'دقيقة',
      ss: 'ثانية',
      monthsGregorian: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      monthsHijri: ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'],
      daysOfWeek: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    }
    : {
      ok: 'Ok',
      cancel: 'Cancel',
      switchToGregorian: 'Switch to Gregorian',
      switchToHijri: 'Switch to Hijri',
      hh: 'HH',
      mm: 'MM',
      ss: 'SS',
      monthsGregorian: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      monthsHijri: ['Muharram', 'Safar', 'Rabi I', 'Rabi II', 'Jumada I', 'Jumada II', 'Rajab', 'Shaaban', 'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'],
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    };
});

const currentMonth = computed(() => {
  if (isHijri.value) {
    return translations.value.monthsHijri[moment(selectedDate.value).iMonth()];
  } else {
    return translations.value.monthsGregorian[selectedDate.value.getMonth()];
  }
});

const currentYear = computed(() => {
  return isHijri.value ? moment(selectedDate.value).format('iYYYY') : format(selectedDate.value, 'yyyy');
});

const visibleYears = ref([]);

const months = computed(() => {
  return isHijri.value ? translations.value.monthsHijri : translations.value.monthsGregorian;
});

const daysOfWeek = computed(() => {
  return translations.value.daysOfWeek;
});

const daysInMonth = computed(() => {
  const days = [];
  const startOfMonth = isHijri.value
    ? moment(selectedDate.value).startOf('iMonth')
    : new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1);

  const startDay = isHijri.value
    ? startOfMonth.isoWeekday()
    : startOfMonth.getDay() === 0 ? 7 : startOfMonth.getDay();

  for (let i = 0; i < startDay - 1; i++) {
    days.push({ day: '', date: null });
  }

  const totalDays = isHijri.value
    ? moment(selectedDate.value).iDaysInMonth()
    : new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= totalDays; day++) {
    const date = isHijri.value
      ? moment(startOfMonth).iDate(day).toDate()
      : new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), day);
    days.push({ day, date });
  }

  return days;
});

const pad = (value) => String(value).padStart(2, '0');

const prevMonth = () => {
  selectedDate.value = isHijri.value
    ? moment(selectedDate.value).subtract(1, 'iMonth').toDate()
    : subMonths(selectedDate.value, 1);
  updateDate();
};

const nextMonth = () => {
  selectedDate.value = isHijri.value
    ? moment(selectedDate.value).add(1, 'iMonth').toDate()
    : addMonths(selectedDate.value, 1);
  updateDate();
};

const selectYear = (year) => {
  if (isHijri.value) {
    selectedDate.value = moment(selectedDate.value).iYear(year).toDate();
  } else {
    selectedDate.value.setFullYear(year);
  }
  isYearSelection.value = false; // Exit Year Selection
  isMonthSelection.value = true; // Move to Month Selection
  updateDate(); // Ensure the date is updated after selecting the year
};

const selectMonth = (monthIndex) => {
  if (isHijri.value) {
    selectedDate.value = moment(selectedDate.value).iMonth(monthIndex).startOf('iMonth').toDate();
  } else {
    selectedDate.value.setMonth(monthIndex);
  }
  isMonthSelection.value = false; // Exit Month Selection
  updateDate(); // Ensure the date is updated after selecting the month
};

const selectDate = (date) => {
  if (date) {
    selectedDate.value = date;
  }
};

const selectHour = (hour) => {
  selectedHour.value = hour;
  selectedDate.value.setHours(hour);
};

const selectMinute = (minute) => {
  selectedMinute.value = minute;
  selectedDate.value.setMinutes(minute)
};

const selectSecond = (second) => {
  selectedSecond.value = second;
  selectedDate.value.setSeconds(second);
};

const switchCalendar = () => {

  // Toggle between Hijri and Gregorian
  isHijri.value = !isHijri.value;

  // Convert the selected date between Gregorian and Hijri
  let convertedDate;
  if (isHijri.value) {
    convertedDate = moment(selectedDate.value).format('iYYYY/iMM/iDD');
    selectedDate.value = moment(convertedDate, 'iYYYY/iMM/iDD').toDate();
  } else {
    // Parse Hijri date back to Gregorian safely
    try {
      convertedDate = moment(selectedDate.value, 'iYYYY/iMM/iDD').format('YYYY-MM-DD');
      selectedDate.value = new Date(convertedDate);
    } catch (error) {
      console.error("Error converting Hijri date to Gregorian:", error);
    }
  }

  // Recalculate the year range after switching calendars
  yearRangeStart.value = isHijri.value
    ? moment(selectedDate.value).iYear() - (moment(selectedDate.value).iYear() % 10)
    : selectedDate.value.getFullYear() - (selectedDate.value.getFullYear() % 10);

  // Update the visible years to reflect the new calendar
  updateVisibleYears();

  // Ensure we stay in the correct view
  nextTick(() => {
    if (isYearSelection.value) {
      isYearSelection.value = true;
    } else if (isMonthSelection.value) {
      isMonthSelection.value = true;
    }
  });
};

const isSelected = (date) => {
  return date && date.toDateString() === selectedDate.value.toDateString();
};

  const confirmSelection = () => {
  const finalDate = new Date(selectedDate.value);
  finalDate.setHours(selectedHour.value, selectedMinute.value, selectedSecond.value, 0);
  const adjustedDate = new Date(
    Date.UTC(
      finalDate.getFullYear(),
      finalDate.getMonth(),
      finalDate.getDate(),
      finalDate.getHours(),
      finalDate.getMinutes(),
      finalDate.getSeconds()
    )
  );
  emit('update:modelValue', adjustedDate.toISOString());
  showPicker.value = false;
};

const cancelSelection = () => {
  emit('cancel');
  showPicker.value = false;
};

const toggleYearSelection = () => {
  isYearSelection.value = !isYearSelection.value;
  isMonthSelection.value = false;
  if (isYearSelection.value) {
    updateVisibleYears();
  }
};

const toggleMonthSelection = () => {
  isMonthSelection.value = !isMonthSelection.value;
  isYearSelection.value = false;
};

const prevYearsOrMonths = () => {
  yearRangeStart.value -= 10;
  updateVisibleYears();
};

const nextYearsOrMonths = () => {
  yearRangeStart.value += 10;
  updateVisibleYears();
};

const updateDate = () => {
  selectedDate.value = new Date(selectedDate.value);

  calculateDaysInMonth();  // Recalculate the days in the current month
};

const updateVisibleYears = () => {
  visibleYears.value = Array.from({ length: 10 }, (_, i) => yearRangeStart.value + i);
};

const calculateDaysInMonth = () => {
  const days = [];
  const startOfMonth = isHijri.value
    ? moment(selectedDate.value).startOf('iMonth')
    : moment(selectedDate.value).startOf('month');

  const startDay = isHijri.value
    ? startOfMonth.isoWeekday() % 7
    : startOfMonth.day();

  for (let i = 0; i < startDay; i++) {
    days.push({ day: '', date: null });
  }

  const totalDays = isHijri.value
    ? moment(selectedDate.value).iDaysInMonth()
    : moment(selectedDate.value).daysInMonth();

  for (let day = 1; day <= totalDays; day++) {
    const date = isHijri.value
      ? moment(startOfMonth).iDate(day).toDate()
      : moment(startOfMonth).date(day).toDate();
    days.push({ day, date });
  }

  daysInMonth.value = days;
};

const openDatePicker = () => {
  showPicker.value = true;
};


const formattedDate = computed(() => {
  const defaultFormat = isHijri.value ? 'iYYYY/iMM/iDD' : 'yyyy-MM-dd';
  const timeFormat = isHijri.value ? 'iYYYY/iMM/iDD HH:mm:ss' : 'yyyy-MM-dd HH:mm:ss';

  // Use the provided format if available; otherwise, fallback to defaults
  const formatString = props.format ? props.format : (props.withTime ? timeFormat : defaultFormat);
  selectedDate.value.setHours(selectedHour.value, selectedMinute.value, selectedSecond.value, 0);

  return isHijri.value
    ? moment(selectedDate.value).format(formatString)
    : format(selectedDate.value, formatString);
});


onMounted(() => {
  if (props.modelValue) {
    selectedDate.value = isHijri.value
      ? moment.utc(props.modelValue).local().toDate()
      : new Date(props.modelValue);

    selectedHour.value = selectedDate.value.getHours();
    selectedMinute.value = selectedDate.value.getMinutes();
    selectedSecond.value = selectedDate.value.getSeconds();
  } else {
    selectedDate.value = isHijri.value ? moment().startOf('day').toDate() : new Date();
  }
  updateVisibleYears();
});

</script>