
export interface API {
    "/auth": {
        GET: {
            response: {
                authed: boolean
            }
        },
        POST: {
            body: {
                password: string
            },
            response: {
                success: boolean
                error?: string
            }
        },
        PUT: {
            body: {
                password: string
            },
            response: {
                success: boolean
                error?: string
            }
        },
        DELETE: {
            response: {
                success: boolean
                error?: string
            }
        }
    }
    "/hello-world": {
        POST: {
            body: string
            response: string
        },
        GET: {
            response: string
        }
    }
  }