export function saveToken(token: string) {
  localStorage.setItem("hs_token", token)
}

export function getToken(): string | null {
  return localStorage.getItem("hs_token")
}

export function removeToken() {
  localStorage.removeItem("hs_token")
  localStorage.removeItem("hs_user")
}

export function saveUser(user: any) {
  localStorage.setItem("hs_user", JSON.stringify(user))
}

export function getUser() {
  const user = localStorage.getItem("hs_user")
  return user ? JSON.parse(user) : null
}

export function decodeToken(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}
