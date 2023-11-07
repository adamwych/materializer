/**
 * Maps all values of Map from type `V1` to type `V2` using given mapping function.
 *
 * @param record Map to map the values of.
 * @param mapper Mapping function.
 */
export function mapDictionary<K, V1, V2>(dict: Map<K, V1>, mapper: (v: V1) => V2): Map<K, V2> {
    const result = new Map<K, V2>();

    for (const [k, v] of dict.entries()) {
        result.set(k, mapper(v));
    }

    return result;
}
