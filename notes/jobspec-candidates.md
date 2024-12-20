the biggest immediate technical challenge of the project is in how to specify and execute `budgeted-inference` requests.

Some relevant reference materials:

# https://www.anthropic.com/research/building-effective-agents

general overview of the space of `agentic systems` - EG, larger input-output pipelines that use LLMs as intermediate components.

# workflow specification libraries

These are candidates or prototypes to system back-ends:

- https://langchain-ai.github.io/langgraph/
- https://rivet.ironcladapp.com/
- https://www.vellum.ai/
- https://github.com/PySpur-Dev/PySpur

all are systems to specify LLM workflows. Some programmatically only, others via drag-drop UIs.

The workflow definitions are typically exportable as, eg, JSON.

# expanding for budgeting

the above do not seem designed with agentic budget management in mind.

But: they seem amenable to extension, with budget assignments as, eg, additional tool definitions accessable.
