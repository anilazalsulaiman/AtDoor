 
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
  rememberMe?: boolean
}