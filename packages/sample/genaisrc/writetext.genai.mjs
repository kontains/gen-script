script({ model: "small", tests: {} })
writeText("You an assistant.", { role: "system" })
writeText("You are helpful.", { role: "system" })
writeText("Write a poem.", { role: "user" })
writeText("Once upon a time", { role: "assistant" })
writeText("More formal.", { role: "user" })
writeText("Let's start:", { role: "assistant" })