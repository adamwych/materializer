export default async function sleepAsync(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
}
