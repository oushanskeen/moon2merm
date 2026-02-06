const moon2mermaidBox = (moonGraph, runReport) => {

    // TODO: add tests
    // TODO: fix functio names
    // TODO: add memo
    // TODO: add asserted requirements
    // TODO: add explicit invariants
    // TODO: add input validations
    // TODO: generally assess adn mitigate risks

    const deps = (moonGraph) => moonGraph.graph.nodes.map(e => ({ id: "config:" + e.id, deps: e.deps }))

    const stratReady = (dependencies) => {
        return dependencies.map(e => {
            const acc = []
            if (e.deps != undefined && e.deps.length > 0) {
                for (const depIndex in e.deps) {
                    acc.push({ name: e.id, parent: e.deps[depIndex].target })
                }
            } else {
                acc.push({ name: e.id, parent: "void" })
            }
            return acc
        }).flatMap(e => e)
    }

    // TODO: fix regex for replace
    const getRunReportStatusFrom_ = (runReport) => runReport.actions.filter(e => e.label.includes("RunTask"))
        .map(({ label, error, status }) => ({ label: label.replace("RunTask(", "").replace(")", ""), error, status }))

    const enrich_withStatusFrom_ = (stratReady, runReportStatus) => stratReady.map(stratReadyRecord => {
        const statusObject = runReportStatus.filter(runReportStatusRecord => stratReadyRecord.name == runReportStatusRecord.label)
        if (statusObject.length > 0) {
            return { ...stratReadyRecord, status: statusObject[0].status }
        } else {
            return { ...stratReadyRecord, status: "unknown" }
        }
    })

    const getGraphReadyFormatFrom_ = (stratReadyStatusEnriched) =>
        stratReadyStatusEnriched.map(e => ({ source: e.name, target: e.parent, type: e.status }))

    const makeMermaidStringFrom_ = (stratReadyStatusEnreachedGraphReady) => [
        "```mermaid",
        "stateDiagram-v2",
        stratReadyStatusEnreachedGraphReady.map(e => {
            return e.source.replace(":", "_") + " --> " + e.target.replace(":", "_") + " : require " +
                (e.type == "unknown" ? "🔵"
                    : e.type == "failed" ? "🔴" : "🟢")
        }).join("\n"),
        "```"
    ].join("\n")

    // moonToMermaidBox
    const $ = {
        deps: deps,
        stratReady: stratReady,
        getRunReportStatusFrom_: getRunReportStatusFrom_,
        enrich_withStatusFrom_: enrich_withStatusFrom_,
        makeMermaidStringFrom_: makeMermaidStringFrom_,
        getGraphReadyFormatFrom_: getGraphReadyFormatFrom_,

        dependencies: () => $.deps(moonGraph),
        stratReadyData: () => $.stratReady($.dependencies()),
        runReportStatus: () => $.getRunReportStatusFrom_(runReport),
        stratReadyStatusEnriched: () => $.enrich_withStatusFrom_($.stratReadyData(), $.runReportStatus()),
        stratReadyStatusEnreachedGraphReady: () => $.getGraphReadyFormatFrom_($.stratReadyStatusEnriched()),
        mermaidString: () => $.makeMermaidStringFrom_($.stratReadyStatusEnreachedGraphReady())
    }
    return $
}

export default moon2mermaidBox