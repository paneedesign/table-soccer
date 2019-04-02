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
  export default {
    name: 'Games',
    data() {
      return {
        games: [],
      };
    },
    mounted() {
      this.$http.get(
        'https://raw.githubusercontent.com/paneedesign/table-soccer/tree/client/sample-api/games.json'
      ).then((response) => {
        this.games = response.data.games;
      });
    },
  };
</script>
