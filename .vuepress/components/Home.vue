<template>
    <div>
        <b-row class="masthead">
            <b-col lg="10" offset-lg="1">
                <b-jumbotron>
                    <template slot="header">{{ $site.title }}</template>

                    <template slot="lead">
                        <!-- -->
                    </template>

                    <hr class="my-4">

                    <b-button variant="primary" :to="$withBase('games.html')">Games</b-button>
                    <b-button variant="success" :to="$withBase('ranking.html')">Ranking</b-button>
                </b-jumbotron>
            </b-col>
        </b-row>
    </div>
</template>

<script>
  export default {
    name: 'Home',
  };
</script>
