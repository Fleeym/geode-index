export class ParsedModInfo {
    id: string;
    name: string;
    description: string;
    windows: boolean;
    mac: boolean;
    ios: boolean;
    android: boolean;
    tags: string[];
    geodeVersion: string;
    dependencies: Array<{ id: string; version: string; required: boolean }> =
        [];
    version: string;
    repository?: string;
}
