 
export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  avatar?: string
  defaultMode?: 'CREATOR' | 'WORKER' | 'BOTH'
  activeMode: 'CREATOR' | 'WORKER'
  createdAt: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  dob: string
  password: string
  confirmPassword: string
  defaultMode?: 'CREATOR' | 'WORKER' | 'BOTH'
}

export interface LoginInput {
  emailOrPhone: string
  password: string
  rememberMe: boolean
}