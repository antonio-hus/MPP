"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, File, CheckCircle, AlertCircle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setStatus("idle")
      setMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first")
      setStatus("error")
      return
    }

    setStatus("loading")
    setMessage("Uploading file...")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/upload/${file.name}/`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setMessage("File uploaded successfully!")
        setStatus("success")
      } else {
        setMessage("Upload failed.")
        setStatus("error")
      }
    } catch (error) {
      setMessage("An error occurred during upload.")
      setStatus("error")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">File Management</h1>

        <Card className="w-full max-w-2xl p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
              <File className="h-12 w-12 text-[#FF9800] mb-2" />
              <p className="text-sm text-gray-500 mb-2">{file ? file.name : "Select a file to upload"}</p>
              <div className="flex items-center gap-2 mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="bg-[#FF9800] hover:bg-[#F57C00] text-white px-4 py-2 rounded-md flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Select File</span>
                  </div>
                  <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
                {file && (
                  <Button
                    onClick={handleUpload}
                    className="bg-[#2196F3] hover:bg-[#1976D2]"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Uploading..." : "Upload File"}
                  </Button>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`w-full flex items-center gap-2 p-3 rounded-md ${
                  status === "success"
                    ? "bg-green-50 text-green-700"
                    : status === "error"
                      ? "bg-red-50 text-red-700"
                      : "bg-blue-50 text-blue-700"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : status === "error" ? (
                  <AlertCircle className="h-5 w-5" />
                ) : null}
                <p>{message}</p>
              </div>
            )}
          </div>
        </Card>
      </main>
      <Footer className="mt-auto" />
    </div>
  )
}

