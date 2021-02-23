# CompliBot Changelog
---------------------------------------
### February 2021

#### February 20th 2021
> RobertR11

- check if the user's message still exists on various commands to avoid discord api errors
- revert the palette command limit to 256x256, because it was too much for the bot

#### February 19th 2021
> RobertR11

- check if command is guild only for every command
- added 21w07a support for `/texture` command
- changed tile and palette limit to 512x512 (previously 256x256) so it's like the magnify limit
- fixed the bot not showing the full arg or showing "undefined" in the tiling message

#### February 18th 2021
> RobertR11

- added reaction when texture gets into council vote

#### February 17th 2021
> RobertR11

- added a size limit of 256x256 to the `/palette` command

#### February 16th 2021
> RobertR11

- disable mentioning "everyone" or "here" in any way
- start working on `/quote` command (currently disabled)

#### February 15th 2021
> RobertR11

- simplify `/tile` command (also tried to add message and image url back, but didn't work)

#### February 14th 2021 (Happy Valentin's day btw)
> Juknum

- Added jpg & jpeg support for quotation system, added discordapp.com url support.
- Modified `/tile` command: removed url/id/message url functionality (unused) & added parameters; You can now tile an image vertically & horizontally, round & plus shape, grid shape is still used by default, type `/help tile` for more information. Also made `/t` an alias for this command.
- Started to work on a `/render` command.

#### February 11th 2021
> Juknum

- Added `/autopush` command, act the same way as GetResults.js, but it can be now executed manually
- Added `/profile` command, used to translate Discord ID into username, usefull for the website Gallery.
- Added `/hotfix` command, basically a `/test` command but with a better name.

#### February 10th 2021
> RobertR11

- Ignore various moderation commands when in dm's
- Prevent crash when trying to magnify or tile corrupted images
- Add 21w06a texture support

#### February 9th 2021
> Juknum

- Contributors java & bedrock now use discord ID instead of discord Tag
- Contributors Java is now ready to downgrade C32 & C64 from 1.17 to 1.12.2
- Updated /about, /texture, /push commands following the new contributors format

#### February 8th 2021
> Juknum  

- Introducing Changelog
- Fixed wrong copper block name from /contributors/java.json
- Fixed /about command
---------------------------------------