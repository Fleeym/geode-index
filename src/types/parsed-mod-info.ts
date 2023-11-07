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
    version: string;
    repository?: string;
}
