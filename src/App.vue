<template>
  <div id="app">
    <DatePicker
      v-model="selectedDate"
      :initialType="calendarType"
      :withTime="true"
      :language="'ar'"
    />
    <div v-if="selectedDate">
      <h3>Selected Date & Time (UTC):</h3>
      <p>{{ selectedDate }}</p>
    </div>
  </div>
</template>

<script>
import DatePicker from './components/DatePicker.vue';

export default {
  name: 'App',
  components: {
    DatePicker,
  },
  data() {
    return {
      calendarType: 'gregorian',
      selectedDate: '2000/10/10 10:10:00',
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 40px;
}
</style>
