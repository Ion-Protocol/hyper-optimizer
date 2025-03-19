// Converts a regular decimal number as a string into a bigint with the specified number of decimals as a string
export function convertToBigIntString(input: string, decimals: number = 18): string {
  if (parseFloat(input) === 0) {
    return "0";
  }

  // Split the input into the whole number and decimal parts
  const [whole, decimal = ""] = input.split(".");

  // Add the right number of zeroes to the decimal part to match the specified decimals
  const decimalPadded = (decimal + "0".repeat(decimals)).slice(0, decimals);

  // Return the whole number part concatenated with the decimal part
  return whole + decimalPadded;
}
