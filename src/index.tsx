// @ts-ignore
import styles from "./styles.css";

import { ScheduleSendButton } from "./ui";
import { errorIfNull, findInReactTree } from "./utils";
import { Patcher, React } from "./variables";

export default class ScheduledSend {
    meta: any;

    constructor(meta) {
        this.meta = meta;
    }

    start() {
        BdApi.DOM.addStyle(this.meta.name, styles);

        const ChannelTextAreaButtons = errorIfNull(BdApi.Webpack.getModule((m) => m.type?.toString?.().includes('"sticker")')),
            "Failed to get ChannelTextAreaButtons module");

        Patcher.after<any, any>(this.meta.name, ChannelTextAreaButtons, "type", (_this, args, res) => {
            try {
                if ((args?.[0] as any)?.disabled) return;

                const buttons: React.ReactNode[] = errorIfNull(findInReactTree(res, (n) => Array.isArray(n) && n.some((e) => e.key === "emoji")),
                    "Failed to find buttons in ChannelTextArea render");

                buttons.splice(0, 0,
                    React.createElement(ScheduleSendButton, {
                        key: "schedule-send-button",
                        className: "schedule-send-button-wrapper"
                    })
                );
            } catch (error) {
                console.error("ScheduledSend: Error adding button", error);
                BdApi.UI.showToast("Failed to add Scheduled Send button", { type: "error" });
            }
        });
    }

    stop() {
        Patcher.unpatchAll(this.meta.name);
        BdApi.DOM.removeStyle(this.meta.name);
    }
}