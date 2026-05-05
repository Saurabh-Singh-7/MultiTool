"use client"

import DataConverterClient from "@/components/converters/data-converter-client"

export default function XMLToJSONClient() {
  return (
    <DataConverterClient 
      initialFrom="xml"
      initialTo="json"
      title="XML to JSON Converter"
      description="Convert XML data to JSON and vice versa instantly. Secure, private, and perfect for modernizing legacy data."
    />
  )
}
