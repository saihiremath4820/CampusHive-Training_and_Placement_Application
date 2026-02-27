import { useState } from "react";
import { useStudent } from "../../context/StudentContext";

/* ---------- DUMMY STUDENT POOL ---------- */
const STUDENTS = [
  { name: "Amit", skills: ["react", "javascript"] },
  { name: "Sneha", skills: ["python", "machine learning"] },
  { name: "Rahul", skills: ["node.js", "express"] },
  { name: "Priya", skills: ["ui/ux", "css"] },
  { name: "Karan", skills: ["data structures", "c++"] },
];

export default function TeamFormation() {
  const { projects, addProject } = useStudent();

  const [title, setTitle] = useState("");
  const [skills, setSkills] = useState("");

  const handleCreate = () => {
    if (!title || !skills) {
      alert("Please enter project title and required skills");
      return;
    }

    addProject({
      title,
      requiredSkills: skills
        .split(",")
        .map((s) => s.trim().toLowerCase()),
    });

    setTitle("");
    setSkills("");
  };

  const suggestTeammates = (requiredSkills) => {
    return STUDENTS.filter((s) =>
      s.skills.some((skill) => requiredSkills.includes(skill))
    );
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Team Formation</h2>

      {/* ---------- CREATE PROJECT ---------- */}
      <div className="bg-white border p-5 rounded-lg space-y-3">
        <h3 className="font-semibold">Create Project</h3>

        <input
          placeholder="Project Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Required Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <button
          onClick={handleCreate}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Create Project
        </button>
      </div>

      {/* ---------- PROJECT LIST ---------- */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">My Projects</h3>

        {projects.length === 0 ? (
          <p className="text-gray-500">
            No projects created yet.
          </p>
        ) : (
          projects.map((p) => {
            const suggestions = suggestTeammates(
              p.requiredSkills
            );

            return (
              <div
                key={p.id}
                className="bg-blue-50 border border-blue-200 p-5 rounded-lg"
              >
                <h4 className="font-semibold">{p.title}</h4>

                <p className="text-sm mt-1">
                  <strong>Required Skills:</strong>{" "}
                  {p.requiredSkills.join(", ")}
                </p>

                <p className="mt-3 font-medium">
                  Suggested Teammates:
                </p>

                {suggestions.length === 0 ? (
                  <p className="text-gray-500">
                    No matching students found.
                  </p>
                ) : (
                  <ul className="list-disc ml-5">
                    {suggestions.map((s) => (
                      <li key={s.name}>
                        {s.name} —{" "}
                        <span className="text-sm text-gray-600">
                          {s.skills.join(", ")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-3 text-sm text-gray-600 italic">
                  Faculty can assign teams (coming soon)
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
