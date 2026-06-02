import { createClient, type User } from "@supabase/supabase-js"

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const hasEnv = !!SUPABASE_URL && !!SUPABASE_ANON_KEY

if (!hasEnv) {
  console.warn("Supabase env vars not set. Cloud sync disabled.")
}

export const supabase = hasEnv ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

function requireClient() {
  if (!supabase) throw new Error("Supabase not configured")
  return supabase
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await requireClient().auth.signUp({ email, password })
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await requireClient().auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await requireClient().auth.signOut()
  if (error) throw error
}

export const resetPassword = async (email: string) => {
  const { error } = await requireClient().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/",
  })
  if (error) throw error
}

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await requireClient().auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
}

export const getCurrentUser = () => {
  return requireClient().auth.getSession().then(({ data }) => data.session?.user ?? null)
}

export const onAuthChange = (cb: (user: User | null) => void) => {
  if (!supabase) return { unsubscribe: () => {} }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null)
  })
  getCurrentUser().then(cb)
  return data.subscription
}

export const pushToCloud = async (userId: string, data: { exams: unknown[]; settings: Record<string, unknown> }) => {
  await requireClient().from("user_data").upsert({
    user_id: userId,
    exams: JSON.stringify(data.exams),
    settings: JSON.stringify(data.settings),
    updated_at: new Date().toISOString(),
  })
}

export const pullFromCloud = async (userId: string) => {
  const { data } = await requireClient()
    .from("user_data")
    .select("exams, settings")
    .eq("user_id", userId)
    .maybeSingle()
  if (!data) return null
  return {
    exams: JSON.parse(data.exams as string),
    settings: JSON.parse(data.settings as string),
  }
}

export const deleteCloudAccount = async (userId: string) => {
  await requireClient().from("user_data").delete().eq("user_id", userId)
}
