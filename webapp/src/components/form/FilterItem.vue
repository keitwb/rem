<template>
  <div v-if="!editing" @dblclick="enableEditing">
    <span>{{ filter.asString }}</span>
    <button type="button" class="close" @click="remove">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <filter-input v-else v-click-outside="disableEditing" :filter="filter" @change="update($event)"></filter-input>
</template>

<script lang="ts">
import Vue from 'vue';
import ClickOutside from 'vue-click-outside';

import {Filter} from '@/util/filter';

import FilterInput from './FilterInput.vue';

export default Vue.extend({
  props: {
    filter: Filter,
  },
  data: function() {
    return {
      editing: false
    }
  },
  methods: {
    enableEditing: function() {
      this.editing = true;
    },

    remove: function() {
      this.$emit('remove');
    },

    disableEditing: function() {
      this.editing = false;
    },

    update: function(filter: Filter) {
      this.disableEditing();
      this.$emit('change', filter);
    }
  },
  components: {
    FilterInput,
  },
  directives: {
    ClickOutside,
  },
});
</script>
