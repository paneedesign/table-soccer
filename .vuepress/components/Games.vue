<template>
    <div>
        <b-row>
            <b-col lg="10" offset-lg="1">
                <b-table striped hover :items="games"></b-table>
            </b-col>
        </b-row>
    </div>
</template>

<script>
  import SampleData from '../public/api/games.json';

  export default {
    name: 'Games',
    data() {
      return {
        games: [],
      };
    },
    mounted() {
      this.games = SampleData.games;

      /*
      this.$http.get(this.$withBase('/api/games.json')).then((response) => {
        this.games = response.data.games;
      });
      */
    },
  };
</script>
