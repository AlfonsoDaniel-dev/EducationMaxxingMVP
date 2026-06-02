'use client'

import { createContext, useContext } from 'react'
import type { UserResponse } from '@/types'

export const UserContext = createContext<UserResponse | null>(null)

export function useUser(): UserResponse | null {
  return useContext(UserContext)
}
