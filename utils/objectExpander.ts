export function objectExpand(
  object: { [key: string]: any },
  omitKeys: string[]
) {
  let values: { key: string; value: any }[] = [];

  Object.entries(object).forEach(([key, value]) => {
    if (!omitKeys.includes(key)) {
      if (typeof value === 'object') {
        let entries = objectExpand(value, omitKeys);
        values = values.concat(entries);
      } else {
        values.push({ key: key, value: value });
      }
    }
  });

  return values;
}
