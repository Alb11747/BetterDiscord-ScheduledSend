module.exports = (Plugin, Library) => {

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

    function scheduledSend(scheduledTime: number, msg: string, channelID: string) {
        const now = Date.now();
        if (scheduledTime < now) {
            BdApi.alert("Future Time", "Scheduled time is in the past. Please choose a future time.");
            return;
        }

        const sendButton = getSendMessageButton();
        if (!sendButton) return;

        const delay = scheduledTime - now;
        let finished = false;
        const timeoutID = setTimeout(() => {
            finished = true;

            const sendButton = getSendMessageButton();
            if (!sendButton) return;

            const curChannelID = SelectedChannelStore.getChannelId();
            if (curChannelID !== channelID) {
                BdApi.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
                return;
            }

            const draft: string = DraftStore.getDraft(channelID, 0);

            if (!draft) {
                ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { rawText: msg, plainText: msg, });
                setTimeout(() => sendButton.click(), 100);
            } else if (DraftStore.getDraft(channelID, 0) !== msg) {
                BdApi.alert("Message Changed", "The message has been changed since scheduling. Please try again.");
                return;
            } else {
                sendButton.click();
            }
        }, delay);

        function checkChannelChange() {
            if (finished) return;

            const curChannelID = SelectedChannelStore.getChannelId();
            if (curChannelID !== channelID) {
                BdApi.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
                clearTimeout(timeoutID);
            } else {
                setTimeout(checkChannelChange, 1000);
            }
        }
        checkChannelChange();

        return true;
    }

    function ScheduleSendModal(msg: string, channelID: string) {
        return ({ rootProps }) => {
            if (!rootProps) {
                console.error("ScheduleSend: Modal props not found");
                return null;
            }

            try {
                const [value, setValue] = useState<string>();
                const time = new Date(value).getTime() || Date.now();
                const [rendered] = useMemo(() => {
                    const formatted = formatTimestamp(Math.round(time / 1e3), "R");
                    return [Parser.parse(formatted)];
                }, [time]);

                return (
                    <ModalRoot {...rootProps}>
                        <ModalHeader className={cl("modal-header")}>
                            <FormTitle tag="h2">Timestamp Picker</FormTitle>
                            <ModalCloseButton onClick={rootProps.onClose} />
                        </ModalHeader>
                        <ModalContent className={cl("modal-content")}>
                            <input
                                type="datetime-local"
                                value={value}
                                onChange={(e) => setValue(e.currentTarget.value)}
                                style={{
                                    colorScheme:
                                        PreloadedUserSettings.getCurrentValue().appearance.theme === 2
                                            ? "light"
                                            : "dark",
                                }}
                            />
                            <FormTitle className={cl("preview-title")}>Time Delta Preview</FormTitle>
                            <FormText className={cl("preview-text")}>{rendered}</FormText>
                        </ModalContent>
                        <ModalFooter>
                            <Button onClick={() => {
                                if (scheduledSend(time, msg, channelID)) {
                                    BdApi.showToast(
                                        `Scheduled message for ${new Date(time).toLocaleString()}`,
                                        { type: "success" }
                                    );
                                }
                                rootProps.onClose();
                            }}>
                                Schedule
                            </Button>
                        </ModalFooter>
                    </ModalRoot>
                );

            } catch (error) {
                console.error("ScheduleSend: Error rendering modal", error);
                BdApi.alert("Error", "An error occurred while trying to render the modal. Please check console for more details.");
            }
        }
    }

    function openScheduleSendModal() {
        const channelID: string = SelectedChannelStore.getChannelId();
        const draft: string = DraftStore.getDraft(channelID, 0);
        if (!draft) {
            BdApi.showToast("Please enter a message to schedule");
            return;
        }

        openModal((props) => {
            try {
                return BdApi.React.createElement(ScheduleSendModal(draft, channelID), { rootProps: props });
            } catch (error) {
                console.error("ScheduleSend: Error opening modal", error);
                BdApi.alert("Error", "An error occurred while trying to open the modal. Please check console for more details.");
            }
        });
    }

    function renderButton(): JSX.Element {
        return (
            <Tooltip text="Schedule Send">
                {(p) => (
                    <div style={{ marginTop: "10px" }}>
                        <button
                            {...p}
                            className="schedule-button"
                            onClick={openScheduleSendModal}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 36 36"
                                width="24"
                                height="24"
                                fill="currentColor"
                            >
                                <g transform={`scale(${32 / 490})`}>
                                    <g>
                                        <path d="M245,0C109.5,0,0,109.5,0,245s109.5,245,245,245s245-109.5,245-245S380.5,0,245,0z M245,449.3c-112.6,0-204.3-91.7-204.3-204.3S132.4,40.7,245,40.7S449.3,132.4,449.3,245S357.6,449.3,245,449.3z" />
                                        <path d="M290.9,224.1h-25v-95.9c0-11.5-9.4-20.9-20.9-20.9s-20.9,9.4-20.9,20.9V245c0,11.5,9.4,20.9,20.9,20.9h45.9c11.5,0,20.9-9.4,20.9-20.9S302.3,224.1,290.9,224.1z" />
                                    </g>
                                </g>
                            </svg>
                        </button>
                    </div>
                )}
            </Tooltip>
        );
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
                if (buttons?.props.disabled) return;

                chatBar.splice(-1, 0, renderButton());
            });
        }

        onStop() {
            Patcher.unpatchAll("ScheduleSend");
            clearCSS("ScheduleSend-Styles");
        }
    };
};
