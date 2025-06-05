/**
 * @name ScheduledSend
 * @description Adds a feature to schedule the sending of messages.
 * @author Alb11747
 * @source https://github.com/Alb11747/BetterDiscord-ScheduledSend
 * @github_raw https://raw.githubusercontent.com/Alb11747/BetterDiscord-ScheduledSend/main/dist/ScheduledSend.plugin.js
 * @version 1.0.0
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/styles.css":
/*!************************!*\
  !*** ./src/styles.css ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (".schedule-send-button-wrapper {\r\n    display: flex;\r\n    align-items: center;\r\n}\r\n\r\n.schedule-send-button {\r\n    background-color: transparent;\r\n    border: none;\r\n    cursor: pointer;\r\n    color: var(--interactive-normal);\r\n}\r\n\r\n.schedule-send-button:hover {\r\n    background-color: var(--background-modifier-hover) !important;\r\n}\r\n\r\n.schedule-send-button:active {\r\n    background-color: var(--background-modifier-active) !important;\r\n}\r\n\r\n[class*=innerDisabled] .schedule-send-button {\r\n    display: none;\r\n}\r\n\r\n.vbd-its-modal-header {\r\n    padding: 16px;\r\n}\r\n\r\n.vbd-its-modal-content {\r\n    padding: 16px;\r\n    display: flex;\r\n    flex-direction: column;\r\n    gap: 16px;\r\n}\r\n\r\n.vbd-its-preview-title {\r\n    margin-top: 16px !important;\r\n    margin-bottom: 8px !important;\r\n}\r\n\r\n.vbd-its-preview-text {\r\n    background-color: var(--background-secondary);\r\n    padding: 8px;\r\n    border-radius: 4px;\r\n    font-family: var(--font-code);\r\n}");

/***/ }),

/***/ "./src/ui.tsx":
/*!********************!*\
  !*** ./src/ui.tsx ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ScheduleSendButton: () => (/* binding */ ScheduleSendButton),
/* harmony export */   ScheduleSendModal: () => (/* binding */ ScheduleSendModal),
/* harmony export */   getSendMessageButton: () => (/* binding */ getSendMessageButton),
/* harmony export */   openScheduleSendModal: () => (/* binding */ openScheduleSendModal)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");


const { useState, useMemo } = _variables__WEBPACK_IMPORTED_MODULE_1__.React;
const { Button, ModalRoot, ModalHeader, ModalCloseButton, ModalContent, ModalFooter, FormTitle, FormText, Tooltip, Select, openModal, } = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(_variables__WEBPACK_IMPORTED_MODULE_1__.Webpack.getMangled(/ConfirmModal:\(\)=>.{1,3}.ConfirmModal/, {
    Select: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings("let{options:"),
    Button: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings("submittingFinishedLabel"),
    FormText: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(".SELECTABLE),", ".DISABLED:"),
    ModalRoot: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings('.MODAL,"aria-labelledby":'),
    ModalHeader: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(",id:", ".CENTER"),
    ModalContent: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(".content,", "scrollbarType"),
    ModalFooter: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(".footer,"),
    ModalCloseButton: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(".close]:"),
    FormTitle: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings('["defaultMargin".concat', '="h5"'),
    openModal: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings(",instant:"),
    Tooltip: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings("this.renderTooltip()]"),
    CalendarIcon: _variables__WEBPACK_IMPORTED_MODULE_1__.Filters.byStrings("M7 1a1 1 0 0 1 1 1v.75c0")
}), "Failed to get Modal components");
const formatTimestamp = (time2, format2) => `<t:${time2}${format2 && `:${format2}`}>`;
const cl = (...names) => names.map((n) => `vbd-its-${n}`).join(" ");
function scheduledSend(scheduledTime, msg, channelID) {
    const now = Date.now();
    if (scheduledTime < now) {
        BdApi.UI.alert("Future Time", "Scheduled time is in the past. Please choose a future time.");
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
        const curChannelID = _variables__WEBPACK_IMPORTED_MODULE_1__.SelectedChannelStore.getChannelId();
        if (curChannelID !== channelID) {
            BdApi.UI.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
            return;
        }
        const draft = _variables__WEBPACK_IMPORTED_MODULE_1__.DraftStore.getDraft(channelID, 0);
        if (!draft) {
            const ComponentDispatch = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(_variables__WEBPACK_IMPORTED_MODULE_1__.Webpack.getModule((m) => m.emitter?._events?.INSERT_TEXT, { searchExports: true }), "Failed to get ComponentDispatch module");
            ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { rawText: msg, plainText: msg, });
            setTimeout(() => sendButton.click(), 100);
        }
        else if (_variables__WEBPACK_IMPORTED_MODULE_1__.DraftStore.getDraft(channelID, 0) !== msg) {
            BdApi.UI.alert("Message Changed", "The message has been changed since scheduling. Please try again.");
            return;
        }
        else {
            sendButton.click();
        }
    }, delay);
    function checkChannelChange() {
        if (finished)
            return;
        const curChannelID = _variables__WEBPACK_IMPORTED_MODULE_1__.SelectedChannelStore.getChannelId();
        if (curChannelID !== channelID) {
            BdApi.UI.alert("Channel Changed", "The channel has been changed since scheduling. Please try again.");
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
                return [_variables__WEBPACK_IMPORTED_MODULE_1__.Parser.parse(formatted)];
            }, [time]);
            return (_variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(ModalRoot, { ...rootProps },
                _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(ModalHeader, { className: cl("modal-header") },
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(FormTitle, { tag: "h2" }, "Timestamp Picker"),
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(ModalCloseButton, { onClick: rootProps.onClose })),
                _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(ModalContent, { className: cl("modal-content") },
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement("input", { type: "datetime-local", value: value, onChange: (e) => setValue(e.currentTarget.value), style: {
                            colorScheme: _variables__WEBPACK_IMPORTED_MODULE_1__.PreloadedUserSettings.getCurrentValue().appearance.theme === 2
                                ? "light"
                                : "dark",
                        } }),
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(FormTitle, { className: cl("preview-title") }, "Time Delta Preview"),
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(FormText, { className: cl("preview-text") }, rendered)),
                _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(ModalFooter, null,
                    _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(Button, { onClick: () => {
                            if (scheduledSend(time, msg, channelID)) {
                                BdApi.UI.showToast(`Scheduled message for ${new Date(time).toLocaleString()}`, { type: "success" });
                            }
                            rootProps.onClose();
                        } }, "Schedule"))));
        }
        catch (error) {
            console.error("ScheduleSend: Error rendering modal", error);
            BdApi.UI.alert("Error", "An error occurred while trying to render the modal. Please check console for more details.");
        }
    };
}
function openScheduleSendModal() {
    const channelID = _variables__WEBPACK_IMPORTED_MODULE_1__.SelectedChannelStore.getChannelId();
    const draft = _variables__WEBPACK_IMPORTED_MODULE_1__.DraftStore.getDraft(channelID, 0);
    if (!draft) {
        BdApi.UI.showToast("Please enter a message to schedule");
        return;
    }
    openModal((props) => {
        try {
            return BdApi.React.createElement(ScheduleSendModal(draft, channelID), { rootProps: props });
        }
        catch (error) {
            console.error("ScheduleSend: Error opening modal", error);
            BdApi.UI.alert("Error", "An error occurred while trying to open the modal. Please check console for more details.");
        }
    });
}
function ScheduleSendButton() {
    return (_variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement(Tooltip, { text: "Schedule Send" }, (p) => (_variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement("div", { className: "expression-picker-chat-input-button", style: {
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        } },
        _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement("button", { ...p, className: "schedule-send-button", onClick: openScheduleSendModal, style: {
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                padding: "0",
                color: "var(--interactive-normal)",
                transition: "color 0.2s ease"
            }, onMouseEnter: (e) => {
                e.currentTarget.style.color = "var(--interactive-hover)";
            }, onMouseLeave: (e) => {
                e.currentTarget.style.color = "var(--interactive-normal)";
            } },
            _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", width: "20", height: "20", fill: "currentColor" },
                _variables__WEBPACK_IMPORTED_MODULE_1__.React.createElement("path", { transform: `scale(${20 / 512})`, d: "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z" })))))));
}
function getSendMessageButton() {
    const sendButton = document.querySelector('[aria-label="Send Message"]');
    if (!sendButton || !(sendButton instanceof HTMLElement)) {
        BdApi.UI.alert("Send Message Button", "Couldn't find the send button. Please enable it by right-clicking the text area and enabling 'Send Message Button'");
        return null;
    }
    return sendButton;
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   errorIfNull: () => (/* binding */ errorIfNull),
/* harmony export */   findInReactTree: () => (/* binding */ findInReactTree)
/* harmony export */ });
function errorIfNull(value, message) {
    if (value === null || value === undefined) {
        BdApi.UI.alert("Error", message);
        throw new Error(message);
    }
    return value;
}
function findInReactTree(root, filter) {
    return BdApi.Utils.findInTree(root, filter, {
        walkable: ["children", "props"]
    });
}


/***/ }),

/***/ "./src/variables.ts":
/*!**************************!*\
  !*** ./src/variables.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DraftStore: () => (/* binding */ DraftStore),
/* harmony export */   Filters: () => (/* binding */ Filters),
/* harmony export */   Parser: () => (/* binding */ Parser),
/* harmony export */   Patcher: () => (/* binding */ Patcher),
/* harmony export */   PreloadedUserSettings: () => (/* binding */ PreloadedUserSettings),
/* harmony export */   React: () => (/* binding */ React),
/* harmony export */   SelectedChannelStore: () => (/* binding */ SelectedChannelStore),
/* harmony export */   Webpack: () => (/* binding */ Webpack)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");

const { Patcher, React } = BdApi;
const Webpack = BdApi.Webpack;
const { Filters } = Webpack;
const Parser = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(Webpack.getByKeys("parseTopic"), "Failed to get Parser module");
const PreloadedUserSettings = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(Webpack.getModule((m) => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), { searchExports: true }), "Failed to get PreloadedUserSettings module");
const SelectedChannelStore = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(Webpack.getModule((m) => m.getLastSelectedChannelId), "Failed to get SelectedChannelStore module");
const DraftStore = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.errorIfNull)(Webpack.getModule((m) => m.getDraft), "Failed to get DraftStore module");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/index.tsx ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ScheduledSend)
/* harmony export */ });
/* harmony import */ var _styles_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.css */ "./src/styles.css");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/ui.tsx");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");
// @ts-ignore




class ScheduledSend {
    constructor(meta) {
        this.meta = meta;
    }
    start() {
        BdApi.DOM.addStyle(this.meta.name, _styles_css__WEBPACK_IMPORTED_MODULE_0__["default"]);
        const ChannelTextAreaButtons = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.errorIfNull)(BdApi.Webpack.getModule((m) => m.type?.toString?.().includes('"sticker")')), "Failed to get ChannelTextAreaButtons module");
        _variables__WEBPACK_IMPORTED_MODULE_3__.Patcher.after(this.meta.name, ChannelTextAreaButtons, "type", (_this, args, res) => {
            try {
                if (args?.[0]?.disabled)
                    return;
                const buttons = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.errorIfNull)((0,_utils__WEBPACK_IMPORTED_MODULE_2__.findInReactTree)(res, (n) => Array.isArray(n) && n.some((e) => e.key === "emoji")), "Failed to find buttons in ChannelTextArea render");
                buttons.splice(0, 0, _variables__WEBPACK_IMPORTED_MODULE_3__.React.createElement(_ui__WEBPACK_IMPORTED_MODULE_1__.ScheduleSendButton, {
                    key: "schedule-send-button",
                    className: "schedule-send-button-wrapper"
                }));
            }
            catch (error) {
                console.error("ScheduledSend: Error adding button", error);
                BdApi.UI.showToast("Failed to add Scheduled Send button", { type: "error" });
            }
        });
    }
    stop() {
        _variables__WEBPACK_IMPORTED_MODULE_3__.Patcher.unpatchAll(this.meta.name);
        BdApi.DOM.removeStyle(this.meta.name);
    }
}

})();

module.exports = __webpack_exports__["default"];
/******/ })()
;