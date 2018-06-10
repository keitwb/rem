<template>
  <filter-input />
</template>

<script lang="ts">
import Vue from 'vue'

import FilterBar from './form/FilterBar.vue';

export default Vue.extend({
  name: 'property-toolbar',
  props: [],
  methods: {
    updateFilter: function() {
      this.$emit('filter', newFilter);
    },
  },
  components: {
    FilterBar,
  },
});
</script>


