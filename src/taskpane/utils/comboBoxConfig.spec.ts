// Copyright IBM Corp. 2026

import { createComboBoxConfig } from "./comboBoxConfig";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

interface StringItem {
  text: string;
  value: number;
}

const items: StringItem[] = [
  { text: "Electricity", value: 1 },
  { text: "Natural Gas", value: 2 },
  { text: "Coal", value: 3 },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createComboBoxConfig", () => {
  // ── return value structure ──────────────────────────────────────────────────

  describe("return value structure", () => {
    it("should return items unchanged", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.items).toBe(items);
    });

    it("should return selectedItem unchanged", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: items[0],
        setSelectedItem: jest.fn(),
      });

      expect(config.selectedItem).toBe(items[0]);
    });

    it("should return selectedItem as null when null is passed", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.selectedItem).toBeNull();
    });

    it("should expose onChange as a function", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(typeof config.onChange).toBe("function");
    });

    it("should expose shouldFilterItem as a function", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(typeof config.shouldFilterItem).toBe("function");
    });

    it("should expose itemToString as a function", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(typeof config.itemToString).toBe("function");
    });
  });

  // ── itemToString — default ──────────────────────────────────────────────────

  describe("itemToString — default implementation", () => {
    it("should return item.text when item has a text property", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.itemToString(items[0])).toBe("Electricity");
    });

    it("should return the item itself when item is a plain string", () => {
      const strItems = ["Alpha", "Beta"];
      const config = createComboBoxConfig({
        items: strItems,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.itemToString("Alpha")).toBe("Alpha");
    });

    it("should return an empty string for null", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.itemToString(null)).toBe("");
    });

    it("should return an empty string for undefined", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.itemToString(undefined)).toBe("");
    });

    it("should return an empty string when item.text is not a string", () => {
      const config = createComboBoxConfig({
        items: [{ text: 42 }] as any,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(config.itemToString({ text: 42 } as any)).toBe("");
    });
  });

  // ── itemToString — custom ───────────────────────────────────────────────────

  describe("itemToString — custom implementation", () => {
    it("should use the provided itemToString function", () => {
      const customItemToString = jest.fn((item: StringItem | null | undefined) =>
        item ? `${item.value}-${item.text}` : ""
      );

      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
        itemToString: customItemToString,
      });

      expect(config.itemToString(items[0])).toBe("1-Electricity");
      expect(customItemToString).toHaveBeenCalledWith(items[0]);
    });
  });

  // ── onChange ────────────────────────────────────────────────────────────────

  describe("onChange", () => {
    it("should call setSelectedItem with the selected item", () => {
      const setSelectedItem = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem,
      });

      config.onChange({ selectedItem: items[1] });

      expect(setSelectedItem).toHaveBeenCalledWith(items[1]);
    });

    it("should call setSelectedItem with null when selectedItem is undefined", () => {
      const setSelectedItem = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem,
      });

      config.onChange({ selectedItem: undefined });

      expect(setSelectedItem).toHaveBeenCalledWith(null);
    });

    it("should call setSelectedItem with null when selectedItem is null", () => {
      const setSelectedItem = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem,
      });

      config.onChange({ selectedItem: null });

      expect(setSelectedItem).toHaveBeenCalledWith(null);
    });

    it("should call onSelectedItemChange with the selected item", () => {
      const onSelectedItemChange = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
        onSelectedItemChange,
      });

      config.onChange({ selectedItem: items[2] });

      expect(onSelectedItemChange).toHaveBeenCalledWith(items[2]);
    });

    it("should call onSelectedItemChange with null when selectedItem is undefined", () => {
      const onSelectedItemChange = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
        onSelectedItemChange,
      });

      config.onChange({ selectedItem: undefined });

      expect(onSelectedItemChange).toHaveBeenCalledWith(null);
    });

    it("should not throw when onSelectedItemChange is not provided", () => {
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem: jest.fn(),
      });

      expect(() => config.onChange({ selectedItem: items[0] })).not.toThrow();
    });

    it("should call both setSelectedItem and onSelectedItemChange", () => {
      const setSelectedItem = jest.fn();
      const onSelectedItemChange = jest.fn();
      const config = createComboBoxConfig({
        items,
        selectedItem: null,
        setSelectedItem,
        onSelectedItemChange,
      });

      config.onChange({ selectedItem: items[0] });

      expect(setSelectedItem).toHaveBeenCalledTimes(1);
      expect(onSelectedItemChange).toHaveBeenCalledTimes(1);
    });
  });

  // ── shouldFilterItem ────────────────────────────────────────────────────────

  describe("shouldFilterItem", () => {
    describe("when item is absent", () => {
      it("should return false when item is null", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: null, inputValue: "elec" })).toBe(false);
      });

      it("should return false when item is undefined", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: undefined, inputValue: "elec" })).toBe(false);
      });
    });

    describe("when inputValue is empty", () => {
      it("should return true when inputValue is an empty string", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "" })).toBe(true);
      });

      it("should return true when inputValue is only whitespace", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "   " })).toBe(true);
      });

      it("should return true when inputValue is null", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: null })).toBe(true);
      });

      it("should return true when inputValue is undefined", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0] })).toBe(true);
      });
    });

    describe("default string matching", () => {
      it("should return true when item text contains the inputValue (case-insensitive)", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "elec" })).toBe(true);
      });

      it("should return true for uppercase inputValue matching lowercase item text", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "ELEC" })).toBe(true);
      });

      it("should return false when item text does not contain the inputValue", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "coal" })).toBe(false);
      });

      it("should return true for full text match", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(
          config.shouldFilterItem({ item: items[0], inputValue: "Electricity" })
        ).toBe(true);
      });

      it("should strip leading/trailing whitespace from inputValue before matching", () => {
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "  elec  " })).toBe(true);
      });
    });

    describe("custom filterItems", () => {
      it("should delegate to filterItems when provided", () => {
        const filterItems = jest.fn(() => [items[0]]);
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
          filterItems,
        });

        const result = config.shouldFilterItem({ item: items[0], inputValue: "elec" });

        expect(filterItems).toHaveBeenCalledWith(items, "elec", expect.any(Function));
        expect(result).toBe(true);
      });

      it("should return false when filterItems does not include the item", () => {
        const filterItems = jest.fn(() => [items[1]]);
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
          filterItems,
        });

        expect(config.shouldFilterItem({ item: items[0], inputValue: "gas" })).toBe(false);
      });

      it("should pass trimmed lowercase inputValue to filterItems", () => {
        const filterItems = jest.fn(() => []);
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
          filterItems,
        });

        config.shouldFilterItem({ item: items[0], inputValue: "  ELEC  " });

        expect(filterItems).toHaveBeenCalledWith(items, "elec", expect.any(Function));
      });

      it("should not call filterItems when item is null", () => {
        const filterItems = jest.fn(() => []);
        const config = createComboBoxConfig({
          items,
          selectedItem: null,
          setSelectedItem: jest.fn(),
          filterItems,
        });

        config.shouldFilterItem({ item: null, inputValue: "elec" });

        expect(filterItems).not.toHaveBeenCalled();
      });
    });
  });
});
