export type UaParser = {
    getFamily: () => string;
    satisfies: (range?: string) => boolean;
    isUnknown: () => boolean;
};
export type FeatureInput = {
    flags?: (Set<Flag> | Flag[] | undefined) | undefined;
    aliasOf?: (Set<Flag> | Flag[] | undefined) | undefined;
    dependencyOf?: (Set<Flag> | Flag[] | undefined) | undefined;
};
export type NormalisedOptions = {
    callback: string | false;
    ua: UaParser;
    minify: boolean;
    unknown: "ignore" | "polyfill";
    features: Record<string, Feature>;
    excludes: Array<string>;
};
export type Feature = {
    flags: Set<Flag>;
    aliasOf: Set<string>;
    dependencyOf: Set<string>;
    comment?: (string | undefined) | undefined;
};
export type Flag = "gated" | "always";
export type Readable = import("node:stream").Readable;
/** @import {PolyfillMeta} from './sources' */
/**
 * Get a list of all the aliases which exist within the collection of polyfill sources.
 * @returns {Promise<Record<string, Array<string>>>} A promise which resolves with an object mapping all the aliases within the collection to the polyfills they include.
 */
export function listAliases(): Promise<Record<string, Array<string>>>;
/**
 * Get a list of all the polyfills which exist within the collection of polyfill sources.
 * @returns {Promise<Array<string>>} A promise which resolves with an array of all the polyfills within the collection.
 */
export function listAllPolyfills(): Promise<Array<string>>;
/**
 * Get the metadata for a specific polyfill within the collection of polyfill sources.
 * @param {string} featureName - The name of a polyfill whose metadata should be returned.
 * @returns {Promise<PolyfillMeta|undefined>} A promise which resolves with the metadata or with `undefined` if no metadata exists for the polyfill.
 */
export function describePolyfill(featureName: string): Promise<sources.PolyfillMeta | undefined>;
/**
 * @typedef {Object} UaParser
 * @property {() => string} getFamily
 * @property {(range?: string) => boolean} satisfies
 * @property {() => boolean} isUnknown
 */
/**
 * @typedef {Object} FeatureInput
 * @property {Set<Flag>|Flag[]|undefined=} flags
 * @property {Set<Flag>|Flag[]|undefined=} aliasOf
 * @property {Set<Flag>|Flag[]|undefined=} dependencyOf
 */
/**
 * @typedef {Object} NormalisedOptions
 * @property {string|false} callback
 * @property {UaParser} ua
 * @property {boolean} minify
 * @property {"ignore"|"polyfill"} unknown
 * @property {Record<string, Feature>} features
 * @property {Array<string>} excludes
 */
/**
 * @typedef {Object} Feature
 * @property {Set<Flag>} flags
 * @property {Set<string>} aliasOf
 * @property {Set<string>} dependencyOf
 * @property {string|undefined=} comment
 */
/**
 * Create an options object for use with `getPolyfills` or `getPolyfillString`.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Record<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {false | string} [options_.callback=false] - Name of the JavaScript function to call after the polyfill bundle is loaded.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {NormalisedOptions} options - options_ merged with the defaults option values.
 */
export function getOptions(options_?: {
    minify?: boolean;
    unknown?: "ignore" | "polyfill";
    features?: Record<string, FeatureInput>;
    callback?: false | string;
    excludes?: Array<string>;
    ua?: UaParser;
}): NormalisedOptions;
/**
 * @typedef {'gated'|'always'} Flag
 */
/**
 * Given a set of features that should be polyfilled in 'options.features'
 * (with flags i.e. `{<featurename>: {flags:Set[<flaglist>]}, ...}`),
 * determine which have a configuration valid for the given options.ua,
 * and return a promise of set of canonical (unaliased) features (with flags) and polyfills.
 *
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object.<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @return {Promise<Object.<string, Feature>>} - Canonicalised feature definitions filtered for UA
 */
export function getPolyfills(options_: {
    minify?: boolean;
    unknown?: "ignore" | "polyfill";
    features?: {
        [x: string]: FeatureInput;
    };
    excludes?: Array<string>;
    ua?: UaParser;
}): Promise<{
    [x: string]: Feature;
}>;
/**
 * @typedef {import('node:stream').Readable} Readable
 */
/**
 * Create a polyfill bundle.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Object.<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @param {boolean} [options_.stream=false] - Whether to return a stream or a string of the polyfill bundle.
 * @return {Promise<string>|stream.Readable} - Polyfill bundle as either a utf-8 stream or a promise of a utf-8 string.
 */
export function getPolyfillString(options_: {
    minify?: boolean;
    unknown?: "ignore" | "polyfill";
    features?: {
        [x: string]: FeatureInput;
    };
    excludes?: Array<string>;
    ua?: UaParser;
    stream?: boolean;
}): Promise<string> | stream.Readable;
/**
 * Create a polyfill bundle.
 * @param {Object} options_ - Valid keys are ua, minify, unknown, excludes and features.
 * @param {Boolean} [options_.minify=true] - Whether to return the minified or raw implementation of the polyfills.
 * @param {'ignore' | 'polyfill'} [options_.unknown='polyfill'] - Whether to return all polyfills or no polyfills if the user-agent is unknown or unsupported.
 * @param {Record<string, FeatureInput>} [options_.features={}] - Which features should be returned if the user-agent does not support them natively.
 * @param {false | string} [options_.callback=false] - Name of the JavaScript function to call after the polyfill bundle is loaded.
 * @param {Array<string>} [options_.excludes=[]] - Which features should be excluded from the returned object.
 * @param {UaParser} [options_.ua={}] - The user-agent object to check each feature against.
 * @returns {AsyncGenerator<string>}
 */
export function generatePolyfillString(options_: {
    minify?: boolean;
    unknown?: "ignore" | "polyfill";
    features?: Record<string, FeatureInput>;
    callback?: false | string;
    excludes?: Array<string>;
    ua?: UaParser;
}): AsyncGenerator<string>;
import sources = require("./sources");
import stream = require("stream");
