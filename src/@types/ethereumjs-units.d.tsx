type Converter = (amount: string, from: string, to: string) => string;

declare module 'ethereumjs-units' {
  export const convert: Converter;
  export const lazyConvert: Converter;
}
