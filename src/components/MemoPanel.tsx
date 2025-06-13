'use client'

import { useEffect, useState } from 'react'

const LOCAL_STORAGE_KEY = 'memoList'

type MemoItem = {
  text: string
  timestamp: string
}

export default function MemoPanel() {
  const [memo, setMemo] = useState('')
  const [memoList, setMemoList] = useState<MemoItem[]>([])
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const getNowTime = () =>
    new Date().toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  const saveToLocal = (list: MemoItem[]) => {
    setMemoList(list)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list))
  }

  const handleSave = () => {
    if (memo.trim() === '') return
    const newMemo: MemoItem = {
      text: memo.trim(),
      timestamp: getNowTime(),
    }
    saveToLocal([...memoList, newMemo])
    setMemo('')
  }

  const handleDelete = (index: number) => {
    const updated = memoList.filter((_, i) => i !== index)
    saveToLocal(updated)
  }

  const startEdit = (index: number) => {
    setEditIndex(index)
    setEditText(memoList[index].text)
  }

  const cancelEdit = () => {
    setEditIndex(null)
    setEditText('')
  }

  const saveEdit = () => {
    if (editIndex === null || editText.trim() === '') return
    const updated = [...memoList]
    updated[editIndex] = {
      ...updated[editIndex],
      text: editText.trim(),
      timestamp: getNowTime(),
    }
    saveToLocal(updated)
    cancelEdit()
  }

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMemoList(parsed)
      } catch (e) {
        console.warn('메모 복원 실패:', e)
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-full text-black dark:text-white">
      <h2 className="text-lg font-bold mb-2">📝 메모</h2>

      <textarea
        placeholder="메모를 입력하세요..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="w-full h-32 p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded resize-none mb-2"
      />

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mb-4"
      >
        저장
      </button>

      <div className="overflow-auto flex-grow">
        <h3 className="text-md font-semibold mb-2">🗂 저장된 메모</h3>

        {memoList.length === 0 ? (
          <p className="text-gray-400">저장된 메모가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {memoList.map((m, idx) => (
              <li
                key={idx}
                className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm relative cursor-pointer group"
              >
                {editIndex === idx ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full h-24 p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white resize-none"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex justify-between text-sm">
                      <button
                        onClick={saveEdit}
                        className="text-blue-500 hover:underline"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-500 hover:underline"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs text-gray-500 mb-1">
                      ⏱ {m.timestamp}
                    </div>
                    <div
                      className="overflow-hidden text-ellipsis line-clamp-3"
                      onClick={() => startEdit(idx)}
                    >
                      {m.text}
                    </div>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-xs"
                    >
                      ❌
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
