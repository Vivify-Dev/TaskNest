import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type Serializer<T> = (value: T) => string
type Deserializer<T> = (raw: string) => T

interface StorageOptions<T> {
  serialize?: Serializer<T>
  deserialize?: Deserializer<T>
}

export const useLocalStorageState = <T,>(
  key: string,
  initialValue: T,
  options: StorageOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] => {
  const serialize = options.serialize ?? ((value: T) => JSON.stringify(value))
  const deserialize = options.deserialize ?? ((raw: string) => JSON.parse(raw))

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return initialValue
      return deserialize(raw)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(state))
    } catch {
      // Ignore write failures (private mode, quota, etc.).
    }
  }, [key, serialize, state])

  return [state, setState]
}
