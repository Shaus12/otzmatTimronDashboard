import Link from "next/link";
import { ArrowLeft, Check, Clock3, ListChecks } from "lucide-react";
import type { Task } from "@/lib/data/types";
import { formatDate, taskStatusLabels } from "@/lib/labels";

export function OpenTasksPanel({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => t.status !== "done");

  return (
    <section className="task-panel">
      <div className="section-heading">
        <h2>
          על סדר היום{" "}
          <span className="count-badge">{open.length}</span>
        </h2>
        <ListChecks size={20} />
      </div>
      <p className="panel-intro">המשימות הפתוחות של החברה</p>
      <div className="task-list">
        {open.length ? (
          open.slice(0, 4).map((task, index) => (
            <div key={task.id} className="task-entry static">
              <span className="task-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <span className="task-status">
                  <Clock3 size={13} />
                  {task.dueDate
                    ? formatDate(task.dueDate)
                    : taskStatusLabels[task.status]}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="all-done">
            <Check size={20} />
            אין משימות פתוחות
          </p>
        )}
      </div>
      <Link className="panel-footer" href="/tasks">
        לכל המשימות
        <ArrowLeft size={16} />
      </Link>
    </section>
  );
}
