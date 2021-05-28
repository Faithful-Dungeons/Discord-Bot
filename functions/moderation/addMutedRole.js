const settings = require('../../settings.js')
const users = require('../../helpers/firestorm/users.js')

async function addMutedRole(client, userID, seconds) {
	const servers = [
		settings.CDUNGEONS_ID, 
		settings.CMODS_ID, 
		settings.CTWEAKS_ID, 
		settings.CADDONS_ID, 
		settings.C64_ID, 
		settings.C32_ID, 
		'814198513847631944', // what the hell is this server id ??
		'720677267424018526' // Bot dev discord
	]
	
	// add roles to the discord user
	for (let i = 0; i < servers[i]; i++) {
		let server = await client.guilds.cache.get(servers[i]) || undefined
		let member = server === undefined ? undefined : await server.members.cache.get(userID)
		let role   = member === undefined ? undefined : await server.roles.cache.find(r => r.name === 'Muted')
	
		if (role) await member.roles.add(role)
	}

	// make dates
	var startAt = new Date();
	var endAt = new Date();

	// add mute time value
	endAt.setSeconds(endAt.getSeconds() + seconds)

	// if infinite mute:
	if (seconds < 0) endAt = 0

	// get the user from the db
	let user = await users.searchKeys([ userID ])

	// if the user doesn't exist, create a new one (add username for a better readability when looking at the db)
	if (!user[0]) {
		const discord_user = await client.users.cache.find(user => user.id === userID)

		user[0] = {
			username: discord_user.username,
			type: [ 'member' ]
		}
	}

	// set start & end timestamp
	user[0].muted = {
		start: startAt.getTime(),
		end: endAt.getTime()
	}
	users.set(userID, user[0])
}

exports.addMutedRole = addMutedRole