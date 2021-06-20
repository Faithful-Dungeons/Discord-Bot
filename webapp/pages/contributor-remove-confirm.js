/* global axios, TwinBcrypt */

export default {
	name: 'contributor-remove-confirm',
	template: `
  <v-dialog
      v-model="confirm"
      persistent
      max-width="600"
    >
      <v-card>
        <v-card-title class="headline">Confirm deletion</v-card-title>
        <v-card-text>
          <v-form ref="form" lazy-validation>
            <p>Do you want to delete {{ data.username }}#{{ data.id }}?</p>
            <v-text-field required clearable type="password" v-model="formData.password" label="Security password" hint="must match .env password"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="darken-1"
            text
            @click="disableDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error darken-1"
            @click="deleteContributor"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  `,
  props: {
    confirm: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    disableDialog: {
      type: Function,
      required: true
    }
  },
	data() {
		return {
      formData: {
        password: ''
      }
		}
	},
  computed: {
    username: function () {
      return this.$props.data.username
    },
    id: function() {
      return this.$props.data.id
    }
  },
  methods: {
    deleteContributor: function() {
      const data = JSON.parse(JSON.stringify(this.formData))
      data.id = this.id
      data.password = TwinBcrypt.hashSync(data.password)
      
      axios.post('/contributors/remove', data)
      .then(() => {
        this.$root.showSnackBar('Ended successully', 'success')
        this.disableDialog(true)
      })
      .catch(error => {
        console.error(error)
        this.$root.showSnackBar(`${error.message} : ${error.response.data.error}`, 'error')
        this.disableDialog(true)
      });
    }
  }
}