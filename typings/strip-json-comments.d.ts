// Type definitions for strip-json-comments
// Project: https://github.com/sindresorhus/strip-json-comments
// Definitions by: Dylan R. E. Moonfire <https://github.com/dmoonfire/>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "strip-json-comments" {

    module stripJsonComments {
        interface Options {
            whitespace?: boolean;
        }
    }

    function stripJsonComments(input: string, opts?: stripJsonComments.Options): string;
    export = stripJsonComments;
}
