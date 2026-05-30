export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (!to.path.startsWith('/auth')) {
      return navigateTo('/auth/login')
    }
    return
  }

  if (to.path === '/auth/login' || to.path === '/auth/register') {
    return navigateTo('/home')
  }

  const excludedPaths = ['/auth/login', '/auth/register', '/auth/confirm', '/auth/google-signup']
  if (!excludedPaths.includes(to.path)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, department')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile || !profile.name || !profile.department) {
      return navigateTo('/auth/google-signup')
    }
  }

  if (to.path === '/') {
    return navigateTo('/home', { replace: true })
  }
})
