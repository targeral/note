**
WorkPhase is an enum that represents the currently executing phase of
the React update -> render -> commit cycle. However, in practice, it's
hard to use because different "phases" can be nested inside each other.
For example, the commit phase can be nested inside the
"batched phase."

This replaces WorkPhase with a different concept: ExecutionContext.
ExecutionContext is a bitmask instead of an enum. It represents a stack
of React entry points. For example, when `batchedUpdates` is called
from inside an effect, the ExecutionContext is
`BatchedContext | CommitContext`.
**