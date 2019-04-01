<template>
    <div>
        <b-row>
            <b-col lg="10" offset-lg="1">
                <b-table striped hover :items="ranking"></b-table>
            </b-col>
        </b-row>
    </div>
</template>

<script>
  import SampleData from '../public/api/ranking.json';

  export default {
    name: 'Ranking',
    data() {
      return {
        ranking: [],
      };
    },
    mounted() {
      this.ranking = SampleData.ranking;

      /*
      this.$http.get(this.$withBase('/api/ranking.json')).then((response) => {
        this.ranking = response.data.ranking;
      });
      */
    },
  };
</script>
