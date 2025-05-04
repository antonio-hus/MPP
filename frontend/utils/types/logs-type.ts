/////////////////////
// IMPORTS SECTION //
/////////////////////


////////////////////////
// INTERFACES SECTION //
////////////////////////
export interface OperationLog {
  id: number
  username: string
  model: string
  object_id: string | null
  action: "CREATE" | "RETRIEVE" | "UPDATE" | "DELETE" | "LIST"
  timestamp: string
}