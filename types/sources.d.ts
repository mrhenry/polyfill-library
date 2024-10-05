export type PolyfillMeta = {
    detectSource: string;
    baseDir: string;
    size: number;
    aliases: Array<string> | undefined;
    dependencies: Array<string> | undefined;
    spec: string | undefined;
    repo: string | undefined;
    docs: string | undefined;
    license: string;
    notes: Array<string> | undefined;
    browsers: Record<string, string>;
    order: number;
};
export type readFile = (path: string, options: "utf-8") => Promise<string>;
export type createReadStream = (path: string, options: {
    encoding: "utf-8";
}) => import("stream").Readable;
export type FilesystemImplementation = {
    readFile: readFile;
    createReadStream: createReadStream;
};
/**
 * Get a specific polyfill.
 * @param {String} featureName - The name of a polyfill whose implementation should be returned.
 * @param {'min'|'raw'} type - Which implementation should be returned: minified or raw implementation.
 * @returns {import('stream').Readable} A ReadStream instance of the polyfill implementation as a utf-8 string.
 */
export function streamPolyfillSource(featureName: string, type: "min" | "raw"): import("stream").Readable;
/**
 * Get the polyfills that are under the same alias.
 * @param {String} alias - The name of an alias whose metadata should be returned.
 * @returns {Promise<Array<string>|undefined>} A promise which resolves with the metadata or with `undefined` if no alias with that name exists.
 */
export function getConfigAliases(alias: string): Promise<Array<string> | undefined>;
/**
 * Get a list of all the polyfill aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
export function listAliases(): Promise<Record<string, Array<string>>>;
/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
export function listPolyfills(): Promise<Array<string>>;
/**
 * Get a list of all the polyfill metadata which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, PolyfillMeta>>}
 *
 * @private This function is not intended to be used outside of this module.
 */
export function listMeta(): Promise<Record<string, PolyfillMeta>>;
/**
 * @typedef {Object} PolyfillMeta
 * @property {string} detectSource
 * @property {string} baseDir
 * @property {number} size
 * @property {Array<string>|undefined} aliases
 * @property {Array<string>|undefined} dependencies
 * @property {string|undefined} spec
 * @property {string|undefined} repo
 * @property {string|undefined} docs
 * @property {string} license
 * @property {Array<string>|undefined} notes
 * @property {Record<string, string>} browsers
 * @property {number} order
 */
/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {String} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<PolyfillMeta|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
export function getPolyfillMeta(featureName: string): Promise<PolyfillMeta | undefined>;
/**
 * Set the file system implementation to use.
 * The default implementation uses the Node.js `fs` module.
 *
 * @param {readFile} readFile - A function that reads a file and returns a promise.
 * @param {createReadStream} createReadStream - A function that creates a read stream.
 */
export function setFs(readFile: readFile, createReadStream: createReadStream): void;
