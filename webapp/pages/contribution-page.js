/* global axios, Vue */

export default {
	name: 'contribution-page',
	template: `
  <v-container>
    <div class="text-h4 py-4">
      Contributions
    </div>
    <div class="my-2 text-h5">Resolution</div>
    <v-btn
      v-for="(resobj, index) in form.resolutions"
      :key="resobj.key"
      class="my-2 mr-1"
    >
      <v-checkbox
        v-model="resobj.selected"
        :disabled="resobj.key != all_res && (form.resolutions[0] !== undefined && form.resolutions[0].selected == true)"
        :label="resobj.key"
        :id="resobj.key"
      ></v-checkbox>
    </v-btn>
    <div class="my-2 text-h5">Contributor</div>
      <v-autocomplete
      v-model="contributors_selected"
      :items="contributors"
      :loading="contributors.length == 0"
      item-text="username"
      item-value="id"
      label="Please choose at least one contributor"
      multiple
      chips
    >
        <!-- SELECTED THINGY -->
        <template v-slot:selection="data">
          <v-chip
            :key="data.item.id"
            v-bind="data.attrs"
            :input-value="data.selected"
            :disabled="data.disabled"
            close
            @click:close="remove(data.item.id)"
          >
            <v-avatar
              :class="{ accent: data.item.uuid == undefined, 'text--white': true }"
              :tile="data.item.uuid == undefined"
              left
            >
              <template v-if="data.item.uuid != undefined">
                <v-img eager
                  :src="'https://visage.surgeplay.com/face/24/' + data.item.uuid"
                  :alt="data.item.username.slice(0, 1).toUpperCase()"
                />
              </template>
              <template v-else>
                {{ data.item.username.slice(0, 1) }}
              </template>
            </v-avatar>
            {{ data.item.username }}
          </v-chip>
        </template>

        <!-- LIST ITEM PART -->
        <template v-slot:item="data">
        <template v-if="typeof data.item !== 'object'">
          <v-list-item-content v-text="data.item"></v-list-item-content>
        </template>
        <template v-else>
          <v-list-item-content>
            <v-list-item-title v-text="data.item.username"></v-list-item-title>
            <v-list-item-subtitle v-html="data.item.occurences + ' contribution' + (data.item.occurences > 1 ? 's' : '')"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-avatar :style="{ 'background': data.item.uuid ? 'transparent' : '#4e4e4e' }">
            <template v-if="data.item.uuid">
              <v-img eager :src="'https://visage.surgeplay.com/head/48/' + data.item.uuid" />
            </template>
            <div v-else>{{ data.item.username.slice(0, 1) }}</div>
          </v-list-item-avatar>
        </template>
      </template>
    </v-autocomplete>
    <v-btn block color="secondary" @click="getContributions()" :disabled="searchDisabled">Search contributions<v-icon right dark>mdi-magnify</v-icon></v-btn>
  </v-container>`,
	data() {
		return {
      maxheight: 170,
      form: {
        resolutions: []
      },
      all_res: 'all',
      resolutions: {},
      contributors: [],
      contributors_selected: [],
      search: {
        searching: false,
        search_results: []
      }
    }
	},
  computed: {
    searchDisabled: function() {
      const res_selected = this.form.resolutions.reduce((a, c) => a || c.selected, false) == false
      const result = this.search.searching || res_selected || this.contributors_selected.length == 0
      return result
    },
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
          res.data.forEach(r => {
            this.addRes(r)
          })
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
    },
    remove (id) {
      const index = this.contributors_selected.indexOf(id)
      if (index >= 0) this.contributors_selected.splice(index, 1)
    },
    addRes(name, value=false) {
      this.form.resolutions.push({
        key: name,
        selected: value
      })
    }
  },
  created: function() {
    this.addRes(this.all_res, true)
  },
  mounted: function() {
    this.getRes()
    this.getAuthors()
  }
}