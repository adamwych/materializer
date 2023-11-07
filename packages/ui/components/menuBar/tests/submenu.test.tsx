import { cleanup, render } from "@solidjs/testing-library";
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import MenuBarSubmenu from "../submenu.tsx";
import MenuBarSubmenuItem from "../submenu-item.tsx";

function renderTestSubmenu() {
    const { queryAllByTestId, getByTestId } = render(() => (
        <MenuBarSubmenu label="Submenu">
            <MenuBarSubmenuItem label="Item" />
        </MenuBarSubmenu>
    ));

    return {
        queryItems: () => queryAllByTestId("menuBarSubmenuItem"),
        toggle: () => getByTestId("menuBarSubmenuButton").click(),
    };
}

describe("MenuBarSubmenu", () => {
    afterEach(cleanup);

    it("should toggle items visibility on click", () => {
        const submenu = renderTestSubmenu();
        expect(submenu.queryItems().length).toBe(0);
        submenu.toggle();
        expect(submenu.queryItems().length).toBe(1);
        submenu.toggle();
        expect(submenu.queryItems().length).toBe(0);
    });

    it("should close after clicking an item", () => {
        const submenu = renderTestSubmenu();
        submenu.toggle();
        submenu.queryItems()[0].click();
        expect(submenu.queryItems().length).toBe(0);
    });
});
