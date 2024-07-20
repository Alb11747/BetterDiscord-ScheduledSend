# BetterDiscord ScheduledSend Plugin

BetterDiscord-ScheduledSend is a plugin for BetterDiscord that adds the functionality to schedule messages to be sent at a later time.

## Features

- **Schedule Messages:** Easily schedule messages to be sent at a specific time.
- **Integration with BetterDiscord:** Seamlessly integrates with the BetterDiscord ecosystem.
- **User-Friendly:** Simple time selection interface for scheduling messages.
- **Cancel Scheduling:** Change the channel to cancel the scheduled message.

## Limitations

- **Single Channel Scheduling:** Currently, the plugin only supports scheduling messages for a single channel. If you change the channel, the scheduled message will be canceled. Multiple messages can not be scheduled at the same time, otherwise, only one will be sent and the other messages will fail.
- **Channel Must Remain Open:** For the scheduled message to be sent, the channel where the message is scheduled must remain open. The plugin will work in the background with Discord minimized to the system tray, but the channel cannot be changed.
- **Don't Edit the Message:** Leave the message input area empty or with the same content as the scheduled message, otherwise, the message will not be sent. The plugin will not overwrite the input area content when sending the scheduled message.

## Usage

After installing the plugin, you'll find a new option to schedule messages within the message input area. Here's how to use it:

1. Write your message in the input area.
2. Click on the schedule icon.
3. Choose the date and time you want the message to be sent.
4. Confirm the scheduling.

Your message will be sent automatically at the specified time.

## Installation

1. Ensure that you have BetterDiscord installed. If not, visit [BetterDiscord](https://betterdiscord.app/) to download and install it.
2. Download the `dist/ScheduledSend.plugin.js` file from this repository.
3. Navigate to your BetterDiscord plugins folder. You can find this folder by going to User Settings > Plugins > Open Plugin Folder in BetterDiscord.
4. Drag and drop the `ScheduledSend.plugin.js` file into the plugins folder.
5. Enable the ScheduledSend plugin from the BetterDiscord plugins menu.

## Dependencies

- **ZeresPluginLibrary:** This plugin requires the ZeresPluginLibrary to function properly. Make sure it is installed in your BetterDiscord plugins folder.

## Building from Source

If you wish to build the plugin from the source, follow these steps:

1. Clone this repository.
2. Navigate to the cloned directory.
3. Run `npm install` to install the necessary dependencies.
4. Run `npm run build` to build the plugin. The built plugin will be output to the same directory.

## Development

If you wish to modify the plugin, make sure to only modify the files within the `src` directory and `ScheduledSend/config.json`. Other files are generated during the build process and should not be modified directly.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

- **Alb11747**

Enjoy scheduling your messages with BetterDiscord ScheduledSend Plugin!

