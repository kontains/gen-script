/// <reference path="./types/prompt_template.d.ts" />

import { host } from "./host"

type PromptScript = globalThis.PromptScript
export type { PromptScript }

export interface FileReference {
    name: string
    filename: string
}

export function diagnosticsToCSV(diagnostics: Diagnostic[], sep: string) {
    return diagnostics
        .map(({ severity, filename, range, code, message }) =>
            [
                severity,
                filename,
                range[0][0],
                range[1][0],
                code || "",
                message,
            ].join(sep)
        )
        .join("\n")
}

export function templateGroup(template: PromptScript) {
    return (
        template.group ||
        (/^system/i.test(template.id) ? "system" : "") ||
        "unassigned"
    )
}

export const eolPosition = 0x3fffffff
export const eofPosition: CharPosition = [0x3fffffff, 0]

export class Project {
    readonly rootFiles: TextFile[] = []
    readonly allFiles: TextFile[] = []
    readonly templates: PromptScript[] = []
    readonly diagnostics: Diagnostic[] = []

    _finalizers: (() => void)[] = []

    folders() {
        const res: string[] = Array.from(
            new Set(
                Object.values(this.templates)
                    .filter((t) => t.filename)
                    .map((t) => host.path.dirname(t.filename))
            )
        )
        return res
    }

    getTemplate(id: string) {
        return this.templates.find((t) => t.id == id)
    }

    resolve(filename: string) {
        return this.allFiles.find((file) => filename === file.filename)
    }
}

export class TextFile {
    constructor(
        public readonly project: Project,
        public readonly filename: string,
        public readonly mime: string,
        public readonly content: string
    ) {}

    relativeName() {
        const prj = host.projectFolder()
        if (this.filename.startsWith(prj))
            return this.filename.slice(prj.length).replace(/^[\/\\]*/, "")
        return this.filename
    }
}
