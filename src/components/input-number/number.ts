const plain = new Intl.NumberFormat('en-US', {
  useGrouping: false,
  maximumSignificantDigits: 21,
})

function decimalFormat(places: number, roundingMode: 'halfExpand' | 'ceil' | 'floor') {
  const options = {
    useGrouping: false,
    minimumFractionDigits: places,
    maximumFractionDigits: places,
    roundingMode,
  }
  return new Intl.NumberFormat('en-US', options)
}

export function createNumberFormat(decimalPlaces?: number, min?: number, max?: number) {
  const minimum = min !== undefined && Number.isFinite(min) ? min : -Infinity
  const maximum = Math.max(minimum, max !== undefined && Number.isFinite(max) ? max : Infinity)
  const places = decimalPlaces !== undefined && Number.isInteger(decimalPlaces)
    && decimalPlaces >= 0 && decimalPlaces <= 20 ? decimalPlaces : undefined
  const fixed = places === undefined ? undefined : decimalFormat(places, 'halfExpand')
  const lower = places === undefined || !Number.isFinite(minimum)
    ? minimum : Number(decimalFormat(places, 'ceil').format(minimum))
  const upper = places === undefined || !Number.isFinite(maximum)
    ? maximum : Number(decimalFormat(places, 'floor').format(maximum))

  function normalize(value: number): number {
    const bounded = Math.max(minimum, Math.min(maximum, value))
    if (lower > upper) {
      // No value at the requested precision fits. Preserve the nearer boundary.
      return bounded - minimum <= maximum - bounded ? minimum : maximum
    }
    const rounded = fixed ? Number(fixed.format(bounded)) : bounded
    const result = Math.max(lower, Math.min(upper, rounded))
    return result === 0 ? 0 : result
  }

  function display(value: number | null): string {
    if (value === null || !Number.isFinite(value)) return ''
    const normalized = normalize(value)
    if (normalized === 0) return '-'
    return (fixed && lower <= upper ? fixed : plain).format(normalized)
  }

  return { normalize, display }
}
