'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomeRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/(admin)/Dashboard')  // 대소문자, 괄호 포함 주의!
  }, [])

  return null
}