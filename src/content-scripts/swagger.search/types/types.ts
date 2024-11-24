export type SwaggerSearchType = 'FUZZY' | 'NORMAL'

export type HttpMethod =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'trace'

export type UrlType = {
  url: string
  tag: string
  method: HttpMethod
  summary?: string
}

export type SwaggerPathType = {
  operationId: string
  summary: string
  tags: string[]
  parameters: any[]
  responses: any
  requestBody: any
}

export type SwaggerMethodType = {
  [key: string]: SwaggerPathType
}
