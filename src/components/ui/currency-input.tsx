import { NumericFormat, NumericFormatProps } from "react-number-format";

type CurrencyInputProps = Omit<NumericFormatProps, "value"> & {
  error?: boolean;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
};

export function CurrencyInput({
  error,
  onChange,
  className = "",
  ...props
}: CurrencyInputProps) {
  return (
    <NumericFormat
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      prefix="R$ "
      allowNegative={false}
      className={`bg-background border-border focus:ring-ring focus:border-ring w-full rounded-md border px-3 py-2 text-sm transition outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : ""} ${className} `}
      onValueChange={(values) => {
        onChange?.(values.floatValue);
      }}
      {...props}
    />
  );
}
