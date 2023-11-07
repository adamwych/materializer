import { cleanup, render } from "@solidjs/testing-library";
import "@testing-library/jest-dom";
import { afterEach, describe, expect, it } from "vitest";
import MenuBar from "../menu-bar.tsx";
import MenuBarSubmenu from "../submenu.tsx";

describe("MenuBar", () => {
    afterEach(cleanup);

    it("should render submenus", () => {
        const { getAllByTestId } = render(() => (
            <MenuBar>
                <MenuBarSubmenu label="Submenu 0" />
                <MenuBarSubmenu label="Submenu 1" />
            </MenuBar>
        ));

        expect(getAllByTestId("menuBarSubmenu").length).toBe(2);
    });
});
