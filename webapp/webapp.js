/* global Vue, VueRouter, Vuetify */
const ContributionPage = () => import('./pages/contribution-page.js')
const ContributorPage = () => import('./pages/contributor-page.js')
const ContributorStatsPage = () => import('./pages/contribution-stats-page.js')
const TexturePage = () => import('./pages/texture-page.js')

Vue.config.devtools = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

const routes = [
	{ path: '/', redirect: '/contributions/' },
	{ path: '/contributions/', component: ContributionPage },
	{ path: '/contributors/', redirect: '/contributors/all/' },
  { path: '/contributors/:type?/:name?/', component: ContributorPage },
  { path: '/contributions-stats/', component: ContributorStatsPage },
  { path: '/textures/', redirect: '/textures/all/' },
  { path: '/textures/:type?/:name?/', component: TexturePage },
]

const router = new VueRouter({ routes })

// eslint-disable-next-line no-unused-vars
let v = new Vue({
	router,
	el: '#app',
  data: {
    tabs: [
      { to : "/contributions/", label: "Contributions" },
      { to: "/contributors/", label: "Contributors" },
      { to: "/contributions-stats/", label: "Contributions Stats" },
      { to: "/textures/", label: "Textures" }
    ],
    currenttab: undefined,
    bg: 'transparent',
    snackbar: {
      show: false,
      message: '',
      color: '#222',
      timeout: 20000
    }
  },
  computed: {
    tabselected: function() {
      let res = undefined;

      let i = 0;
      while(i < this.tabs.length && !res) {
        if(this.$route.path.startsWith(this.tabs[i].to))
          res = this.tabs[i].to
        ++i;
      }

      if(!res)
        res = this.tabs[0].to;
      
      return res;
    },
    year: function() {
      return new Date().getFullYear()
    }
  },
  methods: {
    changeColor() {
      if (
        document.body.scrollTop > 100 ||
        document.documentElement.scrollTop > 100
      ) {
        this.bg = '';
      } else {
        this.bg = 'transparent';
      }
    },
    showSnackBar: function(message, color = '#222', timeout = 2000) {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.timeout = timeout
      this.snackbar.show = true
    }
  },
  mounted: function() {
    window.onscroll = () => {
      this.changeColor()
    }
  },
  vuetify: new Vuetify({
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: '#fafafa',
          accent:  '#5e3631',
          success: '#22a831',
        },
      }
    },
  }),
})