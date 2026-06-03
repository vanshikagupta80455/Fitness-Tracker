"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

type Exercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  duration: number | null;
  calories: number | null;
};

type Workout = {
  id: string;
  title: string;
  date: string;
  notes: string | null;
  exercises: Exercise[];
};

const emptyWorkout = { title: "", date: new Date().toISOString().slice(0, 10), notes: "" };
const emptyExercise = { name: "", sets: "", reps: "", weight: "", duration: "", calories: "" };

function dateInputValue(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function metric(value: number | null, suffix = "") {
  return value === null ? "-" : `${value}${suffix}`;
}

export function WorkoutManager() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutForm, setWorkoutForm] = useState(emptyWorkout);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadWorkouts() {
    setLoading(true);
    const response = await fetch("/api/workouts");
    const data = await response.json();
    setWorkouts(data.workouts ?? []);
    setActiveWorkoutId((current) => current ?? data.workouts?.[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void loadWorkouts();
  }, []);

  const activeWorkout = useMemo(
    () => workouts.find((workout) => workout.id === activeWorkoutId) ?? workouts[0],
    [activeWorkoutId, workouts]
  );

  async function submitWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(editingWorkoutId ? `/api/workouts/${editingWorkoutId}` : "/api/workouts", {
      method: editingWorkoutId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workoutForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Could not save workout.");
      return;
    }

    setWorkoutForm(emptyWorkout);
    setEditingWorkoutId(null);
    setActiveWorkoutId(data.workout.id);
    await loadWorkouts();
  }

  async function submitExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkout) {
      setMessage("Create a workout before adding exercises.");
      return;
    }

    const endpoint = editingExerciseId
      ? `/api/exercises/${editingExerciseId}`
      : `/api/workouts/${activeWorkout.id}/exercises`;
    const response = await fetch(endpoint, {
      method: editingExerciseId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(exerciseForm)
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error ?? "Could not save exercise.");
      return;
    }

    setExerciseForm(emptyExercise);
    setEditingExerciseId(null);
    await loadWorkouts();
  }

  async function deleteWorkout(id: string) {
    await fetch(`/api/workouts/${id}`, { method: "DELETE" });
    if (activeWorkoutId === id) {
      setActiveWorkoutId(null);
    }
    await loadWorkouts();
  }

  async function deleteExercise(id: string) {
    await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    await loadWorkouts();
  }

  function editWorkout(workout: Workout) {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({ title: workout.title, date: dateInputValue(workout.date), notes: workout.notes ?? "" });
  }

  function editExercise(exercise: Exercise) {
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name,
      sets: String(exercise.sets ?? ""),
      reps: String(exercise.reps ?? ""),
      weight: String(exercise.weight ?? ""),
      duration: String(exercise.duration ?? ""),
      calories: String(exercise.calories ?? "")
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fern">Workouts</p>
          <h1 className="mt-1 text-3xl font-semibold text-ink">Training log</h1>
        </div>
        <button
          className="focus-ring flex items-center justify-center gap-2 rounded-[8px] border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm"
          onClick={loadWorkouts}
          type="button"
        >
          <RefreshCw aria-hidden size={16} />
          Refresh
        </button>
      </div>

      {message ? <p className="rounded-[8px] bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm" onSubmit={submitWorkout}>
          <h2 className="text-lg font-semibold text-ink">{editingWorkoutId ? "Edit workout" : "Add workout"}</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Title</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setWorkoutForm({ ...workoutForm, title: event.target.value })}
                placeholder="Leg day"
                required
                value={workoutForm.title}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Date</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setWorkoutForm({ ...workoutForm, date: event.target.value })}
                required
                type="date"
                value={workoutForm.date}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Notes</span>
              <textarea
                className="focus-ring mt-2 min-h-24 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setWorkoutForm({ ...workoutForm, notes: event.target.value })}
                placeholder="Session notes"
                value={workoutForm.notes}
              />
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-[8px] bg-fern px-4 py-2 text-sm font-semibold text-white"
              type="submit"
            >
              <Plus aria-hidden size={16} />
              {editingWorkoutId ? "Update" : "Add"}
            </button>
            {editingWorkoutId ? (
              <button
                className="focus-ring rounded-[8px] border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => {
                  setEditingWorkoutId(null);
                  setWorkoutForm(emptyWorkout);
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Workout sessions</h2>
          <div className="mt-4 space-y-3">
            {loading ? <p className="text-sm text-ink/60">Loading workouts...</p> : null}
            {!loading && workouts.length === 0 ? (
              <p className="text-sm text-ink/60">No workouts yet. Add one to begin.</p>
            ) : null}
            {workouts.map((workout) => (
              <button
                className={`focus-ring w-full rounded-[8px] border p-4 text-left transition ${
                  activeWorkout?.id === workout.id
                    ? "border-fern bg-fern/5"
                    : "border-ink/10 bg-white hover:border-ink/20"
                }`}
                key={workout.id}
                onClick={() => setActiveWorkoutId(workout.id)}
                type="button"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{workout.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink/55">
                      <CalendarDays aria-hidden size={15} />
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                    {workout.notes ? <p className="mt-2 text-sm text-ink/60">{workout.notes}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-[8px] bg-mist px-3 py-1 text-xs font-semibold text-ink/70">
                      {workout.exercises.length} exercises
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm" onSubmit={submitExercise}>
          <h2 className="text-lg font-semibold text-ink">
            {editingExerciseId ? "Edit exercise" : `Add exercise${activeWorkout ? ` to ${activeWorkout.title}` : ""}`}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                onChange={(event) => setExerciseForm({ ...exerciseForm, name: event.target.value })}
                placeholder="Squat"
                required
                value={exerciseForm.name}
              />
            </label>
            {(["sets", "reps", "weight", "duration", "calories"] as const).map((field) => (
              <label className="block" key={field}>
                <span className="text-sm font-medium capitalize text-ink">{field}</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border-ink/15"
                  min="0"
                  onChange={(event) => setExerciseForm({ ...exerciseForm, [field]: event.target.value })}
                  type="number"
                  value={exerciseForm[field]}
                />
              </label>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button
              className="focus-ring flex items-center justify-center gap-2 rounded-[8px] bg-coral px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!activeWorkout}
              type="submit"
            >
              <Plus aria-hidden size={16} />
              {editingExerciseId ? "Update" : "Add"}
            </button>
            {editingExerciseId ? (
              <button
                className="focus-ring rounded-[8px] border border-ink/10 px-4 py-2 text-sm font-semibold text-ink"
                onClick={() => {
                  setEditingExerciseId(null);
                  setExerciseForm(emptyExercise);
                }}
                type="button"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="rounded-[8px] border border-ink/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">{activeWorkout?.title ?? "Exercises"}</h2>
              <p className="mt-1 text-sm text-ink/55">Select a workout to manage its exercise rows.</p>
            </div>
            {activeWorkout ? (
              <div className="flex gap-2">
                <button
                  className="focus-ring rounded-[8px] border border-ink/10 p-2 text-ink"
                  onClick={() => editWorkout(activeWorkout)}
                  title="Edit workout"
                  type="button"
                >
                  <Pencil aria-hidden size={16} />
                </button>
                <button
                  className="focus-ring rounded-[8px] border border-red-200 p-2 text-red-700"
                  onClick={() => deleteWorkout(activeWorkout.id)}
                  title="Delete workout"
                  type="button"
                >
                  <Trash2 aria-hidden size={16} />
                </button>
              </div>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-ink/10 text-xs uppercase text-ink/45">
                <tr>
                  <th className="py-3">Exercise</th>
                  <th className="py-3">Sets</th>
                  <th className="py-3">Reps</th>
                  <th className="py-3">Weight</th>
                  <th className="py-3">Duration</th>
                  <th className="py-3">Calories</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {activeWorkout?.exercises.length ? (
                  activeWorkout.exercises.map((exercise) => (
                    <tr key={exercise.id}>
                      <td className="py-3 font-medium text-ink">{exercise.name}</td>
                      <td className="py-3 text-ink/65">{metric(exercise.sets)}</td>
                      <td className="py-3 text-ink/65">{metric(exercise.reps)}</td>
                      <td className="py-3 text-ink/65">{metric(exercise.weight, " kg")}</td>
                      <td className="py-3 text-ink/65">{metric(exercise.duration, " min")}</td>
                      <td className="py-3 text-ink/65">{metric(exercise.calories)}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            className="focus-ring rounded-[8px] border border-ink/10 p-2 text-ink"
                            onClick={() => editExercise(exercise)}
                            title="Edit exercise"
                            type="button"
                          >
                            <Pencil aria-hidden size={15} />
                          </button>
                          <button
                            className="focus-ring rounded-[8px] border border-red-200 p-2 text-red-700"
                            onClick={() => deleteExercise(exercise.id)}
                            title="Delete exercise"
                            type="button"
                          >
                            <Trash2 aria-hidden size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-ink/55" colSpan={7}>
                      No exercises logged for this workout.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
