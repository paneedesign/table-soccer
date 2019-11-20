<template>
  <div>
    <b-row class="masthead">
      <b-col lg="10" offset-lg="1">
        <b-jumbotron>
          <template slot="header">{{ $router.options.title }}</template>

          <template slot="lead">
            <!-- -->
          </template>

          <hr class="my-4">

          <router-link to="/games">
            <b-button variant="primary" class="mr-1">Games</b-button>
          </router-link>
          <router-link to="/ranking">
            <b-button variant="success">Ranking</b-button>
          </router-link>
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
