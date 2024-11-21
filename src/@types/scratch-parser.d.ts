// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ParserCallback = (err: any, project: any) => void;

declare module 'scratch-parser' {
    import scratchParser from 'scratch-parser';
    function scratchParser(content: string, isSprite: boolean, callback: ParserCallback): void;
    export = scratchParser;
}
