<template>
  <div class="py-2">
    <filter-bar></filter-bar>
  </div>
  <!--<property-list 
    :properties="properties$ | async"
    error="error"
    hasMore="hasMore"
    (fetchMore)="this.getNextPage()"
  ></property-list>-->
</template>

<script lang="ts">
import Vue from 'vue';

import FilterBar from '@/components/form/FilterBar.vue';

export default Vue.extend({
  name: 'properties',
  components: {
    FilterBar,
  },
    //const [fetches$, properties$, getNextPage] = this.syncer.getSyncedList<Property>(
    //  Property.collection, {
    //  filter:    null,
    //  pageSize:  10,
    //  sortBy:    "name",
    //  sortOrder: "asc"});

    //getNextPage();
    //this.getNextPage = getNextPage;
    //this.properties$ = properties$;

    //this.propertiesSub = fetches$.subscribe(
    //  _ => undefined,
    //  err => { this.error = err; },
    //  () => { this.hasMore = false });
});
</script>
