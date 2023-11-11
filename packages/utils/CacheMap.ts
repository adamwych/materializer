export default class CacheMap<K, V> extends Map<K, V> {
    public getOrAdd(key: K, getter: () => V): V | undefined {
        const existingItem = this.get(key);
        if (existingItem) {
            return existingItem;
        }

        const item = getter();
        this.set(key, item);
        return item;
    }
}
