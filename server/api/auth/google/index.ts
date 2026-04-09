/**
 * Google OAuth: 返回授權 URL
 * GET /api/auth/google -> 重定向至 Google 授權頁面
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  const clientId = config.public.googleClientId || process.env.GOOGLE_CLIENT_ID
  const redirectUri = config.public.googleRedirectUri || getRequestURL(event).protocol + '//' + getRequestHost(event) + '/auth/confirm'

  if (!clientId) {
    console.error('Missing GOOGLE_CLIENT_ID environment variable')
    throw createError({
      statusCode: 500,
      statusMessage: 'Google OAuth configuration is missing'
    })
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  
  // 生成 state（用於防止 CSRF 攻擊）
  const state = Math.random().toString(36).substring(7)
  
  // 儲存 state 到 cookie（短期有效，比如 10 分鐘）
  setCookie(event, 'oauth_state', state, {
    maxAge: 600,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  googleAuthUrl.searchParams.append('client_id', clientId)
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri)
  googleAuthUrl.searchParams.append('response_type', 'code')
  googleAuthUrl.searchParams.append('scope', 'openid profile email')
  googleAuthUrl.searchParams.append('access_type', 'offline')
  googleAuthUrl.searchParams.append('state', state)

  return {
    url: googleAuthUrl.toString()
  }
})
