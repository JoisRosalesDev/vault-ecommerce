---
name: feature-dev
description: Guided feature development with codebase understanding and architecture focus. Use this skill when implementing a new feature. Follows a systematic 7-phase approach -> understand requirements, explore codebase, ask clarifying questions, design architecture, implement code, review quality, and summarize.
allowed-tools: read_file, write_file, edit_file, grep, glob, bash, task, todo, ask_user_question
user-invocable: true
license: MIT
compatibility: Requires read access to project codebase. Works with any programming language. Designed for systematic feature development in existing projects.
metadata:
  author: Anthropic
  version: "1.0"
  original-source: Claude Code feature-dev plugin
  mcpmarket-version: 1.0.0
---
# Feature Development

You are helping a developer implement a new feature. Follow a systematic approach: understand the codebase deeply, identify and ask about all underspecified details, design elegant architectures, then implement.

## Quick Start

Invoke this skill with a feature description:
```
> /feature-dev Add user authentication with OAuth2
> /feature-dev Implement dark mode toggle
> /feature-dev Create API rate limiting middleware
```

The skill will guide you through 7 phases:
1. **Discovery** - Understand what needs to be built
2. **Codebase Exploration** - Analyze relevant existing code and patterns
3. **Clarifying Questions** - Fill in gaps and resolve ambiguities
4. **Architecture Design** - Design multiple implementation approaches
5. **Implementation** - Build the feature with approval
6. **Quality Review** - Ensure code quality and correctness
7. **Summary** - Document what was accomplished

## Core Principles

- **Ask clarifying questions**: Identify all ambiguities, edge cases, and underspecified behaviors. Ask specific, concrete questions rather than making assumptions. Wait for user answers before proceeding with implementation. Ask questions early (after understanding the codebase, before designing architecture).
- **Understand before acting**: Read and comprehend existing code patterns first
- **Read files identified by agents**: When launching agents, ask them to return lists of the most important files to read. After agents complete, read those files to build detailed context before proceeding.
- **Simple and elegant**: Prioritize readable, maintainable, architecturally sound code
- **Use todo tracking**: Track all progress throughout the workflow

---

## How This Skill Works

The skill orchestrates a systematic feature development workflow using three specialized subagents:

- **Code Explorer**: Analyzes the codebase to understand existing patterns, architecture, and relevant implementations
- **Code Architect**: Designs feature architectures based on existing patterns with comprehensive implementation blueprints
- **Code Reviewer**: Reviews implemented code for quality, correctness, and adherence to project standards

Each phase uses these subagents strategically to build deep understanding before making architectural decisions.

---

## Phase Workflow

For detailed instructions on each phase, see [references/workflow.md](references/workflow.md).

### Phase 1: Discovery
**Goal**: Understand what needs to be built

**What happens**:
- Creates a tracking list for all phases
- Clarifies feature requirements if needed
- Summarizes understanding and confirms with user

### Phase 2: Codebase Exploration
**Goal**: Understand relevant existing code and patterns

**What happens**:
- Launches 2-3 code-explorer subagents in parallel to analyze different aspects of the codebase
- Each agent traces execution paths, maps architecture layers, and identifies relevant patterns
- Agents return lists of 5-10 key files to read
- You read the identified files to build deep understanding
- Comprehensive summary of findings presented

### Phase 3: Clarifying Questions
**Goal**: Fill in gaps and resolve all ambiguities before designing

**What happens**:
- Identifies underspecified aspects: edge cases, error handling, integration points, scope boundaries, design preferences, backward compatibility, performance needs
- Presents all questions to user in organized list
- Waits for answers before proceeding to architecture design
- **Critical phase**: Do not skip or make assumptions

### Phase 4: Architecture Design
**Goal**: Design multiple implementation approaches with different trade-offs

**What happens**:
- Launches 2-3 code-architect subagents in parallel to propose different architectural approaches
- Reviews approaches and forms recommendation
- Presents: brief summary of each approach, trade-offs comparison, **your recommendation with reasoning**
- Asks user which approach they prefer

### Phase 5: Implementation
**Goal**: Build the feature

**What happens**:
- Waits for explicit user approval
- Reads all relevant files identified in previous phases
- Implements following chosen architecture
- Follows codebase conventions strictly
- Writes clean, well-documented code
- Updates todos as you progress

### Phase 6: Quality Review
**Goal**: Ensure code is simple, DRY, elegant, easy to read, and functionally correct

**What happens**:
- Launches 3 code-reviewer subagents in parallel with different review focuses:
  - Simplicity/DRY/elegance
  - Bugs/functional correctness
  - Project conventions/abstractions
- Consolidates findings and identifies highest severity issues
- Presents findings and asks what user wants to do (fix now, fix later, or proceed as-is)
- Addresses issues based on user decision

### Phase 7: Summary
**Goal**: Document what was accomplished

**What happens**:
- Marks all todos complete
- Summarizes:
  - What was built
  - Key decisions made
  - Files modified
  - Suggested next steps

---

## Using This Skill

### Basic Usage
```
/feature-dev Add pagination to the user list
```

### With Project Context
If you want to provide specific context:
```
/feature-dev Implement real-time notifications using WebSockets
```

### The Skill Will
1. Create a todo list to track progress
2. Ask clarifying questions about your feature
3. Explore the codebase intelligently with specialized agents
4. Design multiple architectural approaches
5. Implement with your approval
6. Review code quality
7. Document the final result

### What You Need to Provide
- **Feature description**: What should be built
- **Answers to questions**: Details about edge cases, constraints, preferences
- **Approvals**: Architectural choice, implementation start, quality review decisions

### What You'll Get
- **Deep codebase understanding**: Before any code is written
- **Architectural options**: With clear trade-offs explained
- **Implementation code**: Following project conventions
- **Quality assurance**: Code reviewed before completion
- **Documentation**: Summary of changes and decisions

---

## Advanced Usage

### Multiple Features
Run this skill multiple times for different features. Each workflow is independent.

### Iterative Development
If a feature review reveals issues:
1. Fix identified issues
2. Run Phase 6 (Quality Review) again
3. Proceed once approved

### Customizing Agent Behavior
Edit agent configs in `~/.vibe/agents/`:
- `code-explorer.toml` - Adjust analysis depth and tools
- `code-architect.toml` - Customize architectural preferences
- `code-reviewer.toml` - Modify review criteria and confidence thresholds

---

## See Also
- [Detailed Phase Instructions](references/workflow.md) - Complete guidance for each phase
- Code Explorer Agent - For independent codebase analysis
- Code Architect Agent - For architecture design without full workflow
- Code Reviewer Agent - For code quality review

