/**
 * Checks whether given element is within window's bounds and offsets it if it is not.
 * @param element
 */
export default function assertInWindowBounds(element: HTMLElement) {
    const bottomEdgeY = element.offsetTop + element.clientHeight + 4;
    const outsidePxY = bottomEdgeY - window.innerHeight;
    if (outsidePxY > 0) {
        element.style.top = parseFloat(element.style.top) - outsidePxY + "px";
    }
}
