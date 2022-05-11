export function parseStringList(input: string) {
  return input.split(",").map((v) => v.trim());
}

export function parseNumberList(input: string) {
  return parseStringList(input)
    .map(Number)
    .filter((v) => !isNaN(v));
}
