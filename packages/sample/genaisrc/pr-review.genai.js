script({
    model: "openai:gpt-4",
    files: [],
    title: "pull request review",
    system: ["system", "system.typescript"],
    tools: ["fs_find_files", "fs_read_file"],
})

const { stdout: diff } = await host.exec("git", [
    "diff",
    "main",
    "--",
    "**.ts",
    ":!**/genaiscript.d.ts",
    ":!genaisrc/*",
    ":!.github/*",
    ":!.vscode/*",
    ":!yarn.lock",
])

def("GIT_DIFF", diff, {
    language: "diff",
    maxTokens: 20000,
})

$`You are an expert software developer and architect. You are
an expert in software reliability, security, scalability, and performance.

## Task

GIT_DIFF contains the changes the pull request branch.

Analyze the changes in GIT_DIFF in your mind.

If the changes look good, respond "LGTM :rocket:". If you have any concerns, provide a brief description of the concerns.

- All the TypeScript files are compiled and type-checked by the TypeScript compiler. Do not report issues that the TypeScript compiler would find.
- only report functional issues
- Use emojis
- If available, suggest code fixes and improvements
`