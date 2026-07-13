// Copyright IBM Corp. 2026

export interface ComboBoxConfigOptions<TItem> {
  items: TItem[];
  selectedItem: TItem | null;
  setSelectedItem: (item: TItem | null) => void;
  itemToString?: (item: TItem | null | undefined) => string;
  onSelectedItemChange?: (item: TItem | null) => void;
  filterItems?: (
    items: TItem[],
    inputValue: string,
    itemToString: (item: TItem | null | undefined) => string
  ) => TItem[];
}

export interface ComboBoxConfigResult<TItem> {
  items: TItem[];
  selectedItem: TItem | null;
  itemToString: (item: TItem | null | undefined) => string;
  onChange: ({ selectedItem }: { selectedItem?: TItem | null }) => void;
  shouldFilterItem: ({
    item,
    inputValue,
  }: {
    item?: TItem | null;
    inputValue?: string | null;
  }) => boolean;
}

export function createComboBoxConfig<TItem>({
  items,
  selectedItem,
  setSelectedItem,
  itemToString = (item) => {
    const text = (item as { text?: unknown })?.text ?? item;
    return typeof text === "string" ? text : "";
  },
  onSelectedItemChange,
  filterItems,
}: ComboBoxConfigOptions<TItem>): ComboBoxConfigResult<TItem> {
  const handleChange = ({ selectedItem: nextSelectedItem }: { selectedItem?: TItem | null }) => {
    const normalizedSelectedItem = nextSelectedItem ?? null;
    setSelectedItem(normalizedSelectedItem);
    onSelectedItemChange?.(normalizedSelectedItem);
  };

  const shouldFilterItem = ({
    item,
    inputValue,
  }: {
    item?: TItem | null;
    inputValue?: string | null;
  }): boolean => {
    if (!item) {
      return false;
    }

    const normalizedInputValue = inputValue?.trim().toLowerCase() ?? "";
    if (!normalizedInputValue) {
      return true;
    }

    if (filterItems) {
      return filterItems(items, normalizedInputValue, itemToString).includes(item);
    }

    return itemToString(item).toLocaleLowerCase().includes(normalizedInputValue);
  };

  return {
    items,
    selectedItem,
    itemToString,
    onChange: handleChange,
    shouldFilterItem,
  };
}
