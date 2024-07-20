/**
 * @name ScheduledSend
 * @description Adds a feature to schedule the sending of messages.
 * @version 0.1.0
 * @author Alb11747
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    main: "index.js",
    id: "ScheduledSend",
    name: "ScheduledSend",
    author: "Alb11747",
    version: "0.1.0",
    description: "Adds a feature to schedule the sending of messages.",
    source: "",
    changelog: [],
    defaultConfig: []
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {
    const Styles = `
.schedule-button {
    background-color: transparent;
    border: none;
    height: 8px;
    filter: grayscale(100%);
    cursor: pointer;
    color: var(--interactive-normal);
}

.schedule-button:hover {
    color: var(--interactive-active);
}

[class*=innerDisabled] .schedule-button {
    display: none;
}
`;
    const { Patcher, Utilities } = Library;
    const { React, injectCSS, clearCSS, Webpack } = BdApi;
    const { Button, ModalRoot, ModalHeader, ModalCloseButton, ModalContent, ModalFooter, FormTitle, FormText, Tooltip, Select, openModal } = BdApi.Webpack.getByKeys("ModalContent", "Tooltip");
    const { useState, useMemo } = BdApi.React;
    const Parser = Webpack.getByKeys("parseTopic");
    const PreloadedUserSettings = Webpack.getModule((m) => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), { searchExports: true });
    const ComponentDispatch = BdApi.Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, { searchExports: true });
    const SelectedChannelStore = Webpack.getModule((m) => m.getLastSelectedChannelId);
    const DraftStore = Webpack.getModule((m) => m.getDraft);
    const ChannelTextArea = Webpack.getModule((m) => m.type?.render?.toString?.().includes("CHANNEL_TEXT_AREA"));
    // const TimestampFormats = ["", "t", "T", "d", "D", "f", "F", "R"];
    const formatTimestamp = (time2, format2) => `<t:${time2}${format2 && `:${format2}`}>`;
    const cl = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");
    function getSendMessageButton() {
        const sendButton = document.querySelector('[aria-label="Send Message"]');
        if (!sendButton || !(sendButton instanceof HTMLElement)) {
            BdApi.alert("Send Message Button", "Couldn't find the send button. Please enable it by right-clicking the text area and enabling 'Send Message Button'");
            return null;
        }
        return sendButton;
    }
    function scheduledSend(scheduledTime, msg, channelID) {
        const now = Date.now();
        if (scheduledTime < now) {
            BdApi.alert("Future Time", "Scheduled time is in the past. Please choose a future time.");
            return;
        }
        const sendButton = getSendMessageButton();
        if (!sendButton)
            return;
        const delay = scheduledTime - now;
        let finished = false;
        const timeoutID = setTimeout(() => {
            finished = true;
            const sendButton = getSendMessageButton();
            if (!sendButton)
                return;
            const curChannelID = SelectedChannelStore.getChannelId();
            if (curChannelID !== channelID) {
                BdApi.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
                return;
            }
            const draft = DraftStore.getDraft(channelID, 0);
            if (!draft) {
                ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { rawText: msg, plainText: msg, });
                setTimeout(() => sendButton.click(), 100);
            }
            else if (DraftStore.getDraft(channelID, 0) !== msg) {
                BdApi.alert("Message Changed", "The message has been changed since scheduling. Please try again.");
                return;
            }
            else {
                sendButton.click();
            }
        }, delay);
        function checkChannelChange() {
            if (finished)
                return;
            const curChannelID = SelectedChannelStore.getChannelId();
            if (curChannelID !== channelID) {
                BdApi.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
                clearTimeout(timeoutID);
            }
            else {
                setTimeout(checkChannelChange, 1000);
            }
        }
        checkChannelChange();
        return true;
    }
    function ScheduleSendModal(msg, channelID) {
        return ({ rootProps }) => {
            if (!rootProps) {
                console.error("ScheduleSend: Modal props not found");
                return null;
            }
            try {
                const [value, setValue] = useState();
                const time = new Date(value).getTime() || Date.now();
                const [rendered] = useMemo(() => {
                    const formatted = formatTimestamp(Math.round(time / 1e3), "R");
                    return [Parser.parse(formatted)];
                }, [time]);
                return (React.createElement(ModalRoot, { ...rootProps },
                    React.createElement(ModalHeader, { className: cl("modal-header") },
                        React.createElement(FormTitle, { tag: "h2" }, "Timestamp Picker"),
                        React.createElement(ModalCloseButton, { onClick: rootProps.onClose })),
                    React.createElement(ModalContent, { className: cl("modal-content") },
                        React.createElement("input", { type: "datetime-local", value: value, onChange: (e) => setValue(e.currentTarget.value), style: {
                                colorScheme: PreloadedUserSettings.getCurrentValue().appearance.theme === 2
                                    ? "light"
                                    : "dark",
                            } }),
                        React.createElement(FormTitle, { className: cl("preview-title") }, "Time Delta Preview"),
                        React.createElement(FormText, { className: cl("preview-text") }, rendered)),
                    React.createElement(ModalFooter, null,
                        React.createElement(Button, { onClick: () => {
                                if (scheduledSend(time, msg, channelID)) {
                                    BdApi.showToast(`Scheduled message for ${new Date(time).toLocaleString()}`, { type: "success" });
                                }
                                rootProps.onClose();
                            } }, "Schedule"))));
            }
            catch (error) {
                console.error("ScheduleSend: Error rendering modal", error);
                BdApi.alert("Error", "An error occurred while trying to render the modal. Please check console for more details.");
            }
        };
    }
    function openScheduleSendModal() {
        const channelID = SelectedChannelStore.getChannelId();
        const draft = DraftStore.getDraft(channelID, 0);
        if (!draft) {
            BdApi.showToast("Please enter a message to schedule");
            return;
        }
        openModal((props) => {
            try {
                return BdApi.React.createElement(ScheduleSendModal(draft, channelID), { rootProps: props });
            }
            catch (error) {
                console.error("ScheduleSend: Error opening modal", error);
                BdApi.alert("Error", "An error occurred while trying to open the modal. Please check console for more details.");
            }
        });
    }
    function renderButton() {
        return (React.createElement(Tooltip, { text: "Schedule Send" }, (p) => (React.createElement("div", { style: { marginTop: "10px" } },
            React.createElement("button", { ...p, className: "schedule-button", onClick: openScheduleSendModal },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 36 36", width: "24", height: "24", fill: "currentColor" },
                    React.createElement("path", { transform: `scale(${32 / 512})`, d: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z" })))))));
    }
    return class ScheduledSend extends Plugin {
        onStart() {
            injectCSS("ScheduleSend-Styles", Styles);
            Patcher.after(ChannelTextArea.type, "render", (_, __, ret) => {
                const chatBar = Utilities.findInReactTree(ret, (n) => Array.isArray(n?.children) && n.children.some((c) => c?.props?.className?.startsWith("attachButton")))?.children;
                if (!chatBar) {
                    console.error("ScheduleSend: Couldn't find ChatBar component in React tree");
                    return;
                }
                const buttons = Utilities.findInReactTree(chatBar, (n) => n?.props?.showCharacterCount);
                if (buttons?.props.disabled)
                    return;
                chatBar.splice(-1, 0, renderButton());
            });
        }
        onStop() {
            Patcher.unpatchAll("ScheduleSend");
            clearCSS("ScheduleSend-Styles");
        }
    };
};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/