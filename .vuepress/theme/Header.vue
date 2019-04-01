<template>
    <b-navbar toggleable="md" variant="light" fixed="top" :sticky="true">
        <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

        <b-navbar-brand to="/">{{ $site.title }}</b-navbar-brand>

        <b-collapse is-nav id="nav_collapse">
            <b-navbar-nav>
                <b-nav-item to="/">Games</b-nav-item>
                <b-nav-item :to="$withBase('ranking.html')">Ranking</b-nav-item>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
  export default {
    name: 'Header',
  };
</script>
