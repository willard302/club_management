export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. 如果未登入且不在 auth 相關頁面，跳轉登入
  if (!user) {
    if (!to.path.startsWith('/auth')) {
      return navigateTo('/auth/login')
    }
    return
  }

  // 2. 如果已登入且在登入/註冊頁面，跳轉首頁
  if (to.path === '/auth/login' || to.path === '/auth/register') {
    return navigateTo('/')
  }

  // 3. 檢查 Profile 是否完整 (排除不需要檢查的頁面)
  const excludedPaths = ['/auth/login', '/auth/register', '/auth/confirm', '/auth/google-signup']
  if (!excludedPaths.includes(to.path)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, department')
      .eq('id', user.id)
      .maybeSingle()

    // 如果沒有 Profile 或缺少必要欄位，強制跳轉完善資料頁面
    if (!profile || !profile.name || !profile.department) {
      return navigateTo('/auth/google-signup')
    }
  }
})
