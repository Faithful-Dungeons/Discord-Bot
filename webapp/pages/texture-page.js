/* global axios, Vue */

export default {
  name: 'texture-page',
  template: `
  <v-container>
    <div class="text-h4 py-4">
      Textures
    </div>
    <div class="my-2 text-h5">Select texture type</div>
    <div><v-btn v-for="t in texturesTypes" :key="t" :class="{ 'my-2': true, 'mr-1': true, 'v-btn--active': t === 'All' && !type && !!name }" :to="textureURL(t)" :exact="t == 'All'">{{ t }}</v-btn></div>
    <div class="my-2 text-h5">Search</div>
      <div class="my-2">
        <v-text-field
          v-model="search"
          :append-outer-icon="search ? 'mdi-send' : undefined"
          filled
          clear-icon="mdi-close"
          clearable
          placeholder="Search texture name"
          type="text"
          v-on:keyup.enter="startSearch"
          @click:append-outer="startSearch"
          @click:clear="clearSearch"
        ></v-text-field>
      </div>

    <div>
      <v-btn block color="secondary" @click="openDialog()">Add new Texture <v-icon right dark>mdi-plus</v-icon></v-btn>

      <div class="my-2 text-h5">Texture results</div>
      <v-list v-if="Object.keys(textures).length" two-line color="rgba(255, 255, 255, 0.08)" >
        <v-row><v-col :cols="6" xs="1"
            v-for="(textures_arr, index) in splittedResults"
            :key="index"
          >
          <v-list-item
            v-for="texture in textures_arr"
            :key="texture.id"
          >
            <v-list-item-content :style="{ 'display': 'contents' }">
              <v-list-item-avatar tile :style="{ 'background': '#4e4e4e', 'max-width': 'fit-content', 'padding': '0 10px 0 10px', 'border-radius': '4px !important' }" >#{{ texture.id }}</v-list-item-avatar>
              <v-list-item-title>
                {{ texture.name }}
                <v-list-item-subtitle v-text="(texture.type||[]).join(', ')"></v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              <v-btn icon @click="openDialog(contrib)">
                <v-icon color="white lighten-1">mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>
            <v-list-item-action>
              <v-btn icon @click="askRemove(contrib)">
                <v-icon color="white lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-col></v-row>
      </v-list>
      <div v-else><i>No results found.</i></div>
      </div>
    </div>
  </v-container>`,
  data() {
    return {
      loadMore: true,
      recompute: false,
      maxheight: 170,
      types: [],
      textures: {},
      search: '',
      formData: {
        name: '',
        id: -1,
        types: []
      },
      dialogOpen: false,
      dialogData: {}
    }
  },
  computed: {
    texturesTypes: function() {
      return ['all', ...this.types]
    },
    type: function () {
      if (this.$route.params.type && this.texturesTypes.includes(this.$route.params.type))
        return this.$route.params.type
      return undefined
    },
    name: function () {
      if (this.type !== undefined) return this.$route.params.name
      return this.$route.params.type
    },
    splittedResults: function () {
      let res = []
      for (let col = 0; col < 2; ++col) {
        res.push([])
      }

      let arrayIndex = 0;

      for (const textureID in this.textures) {
        res[arrayIndex].push(this.textures[textureID])
        arrayIndex = (arrayIndex + 1) % 2
      }
      return res
    }
  },
  methods: {
    textureURL(t) {
      return this.name ? `/textures/${t}/${this.name}` : `/textures/${t}`
    },
    startSearch: function() {
      let newPath

      if (this.name) {
        var splitted = this.$route.path.split('/')
        splitted.pop()
        newPath = splitted.join('/')
      }
      else
        newPath = this.$route.path

      if (!newPath.endsWith('/'))
        newPath += '/'

      newPath += this.search

      if (newPath === this.$route.path)
        console.warn(newPath)
      else 
        this.$router.push(newPath)
    },
    clearSearch: function () {
      this.search = ''
      this.startSearch()
    },
    getTypes: function() {
      axios.get('/textures/types')
      .then((res) => {
        this.types = res.data
        console.log(res.data)
      })
      .catch(function (err) {
        console.error(err)
      })
      .finally(() => {
        Vue.nextTick(() => {
          this.search = this.name
        })
      })
    },
    getTextures: function() {
      axios.get(this.$route.path)
        .then((res) => {
          this.textures = res.data
        })
        .catch(function (err) {
          console.error(err)
        })
    },
    update: function () {
      this.getTypes()
      this.getTextures()
    }
  },
  watch: {
    $route() {
      this.getTextures()
    }
  },
  mounted: function() {
    this.update()
  }
}