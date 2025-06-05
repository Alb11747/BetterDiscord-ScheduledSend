import { errorIfNull } from "./utils";
import { React, Filters, Webpack, Parser, PreloadedUserSettings, SelectedChannelStore, DraftStore } from "./variables";

const { useState, useMemo } = React;

const {
    Button,
    ModalRoot,
    ModalHeader,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    FormTitle,
    FormText,
    Tooltip,
    Select,
    openModal,
}: {
    Button: React.ComponentType<any>;
    ModalRoot: React.ComponentType<any>;
    ModalHeader: React.ComponentType<any>;
    ModalCloseButton: React.ComponentType<any>;
    ModalContent: React.ComponentType<any>;
    ModalFooter: React.ComponentType<any>;
    FormTitle: React.ComponentType<any>;
    FormText: React.ComponentType<any>;
    Tooltip: React.ComponentType<any>;
    Select: React.ComponentType<any>;
    openModal: (render: (props: any) => React.ReactNode) => void;
} = errorIfNull(Webpack.getMangled(/ConfirmModal:\(\)=>.{1,3}.ConfirmModal/, {
    Select: Filters.byStrings("let{options:"),
    Button: Filters.byStrings("submittingFinishedLabel"),
    FormText: Filters.byStrings(".SELECTABLE),", ".DISABLED:"),
    ModalRoot: Filters.byStrings('.MODAL,"aria-labelledby":'),
    ModalHeader: Filters.byStrings(",id:", ".CENTER"),
    ModalContent: Filters.byStrings(".content,", "scrollbarType"),
    ModalFooter: Filters.byStrings(".footer,"),
    ModalCloseButton: Filters.byStrings(".close]:"),
    FormTitle: Filters.byStrings('["defaultMargin".concat', '="h5"'),
    openModal: Filters.byStrings(",instant:"),
    Tooltip: Filters.byStrings("this.renderTooltip()]"),
    CalendarIcon: Filters.byStrings("M7 1a1 1 0 0 1 1 1v.75c0")
}), "Failed to get Modal components");

const formatTimestamp = (time2, format2) => `<t:${time2}${format2 && `:${format2}`}>`;
const cl = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");

function scheduledSend(scheduledTime: number, msg: string, channelID: string) {
    const now = Date.now();
    if (scheduledTime < now) {
        BdApi.UI.alert("Future Time", "Scheduled time is in the past. Please choose a future time.");
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
            BdApi.UI.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
            return;
        }

        const draft: string = DraftStore.getDraft(channelID, 0);

        if (!draft) {
            const ComponentDispatch = errorIfNull(Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, { searchExports: true }), "Failed to get ComponentDispatch module");
            ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { rawText: msg, plainText: msg, });
            setTimeout(() => sendButton.click(), 100);
        } else if (DraftStore.getDraft(channelID, 0) !== msg) {
            BdApi.UI.alert("Message Changed", "The message has been changed since scheduling. Please try again.");
            return;
        } else {
            sendButton.click();
        }
    }, delay);

    function checkChannelChange() {
        if (finished) return;

        const curChannelID = SelectedChannelStore.getChannelId();
        if (curChannelID !== channelID) {
            BdApi.UI.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
            clearTimeout(timeoutID);
        } else {
            setTimeout(checkChannelChange, 1000);
        }
    }
    checkChannelChange();

    return true;
}

export function ScheduleSendModal(msg: string, channelID: string) {
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
                                BdApi.UI.showToast(
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
            BdApi.UI.alert("Error", "An error occurred while trying to render the modal. Please check console for more details.");
        }
    }
}

export function openScheduleSendModal() {
    const channelID: string = SelectedChannelStore.getChannelId();
    const draft: string = DraftStore.getDraft(channelID, 0);
    if (!draft) {
        BdApi.UI.showToast("Please enter a message to schedule");
        return;
    }

    openModal((props) => {
        try {
            return BdApi.React.createElement(ScheduleSendModal(draft, channelID), { rootProps: props });
        } catch (error) {
            console.error("ScheduleSend: Error opening modal", error);
            BdApi.UI.alert("Error", "An error occurred while trying to open the modal. Please check console for more details.");
        }
    });
}

export function ScheduleSendButton() {
    return (
        <Tooltip text="Schedule Send">
            {(p: any) => (
                <div
                    className="expression-picker-chat-input-button"
                    style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <button
                        {...p}
                        className="schedule-send-button"
                        onClick={openScheduleSendModal}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            padding: "0",
                            color: "var(--interactive-normal)",
                            transition: "color 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--interactive-hover)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--interactive-normal)";
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            width="20"
                            height="20"
                            fill="currentColor"
                        >
                            <path transform={`scale(${20 / 512})`}
                                d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </Tooltip>
    );
}

export function getSendMessageButton() {
    const sendButton = document.querySelector('[aria-label="Send Message"]');
    if (!sendButton || !(sendButton instanceof HTMLElement)) {
        BdApi.UI.alert("Send Message Button", "Couldn't find the send button. Please enable it by right-clicking the text area and enabling 'Send Message Button'");
        return null;
    }
    return sendButton;
}