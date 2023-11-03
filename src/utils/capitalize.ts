export default function capitalize(str: string) {
    if (str.length === 1) {
        return str.toUpperCase();
    }
    return str.substring(0, 1).toUpperCase() + str.substring(1);
}
