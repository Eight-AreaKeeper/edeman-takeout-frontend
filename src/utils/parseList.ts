export function parseNumberList(csv: string | undefined): number[] {
  return csv ? csv.split(',').map(Number) : []
}

export function parseStringList(csv: string | undefined): string[] {
  return csv ? csv.split(',') : []
}
