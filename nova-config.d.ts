declare module "@nova/config" {
    
    // INTERFACES
    // --------------------------------------------------------------------------------------------
    export interface Settings {
        env : string;
    }

    export interface Logger {
        info(message: string)   : void;
        warn(message: string)   : void;
    }

    export interface Decryptor {
        (encrypted: string)     : any;
    }

    // PUBLIC FUNCTIONS
    // --------------------------------------------------------------------------------------------
    export function getSettings() : Settings;
    export function configure(settings: { logger?: Logger; decryptor?: Decryptor; }): void;
}