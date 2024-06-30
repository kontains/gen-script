import { assert } from "console"
import { host } from "./host"
import { logError, logVerbose } from "./util"
import { TraceOptions } from "./trace"

function resolveGlobal(): any {
    if (typeof window !== "undefined")
        return window // Browser environment
    else if (typeof self !== "undefined") return self
    else if (typeof global !== "undefined") return global // Node.js environment
    throw new Error("Could not find global")
}

export async function importPrompt(
    ctx0: PromptContext,
    r: PromptScript,
    options?: {
        logCb?: (msg: string) => void
    } & TraceOptions
) {
    const { filename } = r
    if (!filename) throw new Error("filename is required")
    const { trace } = options || {}

    const oldGlb: any = {}
    const glb: any = resolveGlobal()
    try {
        // override global context
        for (const field of Object.keys(ctx0)) {
            assert(
                field === "console" || !glb[field],
                `overriding global field ${field}`
            )
            oldGlb[field] = glb[field]
            glb[field] = (ctx0 as any)[field]
        }

        const modulePath = host.path.isAbsolute(filename)
            ? filename
            : host.path.join(host.projectFolder(), filename)
        const parentURL =
            import.meta.url ??
            new URL(__filename ?? host.projectFolder(), "file://").href

        trace?.itemValue(`import`, `${modulePath}, parent: ${parentURL}`)
        const { tsImport } = await import("tsx/esm/api")
        const module = await tsImport(modulePath, {
            parentURL,
            tsconfig: false,
            onImport: (file: string) => {
                trace?.itemValue("📦 imported", file)
            },
        })
        const main = module.default
        if (typeof main === "function") await main(ctx0)
    } catch (err) {
        logError(err)
        trace?.error(err)
        throw err
    } finally {
        // restore global context
        for (const field of Object.keys(oldGlb)) {
            const v = oldGlb[field]
            if (v === undefined) delete glb[field]
            else glb[field] = oldGlb[field]
        }
    }
}
