moon task-graph --json > ./test/moonGraphTestData.json
node ./bin/moon2merm.js --moonGraph ./test/moonGraphTestData.json --runReport ./.moon/cache/runReport.json --outdir ./test
