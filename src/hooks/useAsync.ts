import { useEffect, useRef, useState } from "react"

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Runs `fn` whenever `deps` change and tracks its result. When `enabled` is
 * false no request is made and the state resets to idle. Results from a
 * superseded run (or after unmount) are discarded.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: ReadonlyArray<unknown>, enabled = true): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: Error | null }>({
    data: null,
    loading: enabled,
    error: null,
  })
  const tickRef = useRef(0)

  function run() {
    const tick = ++tickRef.current
    if (!enabled) {
      setState({ data: null, loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fn()
      .then((data) => {
        if (tick === tickRef.current) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err))
        if (tick === tickRef.current) setState({ data: null, loading: false, error })
      })
  }

  useEffect(() => {
    run()
    return () => {
      // Invalidate any in-flight request so it can't set state after unmount
      // or after the deps changed.
      tickRef.current++
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  return { data: state.data, loading: state.loading, error: state.error, refetch: run }
}
