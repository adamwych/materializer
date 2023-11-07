export default function hasParentWithCondition(
    element: Element | null,
    check: (element: Element) => boolean,
) {
    while (element) {
        if (check(element)) {
            return true;
        }

        element = element.parentElement;
    }

    return false;
}
