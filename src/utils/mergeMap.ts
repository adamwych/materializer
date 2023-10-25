export default function mergeMap<K, V>(a: Map<K, V>, b: Map<K, V>): Map<K, V> {
    for (const [k, v] of b.entries()) {
        a.set(k, v);
    }
    return a;
}