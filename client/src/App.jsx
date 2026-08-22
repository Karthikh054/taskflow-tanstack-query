import {
  createTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "./services/todoApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Check, Circle } from "lucide-react";

function App() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search]);

  const { data, isError, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["todos", { search: debouncedSearch, status }],
    queryFn: () => getTodos({ search: debouncedSearch, status }),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
      setTitle("");
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
    onError: (error) => {
      console.error("Delete todo failed", error);
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
      setEditingTodo(null);
      setEditTitle("");
    },
    onError: (error) => {
      console.error("Update todo failed", error);
    },
  });

  const visibleTodos = data?.filter((todo) =>
    todo.title.toLowerCase().includes(search.trim().toLowerCase())
  ) ?? [];
  

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-500">Loading todos....</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-red-50 p-6 text-red-600">
          Error: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="relative mx-auto max-w-5xl px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-900">TaskFlow</h1>

          <p className="text-sm text-slate-500">Simple task management</p>
          <button
            onClick={async () => {
              setIsRefreshing(true);
              try {
                await refetch();
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mt-8">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-11 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
            {isFetching && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        Searching...
      </span>
    )}
          </div>
          <div className="mt-4 flex gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Active", value: "active" },
              { label: "Completed", value: "completed" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatus(filter.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  status === filter.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (title.trim()) {
                  createTodoMutation.mutate(title);
                }
              }
            }}
            placeholder="What do you need to do?"
            className="flex-1 rounded-xl border bg-white px-4 py-3  outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            onClick={() => {
              if (title.trim()) {
                createTodoMutation.mutate(title);
              }
            }}
            disabled={createTodoMutation.isPending}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createTodoMutation.isPending ? "Adding.." : "Add"}
          </button>
        </div>

        <div className="mt-8 max-h-[500px] space-y-3 overflow-y-auto pr-2">
          {visibleTodos.map((todo) => (
            <div
              key={todo._id}
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-4">
                <button
                  onClick={() => {
                    updateTodoMutation.mutate({
                      id: todo._id,
                      title: todo.title,
                      completed: !todo.completed,
                    });
                  }}
                  disabled={updateTodoMutation.isPending}
                  title={
                    todo.completed ? "Mark as active" : "Mark as completed"
                  }
                  className="shrink-0"
                >
                  {todo.completed ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-700">
                      <Check size={16} strokeWidth={3} />
                    </div>
                  ) : (
                    <Circle
                      size={28}
                      strokeWidth={1.8}
                      className="text-slate-300 transition hover:text-indigo-500"
                    />
                  )}
                </button>

                <div className="min-w-0">
                  <p
                    className={`truncate font-medium ${
                      todo.completed
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {todo.title}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {todo.completed ? "Completed" : "In progress"}
                  </p>
                </div>
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-1">
                <button
                  onClick={() => {
                    setEditingTodo(todo);
                    setEditTitle(todo.title);
                  }}
                  title="Edit todo"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => deleteTodoMutation.mutate(todo._id)}
                  disabled={deleteTodoMutation.isPending}
                  title="Delete todo"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {editingTodo && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900">Edit Todo</h3>

              <p className="mt-1 text-sm text-slate-500">
                Update your task details.
              </p>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-6 w-full rounded-xl border px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingTodo(null);
                    setEditTitle("");
                  }}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!editTitle.trim()) {
                      return;
                    }

                    updateTodoMutation.mutate({
                      id: editingTodo._id,
                      title: editTitle.trim(),
                      completed: editingTodo.completed,
                    });
                  }}
                  disabled={updateTodoMutation.isPending}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {updateTodoMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
