/* global axios, Vue */

export default {
	name: 'contribution-page',
	template: `
  <v-container>
    <div class="text-h4 py-4">
      Contributions
    </div>
    <div class="my-2 text-h5">Resolution</div>
    <div>
      <v-btn v-for="(value, key, index) in resolutions" :key="index" class="my-2 mr-1">
        <v-checkbox v-model="resolutions[key]" :disabled="key != all_res && resolutions[all_res] == true" :label="key" :id="key"></v-checkbox>
      </v-btn>
    </div>
    <div class="my-2 text-h5">Contributor</div>
    <v-responsive
      class="overflow-y-auto"
      :max-height="maxheight"
    >
      <v-list v-if="contributors.length" two-line color="transparent">
        <v-row>
          <v-col :cols="12/listColumns" xs="1"
            v-for="(contrib_arr, index) in splittedContributors"
            :key="index"
          >
            <v-card
              elevation="2"
              class="my-2"
              v-for="contrib in contrib_arr"
              :key="contrib.id"
            >
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title v-text="contrib.username"></v-list-item-title>
                  <v-list-item-subtitle v-text="contrib.occurences + ' contributions'"></v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-avatar height="38" width="38">
                  <v-img v-if="contrib.uuid" :src="'https://visage.surgeplay.com/head/48/' + contrib.uuid" />
                  <v-icon v-else style="background: #4e4e4e">mdi-account</v-icon>
                </v-list-item-avatar>
              </v-list-item>
            </v-card>
          </v-col>
        </v-row>
      </v-list>
    </v-responsive>
  </v-container>`,
	data() {
		return {
      maxheight: 170,
      all_res: 'all',
      resolutions: {},
      contributors: [],
      contributors_selected: {}
    }
	},
  computed: {
    listColumns: function() {
      let columns = 1

      if(this.$vuetify.breakpoint.mdAndUp && this.contributors.length >= 6) {
        columns = 2
        if(this.$vuetify.breakpoint.lgAndUp && this.contributors.length >= 21) {
          columns = 3
        }
      }

      return columns
    },
    splittedContributors: function() {
      let res = []
      for(let col = 0; col < this.listColumns; ++col) {
        res.push([])
      }

      let arrayIndex = 0;
      this.contributors.forEach(contrib => {
        res[arrayIndex].push(contrib)
        arrayIndex = (arrayIndex + 1) % this.listColumns
      })

      return res
    }
  },
  methods: {
    getRes: function() {
      axios.get('/contributions/res')
        .then(res => {
          res.data.forEach(r => this.resolutions[r] = false)
          this.$forceUpdate()
        })
    },
    getAuthors: function() {
      axios.get('/contributions/authors/')
        .then(res => {
          this.contributors = res.data
        })
        .catch(err => {
          console.trace(err)
        })
    },
    getContributions: function() {
      axios.get('/contributions/get/', {
        params: {
          resolutions: this.searchForm.resolutions,
          authors: this.searchForm.authors
        }
      })
      .then(res => {
        this.contributions = res
      })
      .catch(err => { this.$root.showSnackBar(err, 'error') })
    }
  },
  created: function() {
    Vue.set(this.resolutions, this.all_res, true)
  },
  mounted: function() {
    this.getRes()
    this.getAuthors()
  }
}