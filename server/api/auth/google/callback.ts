/**
 * Google OAuth Callback: 處理 Google 授權回調
 * 接收授權碼，交換 session，判斷使用者是否為首次登入
 */

// JWT 解析函數
function parseJwt(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }
    
    const base64Url: string = parts[1] || ''
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    
    // 在 Node.js 中使用 Buffer 進行 base64 解碼
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8')
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('Error parsing JWT:', err)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const error = query.error as string

  // 檢查 state 參數（CSRF 保護）
  const storedState = getCookie(event, 'oauth_state')
  if (state !== storedState) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OAuth state parameter'
    })
  }

  // 檢查是否有錯誤
  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Google OAuth error: ${error}`
    })
  }

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing authorization code from Google'
    })
  }

  try {
    // 取得 Supabase 配置
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE || ''

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('Missing Supabase configuration')
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${getRequestURL(event).protocol}//${getRequestHost(event)}/auth/confirm`

    if (!clientId || !clientSecret) {
      throw new Error('Missing Google OAuth credentials')
    }

    // 交換授權碼為 ID Token（向 Google 請求）
    const tokenResponse = await $fetch<{
      access_token: string
      id_token: string
      expires_in: number
      refresh_token?: string
    }>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }
    })

    // 驗證 ID Token 並取得使用者資訊（解碼 JWT）
    const idTokenPayload = parseJwt(tokenResponse.id_token)

    if (!idTokenPayload || !idTokenPayload.email) {
      throw new Error('Invalid ID token')
    }

    const googleUserEmail = idTokenPayload.email
    const googleUserName = idTokenPayload.name || ''
    const googleUserPicture = idTokenPayload.picture || ''

    // 使用 Supabase Admin API（via REST）查詢使用者
    // GET /auth/v1/admin/users?email=...
    let existingUserList: any[] = []
    try {
      const response = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRole}`,
          'Content-Type': 'application/json'
        },
        query: {
          email: googleUserEmail
        }
      })
      existingUserList = response || []
    } catch (err) {
      console.warn('Failed to query existing user:', err)
      existingUserList = []
    }

    let userId: string
    let isNewUser = false

    if (!existingUserList || existingUserList.length === 0) {
      // 新使用者，建立帳號
      const createUserResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceRole}`,
          'Content-Type': 'application/json'
        },
        body: {
          email: googleUserEmail,
          email_confirm: true,
          user_metadata: {
            name: googleUserName,
            picture: googleUserPicture,
            provider: 'google'
          }
        }
      })

      if (!createUserResponse.id) {
        throw new Error('Failed to create user')
      }

      userId = createUserResponse.id
      isNewUser = true
    } else {
      // 既有使用者
      userId = existingUserList[0].id
      isNewUser = false

      // 更新 Google 資訊（如果尚未設置）
      const metadata = existingUserList[0].user_metadata || {}
      if (!metadata.picture && googleUserPicture) {
        await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${supabaseServiceRole}`,
            'Content-Type': 'application/json'
          },
          body: {
            user_metadata: {
              ...metadata,
              picture: googleUserPicture
            }
          }
        }).catch((err) => {
          console.warn('Failed to update user metadata:', err)
        })
      }
    }

    // 建立 session
    const sessionResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users/${userId}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRole}`,
        'Content-Type': 'application/json'
      }
    })

    if (!sessionResponse.access_token) {
      throw new Error('Failed to create session')
    }

    // 設置 session 到 cookies
    const session = sessionResponse
    
    setCookie(event, 'sb-access-token', session.access_token, {
      maxAge: session.expires_in || 3600,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    if (session.refresh_token) {
      setCookie(event, 'sb-refresh-token', session.refresh_token, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    }

    // 清除 oauth_state cookie
    deleteCookie(event, 'oauth_state')

    // 取得使用者完整資訊
    const userInfoResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceRole}`,
        'Content-Type': 'application/json'
      }
    }).catch(() => ({}))

    const hasCompleteProfile = userInfoResponse?.user_metadata?.student_id || false

    // 重定向
    if (isNewUser || !hasCompleteProfile) {
      await sendRedirect(event, '/auth/google-signup')
    } else {
      // 既有使用者，導向首頁
      await sendRedirect(event, '/')
    }
  } catch (err: any) {
    console.error('Google OAuth callback error:', err)

    // 錯誤情況下重定向到登入頁面，並帶上錯誤參數
    const errorMessage = encodeURIComponent(err.message || 'Google login failed')
    await sendRedirect(event, `/auth/login?error=${errorMessage}`)
  }
})
