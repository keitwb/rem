<template>
  <div>
    <ul>
      <li v-for="(filter, idx) in filters">
        <filter-item :filter="filter" @remove="removeFilter(idx)"></filter-item>
      </li>
    </ul>
    <filter-input ref="newInput" @change="newFilter($event)"></filter-input>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

import {Filter} from '@/util/filter';

import FilterItem from './FilterItem.vue';
import FilterInput from './FilterInput.vue';

export default Vue.extend({
  name: 'filter-bar',
  components: {
    FilterItem,
    FilterInput,
  },
  data: function() {
    return {
      filters: [],
    }
  },
  methods: {
    newFilter: function(filter: Filter) {
      this.filters.push(filter);
      this.$refs.newInput.clear();
    },

    removeFilter: function(index: number) {
      this.filters.splice(index, 1);
    },
  },
});
</script>
