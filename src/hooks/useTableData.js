import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

// Client-side search, filter, sort and pagination for mock lists.
// `searchText(item)` returns the searchable text; `filterFn(item)` applies
// page-specific filters; `sortValue(item, key)` overrides sorting values.
export function useTableData(items, { searchText, filterFn, sortValue, initialSort = null, pageSize: initialPageSize = 10, resetKey } = {}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const debounced = useDebounce(query, 250)

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase()
    let list = items
    if (filterFn) list = list.filter(filterFn)
    if (q && searchText) list = list.filter((item) => searchText(item).toLowerCase().includes(q))
    if (sort) {
      const get = (item) => (sortValue ? sortValue(item, sort.key) : item[sort.key])
      list = [...list].sort((a, b) => {
        const [x, y] = [get(a), get(b)]
        if (x == null) return 1
        if (y == null) return -1
        const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })
        return sort.dir === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [items, filterFn, searchText, sortValue, debounced, sort])

  useEffect(() => setPage(1), [debounced, resetKey, pageSize])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key) =>
    setSort((s) => (s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }))

  return {
    query,
    setQuery,
    sort,
    toggleSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    rows,
    filtered,
    total: filtered.length,
    isSearching: query !== debounced,
  }
}
