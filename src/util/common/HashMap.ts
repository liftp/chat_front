export class HashMap<K, V> {
    private map: Map<K, V> = new Map();

    public set(key: K, value: V): void {
        this.map.set(key, value);
    }

    public get(key: K): V | undefined {
        return this.map.get(key);
    }

    public delete(key: K): boolean {
        return this.map.delete(key);
    }

    public has(key: K): boolean {
        return this.map.has(key);
    }
}
