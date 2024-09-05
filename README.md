
# Vue Hijri Picker

Vue Hijri Picker is a Vue 3 date picker component that supports both Hijri (Islamic) and Gregorian calendars. The component allows users to select a date and time, and provides options to switch between the two calendar systems.

## Features

- Hijri (Islamic) and Gregorian calendar support
- Time selection (hours, minutes, seconds)
- Easy to switch between Hijri and Gregorian calendars
- Configurable in English and Arabic languages
- Customizable date and time formatting

## Installation

To install Vue Hijri Picker, you can use npm:

```bash
npm install vue-hijri-picker
```

## Usage

Here is a basic example of how to use the Vue Hijri Picker in your Vue 3 project:

```vue
<template>
    <DatePicker 
      :initialType="calendarType" 
      :withTime="true" 
      v-model="selectedDate" 
      :language="'en'" 
    />
    <div v-if="selectedDate">
      <h3>Selected Date & Time:</h3>
      <p>{{ selectedDate }}</p>
    </div>
</template>

<script>
  import 'vue-hijri-picker/dist/style.css';
  import DatePicker from 'vue-hijri-picker';

export default {
  components: {
    DatePicker,
  },
  data() {
    return {
      calendarType: 'gregorian',
      selectedDate: null,
    };
  },
};
</script>

```

## Props

- `initialType` (String): Specifies the initial calendar type. Can be 'gregorian' or 'hijri'. Default is 'gregorian'.
- `withTime` (Boolean): Enables time selection (hours, minutes, seconds). Default is `false`.
- `modelValue` (String): The selected date and time value in UTC format.
- `language` (String): The language for the UI. Can be 'en' for English or 'ar' for Arabic. Default is 'en'.
- `format` (String): The format for displaying the date and time.

## Events

- `update:modelValue`: Emits the selected date and time value in UTC format.
- `cancel`: Emits when the date picker is closed without confirming a date.

## License

This project is licensed under the MIT License.
