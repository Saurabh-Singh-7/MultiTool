"use client"

import DataConverterClient from "@/components/converters/data-converter-client"

export default function CSVToJSONClient() {
  return (
    <DataConverterClient 
      initialFrom="csv"
      initialTo="json"
      title="CSV to JSON Converter"
      description="Convert CSV data to JSON format and vice versa instantly. Perfect for developers, data analysts, and researchers."
    />
  )
}
