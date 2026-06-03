"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED";

type Goal = {
  id: string;
  title: string;
  type: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  status: GoalStatus;
  deadline: string | null;
};

const emptyGoal = {
  title: "",
  type: "Workout Count",
  targetValue: "",
  currentValue: "0",
  unit: "workouts",
  status: "ACTIVE" as GoalStatus,
  deadline: ""
};

function deadlineInputValue(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export function GoalManager() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState(emptyGoal);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadGoals() {
    setLoading(true);
    const response = await fetch("/api/goals");
    const data = await response.json();
    setGoals(data.goals ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadGoals();
  }, []);

  async function submitGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(editingGoalId ? `/api/goals/${editingGoalId}` : "/api/goals", {
      method: editingGoalId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Could not save goal.");
      return;
    }

    setForm(emptyGoal);
    setEditingGoalId(null);
    await loadGoals();
  }

  function editGoal(goal: Goal) {
    setEditingGoalId(goal.id);
    setForm({
      title: goal.title,
      type: goal.type,
      targetValue: String(goal.targetValue),
      currentValue: String(goal.currentValue),
      unit: goal.unit,
      status: goal.status,
      deadline: deadlineInputValue(goal.deadline)
    });
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    await loadGoals();
  }

  async function completeGoal(goal: Goal) {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...goal, currentValue: goal.targetValue, status: "COMPLETED" })
    });
    await loadGoals();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fern">Goals</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Progress targets</h1>
        </div>
        <button
          className="focus-ring flex items-center justify-center gap-2 rounded-[8px] border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
          onClick={loadGoals}
          type="button"
        >
          <RefreshCw aria-hidden size={16} />
          Refresh
        </button>
      </div>

      {message ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm" onSubmit={submitGoal}>
          <h2 className="text-lg font-semibold text-ink">{editingGoalId ? "Edit goal" : "Add goal"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">Title</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Run 40 km this month"
                required
                value={form.title}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Type</span>
              <select
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                value={form.type}
              >
                <option>Workout Count</option>
                <option>Calories</option>
                <option>Strength</option>
                <option>Cardio</option>
                <option>Habit</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Status</span>
              <select
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setForm({ ...form, status: event.target.value as GoalStatus })}
                value={form.status}
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Target</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                min="0"
                onChange={(event) => setForm({ ...form, targetValue: event.target.value })}
                required
                type="number"
                value={form.targetValue}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Current</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                min="0"
                onChange={(event) => setForm({ ...form, currentValue: event.target.value })}
                required
                type="number"
                value={form.currentValue}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Unit</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                placeholder="workouts"
                required
                value={form.unit}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Deadline</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                type="date"
                value={form.deadline}
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-[8px] bg-fern px-4 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              <Plus aria-hidden size={16} />
              {editingGoalId ? "Update" : "Add"}
            </button>
            {editingGoalId ? (
              <button
                className="focus-ring rounded-[8px] border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => {
                  setEditingGoalId(null);
                  setForm(emptyGoal);
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Goal list</h2>
          <div className="mt-4 space-y-4">
            {loading ? <p className="text-sm text-ink/60">Loading goals...</p> : null}
            {!loading && goals.length === 0 ? <p className="text-sm text-ink/60">No goals yet.</p> : null}
            {goals.map((goal) => {
              const progress = Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
              return (
                <article className="rounded-[8px] border border-ink/10 p-4" key={goal.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-ink">{goal.title}</h3>
                        <span className="rounded-[8px] bg-mist px-2 py-1 text-xs font-semibold text-ink/65">
                          {goal.status.toLowerCase()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink/55">
                        {goal.type} · {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                      {goal.deadline ? (
                        <p className="mt-1 text-sm text-ink/45">
                          Deadline {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="focus-ring rounded-[8px] border border-emerald-200 p-2 text-emerald-700"
                        onClick={() => completeGoal(goal)}
                        title="Complete goal"
                        type="button"
                      >
                        <CheckCircle2 aria-hidden size={16} />
                      </button>
                      <button
                        className="focus-ring rounded-[8px] border border-ink/10 p-2 text-ink"
                        onClick={() => editGoal(goal)}
                        title="Edit goal"
                        type="button"
                      >
                        <Pencil aria-hidden size={16} />
                      </button>
                      <button
                        className="focus-ring rounded-[8px] border border-red-200 p-2 text-red-700"
                        onClick={() => deleteGoal(goal.id)}
                        title="Delete goal"
                        type="button"
                      >
                        <Trash2 aria-hidden size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-semibold text-ink/55">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-mist">
                      <div className="h-3 rounded-full bg-fern" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
