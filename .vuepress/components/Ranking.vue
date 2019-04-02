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
  export default {
    name: 'Ranking',
    data() {
      return {
        ranking: [],
      };
    },
    mounted() {
      this.$http.get(
        'https://table-soccer-catania.herokuapp.com?ranking'
      ).then((response) => {
        this.ranking = response.data.ranking;
      });
    },
  };
</script>
