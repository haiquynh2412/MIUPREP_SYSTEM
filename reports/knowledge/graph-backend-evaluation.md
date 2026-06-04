# Graph Backend Evaluation

Generated at: 2026-06-04T07:12:05.084Z

## Decision

- Status: pass
- Recommendation: keep_indexed_package_graph
- Graph DB criteria met: 0
- Graph DB evaluation eligible: no
- Migration allowed now: no
- Rollback plan required: no
- Client direct DB access allowed: no

Detail: Current indexed package graph is sufficient for this graph size and measured traversal workload.

## Graph Stats

- Nodes: 237
- Edges: 133
- Domains: 2
- Programs: 13
- Concepts: 77
- Skills: 83
- Objectives: 23
- Misconceptions: 17
- Lesson templates: 22
- Cross-domain programs: 1

## Benchmark

- Queries: 46
- Elapsed ms: 7
- Max query ms: 1
- Average query ms: 0.04
- Max closure size: 2
- Average closure size: 0.04
- Max prerequisite depth: 2

## Criteria

| Criterion | Met | Evidence | Next step |
| --- | --- | --- | --- |
| indexed_query_performance_limit | no | query=1ms threshold=25ms | Try cached traversal or relational/indexed storage before Graph DB. |
| content_volume_limit | no | nodes=237/25000, edges=133/75000 | Move from static package graph only after volume exceeds configured limits. |
| cross_program_traversal_complexity | no | crossDomainPrograms=1/3, maxDepth=2/8 | Prefer cached graph traversal in @miuprep/knowledge until multi-hop complexity is proven. |
| admin_deep_multi_hop_need | no | no admin multi-hop requirement supplied | Document admin review queries before choosing a graph-native backend. |
| runtime_graph_traversal_need | no | no runtime traversal requirement supplied | Keep client apps independent of database shape; expose package/service APIs only. |

## Validation

- Validation ok: yes
- Errors: 0
- Warnings: 0
