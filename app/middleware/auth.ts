export default defineNuxtRouteMiddleware(async(to, from) => {
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return navigateTo('/auth/login')  
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    await supabase.auth.signOut() // 確保登出清除任何不一致的狀態
    return navigateTo('/auth/login')
  }
})
