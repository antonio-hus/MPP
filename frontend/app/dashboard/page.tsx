"use client"

import { useEffect, useState } from "react"
import { fetchMonitoredUsers, fetchOperationLogs } from "@/utils/api/users-api"
import type { MonitoredUser } from "@/utils/types/users-type"
import type { OperationLog } from "@/utils/types/logs-type"
import Header from "@/components/header"
import Footer from "@/components/Footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, UserX, ClipboardList } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import NetworkStatusNotificationBar from "@/components/StatusNotificationBar"

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<MonitoredUser[] | null>(null)
  const [logs, setLogs] = useState<OperationLog[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("You must be logged in as an admin.")
      setIsLoading(false)
      return
    }

    // Fetch both in parallel
    Promise.all([fetchMonitoredUsers(), fetchOperationLogs()])
      .then(([usersData, logsData]) => {
        setUsers(usersData)
        setLogs(logsData)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  // Function to get badge styling based on action type
  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "CREATE":
        return "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-500 text-white border-green-600"
      case "UPDATE":
        return "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-blue-500 text-white border-blue-600"
      case "DELETE":
        return "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-500 text-white border-red-600"
      default:
        return "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-gray-500 text-white border-gray-600"
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NetworkStatusNotificationBar />
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2196F3]" />
              <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {/* Monitored Users Section */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              <CardHeader className="bg-[#E3F2FD] border-b border-[#BBDEFB] py-4">
                <CardTitle className="flex items-center gap-2 text-[#1976D2]">
                  <UserX className="h-5 w-5 text-[#2196F3]" />
                  Monitored Users
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {users && users.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No monitored users.</p>
                ) : (
                  <div className="space-y-4">
                    {users?.map((u) => (
                      <div
                        key={u.user}
                        className="border rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{u.username}</div>
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-500 text-white border-yellow-600">
                            Flagged
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Flagged at: {new Date(u.flagged_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operation Log Section */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              <CardHeader className="bg-[#E3F2FD] border-b border-[#BBDEFB] py-4">
                <CardTitle className="flex items-center gap-2 text-[#1976D2]">
                  <ClipboardList className="h-5 w-5 text-[#2196F3]" />
                  Operation Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {logs && logs.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No operations logged yet.</p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-[400px] overflow-auto">
                      <Table>
                        <TableHeader className="bg-gray-50 sticky top-0">
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Model</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Object ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {logs?.map((log) => (
                            <TableRow key={log.id} className="hover:bg-gray-50">
                              <TableCell className="whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                              <TableCell>{log.username}</TableCell>
                              <TableCell>{log.model}</TableCell>
                              <TableCell>
                                <span className={getActionBadgeClass(log.action)}>{log.action}</span>
                              </TableCell>
                              <TableCell>{log.object_id}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
