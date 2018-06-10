<template>
  <input 
    ref="editor"
    type="text"
    class="form-control"
    v-model="input"
    @keyup.enter="completeInput()" />
</template>

<script lang="ts">
import Vue from 'vue';

import {Filter} from '@/util/filter';

export default Vue.extend({
  name: 'filter-input',
  props: {
    filter: Filter,
    suggestor: Suggestor,
  },
  data() {
    return {
      input: this.filter ? this.filter.asString : '',
    };
  },
  methods: {
    selectValue: function() {
      if (this.filter.key) {
        this.$refs.editor.setSelectionRange(
          this.filter.key.length + 2, this.input.length);
      } else {
        this.$refs.editor.select();
      }
    },
    completeInput: function() {
      const filter = Filter.fromString(this.input);
      this.$emit('change', filter);
    },

    clear: function() {
      this.input = '';
    },
  },
  watch: {
    filter: function(filter: Filter) {
      console.log(filter);
    },
  },
});
</script>
