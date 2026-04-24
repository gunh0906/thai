export function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

export function sortByReferenceOrder(values, referenceValues = []) {
  const order = new Map(referenceValues.map((value, index) => [value, index]));
  return [...values].sort((left, right) => (order.get(left) ?? 999) - (order.get(right) ?? 999));
}
