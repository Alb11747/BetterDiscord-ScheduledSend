
import { errorIfNull } from "./utils";

export const { Patcher, React } = BdApi;
export const Webpack: typeof BdApi.Webpack & {
    getMangled<T = any>(
        filter: RegExp | ((module: any) => boolean),
        mappings: Record<string, any>,
        options?: {
            defaultExport?: boolean;
            searchExports?: boolean;
            raw?: boolean;
        }
    ): T | null;
} = BdApi.Webpack as any;
export const { Filters } = Webpack;

export const Parser = errorIfNull(Webpack.getByKeys("parseTopic"), "Failed to get Parser module");
export const PreloadedUserSettings = errorIfNull(Webpack.getModule((m) => m.ProtoClass?.typeName.endsWith("PreloadedUserSettings"), { searchExports: true }), "Failed to get PreloadedUserSettings module");
export const SelectedChannelStore = errorIfNull(Webpack.getModule((m) => m.getLastSelectedChannelId), "Failed to get SelectedChannelStore module");
export const DraftStore = errorIfNull(Webpack.getModule((m) => m.getDraft), "Failed to get DraftStore module");
