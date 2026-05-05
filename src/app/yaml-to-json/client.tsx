"use client"

import DataConverterClient from "@/components/converters/data-converter-client"

export default function YAMLToJSONClient() {
  return (
    <DataConverterClient 
      initialFrom="yaml"
      initialTo="json"
      title="YAML to JSON Converter"
      description="Convert YAML configuration files to JSON and vice versa instantly. Secure, private, and developer-friendly."
    />
  )
}
