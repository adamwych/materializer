/**
 * Combines given class names into a single string.
 * `false`, `undefined` and `null` items will be skipped.
 *
 * @param names
 * @returns
 */
export default function cn(...names: ReadonlyArray<string | boolean | undefined>) {
    return names.filter((x) => !!x).join(" ");
}
