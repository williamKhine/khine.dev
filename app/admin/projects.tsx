"use client";

import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { useState, type FormEvent } from "react";
import { CaseStudyMarkdown } from "@/components/case-study-markdown";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

const inputClass = "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2";

export function Projects() {
  const projects = useQuery(api.projects.list);
  const setPublished = useMutation(api.projects.setPublished);
  const move = useMutation(api.projects.move);
  const [editing, setEditing] = useState<Doc<"projects"> | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function update(operation: () => Promise<unknown>) {
    setPending(true);
    setError("");
    try {
      await operation();
    } catch (error) {
      setError(error instanceof ConvexError && typeof error.data === "string" ? error.data : "Could not update the Project.");
    } finally {
      setPending(false);
    }
  }

  if (!projects) return <p role="status">Loading Projects…</p>;
  const published = projects.filter((project) => project.published);
  const ordered = [...published, ...projects.filter((project) => !project.published)];

  return (
    <section className="space-y-6" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="font-display text-3xl">Projects</h2>
      <ProjectForm key={editing?._id ?? "new"} project={editing} close={() => setEditing(null)} />
      {error && <p role="alert">{error}</p>}
      <ul aria-label="Projects" className="divide-y divide-border border-t border-border">
        {ordered.map((project, index) => (
          <li key={project._id} className="space-y-2 py-4">
            <h3 className="font-medium">{project.title}</h3>
            <p className="text-sm">{project.published ? "Published" : "Draft"} · /case-studies/{project.slug}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setEditing(project)}>Edit Project</Button>
              <Button variant="outline" disabled={pending} onClick={() => update(() => setPublished({ id: project._id, published: !project.published }))}>
                {project.published ? "Unpublish Project" : "Publish Project"}
              </Button>
              {project.published && (
                <>
                  <Button variant="ghost" disabled={pending || index === 0} onClick={() => update(() => move({ id: project._id, direction: "up" }))}>Move up</Button>
                  <Button variant="ghost" disabled={pending || index === published.length - 1} onClick={() => update(() => move({ id: project._id, direction: "down" }))}>Move down</Button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectForm({ project, close }: { project: Doc<"projects"> | null; close: () => void }) {
  const save = useMutation(api.projects.save);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [markdown, setMarkdown] = useState(project?.markdown ?? "");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await save({ id: project?._id, title, slug, summary, markdown });
      setTitle("");
      setSlug("");
      setSummary("");
      setMarkdown("");
      setPreview(false);
      close();
    } catch (error) {
      setError(error instanceof ConvexError && typeof error.data === "string" ? error.data : "Could not save the Project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border p-5" aria-label={project ? "Edit Project" : "New Project"}>
      <fieldset disabled={pending} className="min-w-0 space-y-4">
        <label className="block text-sm">Project title<input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label className="block text-sm">URL slug<input className={inputClass} value={slug} onChange={(event) => setSlug(event.target.value)} readOnly={!!project} required /></label>
        <label className="block text-sm">Summary<textarea className={inputClass} value={summary} onChange={(event) => setSummary(event.target.value)} required /></label>
        <label className="block text-sm">Case Study Markdown
          <textarea className={inputClass} rows={9} value={markdown} onChange={(event) => setMarkdown(event.target.value)} aria-describedby="markdown-hint" />
        </label>
        <p id="markdown-hint" className="text-sm">Describe the problem, your contribution, a technical trade-off, and the outcome or what remains unmeasured. You can include Markdown links and images.</p>
        <Button type="button" variant="outline" aria-pressed={preview} onClick={() => setPreview(!preview)}>Preview Case Study</Button>
        {preview && <section aria-label="Case Study preview" className="rounded border border-border p-4"><CaseStudyMarkdown markdown={markdown} /></section>}
        {error && <p role="alert">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit">{project ? "Save Project" : "Create draft"}</Button>
          {project && <Button type="button" variant="ghost" onClick={close}>Cancel</Button>}
        </div>
      </fieldset>
    </form>
  );
}
