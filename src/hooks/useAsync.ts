import { useEffect, useRef, useState } from "react"

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useAsync<T>(fn: () => Promise<T>, deps: ReadonlyArray<unknown>): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: true,
    error: null,
  })
  const tickRef = useRef(0)

  function run() {
    const tick = ++tickRef.current
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fn()
      .then((data) => {
        if (tick === tickRef.current) setState({ data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (tick === tickRef.current) setState({ data: null, loading: false, error })
      })
  }

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data: state.data, loading: state.loading, error: state.error, refetch: run }
}
