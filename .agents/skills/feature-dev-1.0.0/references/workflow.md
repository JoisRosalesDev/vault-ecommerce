# Feature Development Workflow - Detailed Phases

This document provides comprehensive instructions for each phase of the feature development workflow. See [../SKILL.md](../SKILL.md) for overview.

---

## Phase 1: Discovery

**Goal**: Understand what needs to be built

**Initial Context**: Feature description provided by user (passed via skill arguments)

### Actions

1. **Create todo list with all phases**
   - Use the `todo` tool to create tracking tasks for all 7 phases
   - Mark phases as completed as you progress
   - Reference this list throughout the workflow

2. **If feature unclear, ask user for clarification**
   - What problem are they solving?
   - What should the feature do?
   - Any constraints or requirements?

3. **Summarize understanding and confirm**
   - Briefly restate what you understand
   - Confirm scope boundaries
   - Get user agreement before proceeding to Phase 2

### Example
```
User: /feature-dev Add API rate limiting
You:
- Create todo list for all 7 phases
- Ask: "Should this be per-user or per-IP? Global or per-endpoint? What about logging?"
- Summarize: "I understand you want to implement request rate limiting with these boundaries..."
- Wait for confirmation
```

---

## Phase 2: Codebase Exploration

**Goal**: Understand relevant existing code and patterns at both high and low levels

**Prerequisite**: Phase 1 complete, scope understood

### Actions

1. **Launch 2-3 code-explorer subagents in parallel**

   Each agent should:
   - Trace through the code comprehensively
   - Focus on understanding abstractions, architecture, and flow of control
   - Target different aspects of the codebase
   - Return a list of 5-10 key files to read

   **Example agent prompts**:
   ```
   Agent 1:
   "Find features similar to [feature] and trace through their implementation comprehensively.
   Map how [related feature] is implemented from entry points through data storage.
   Document the execution flow, key files, architectural patterns, and integration points.
   Return a list of the 5-10 most important files to understand this area."

   Agent 2:
   "Map the architecture and abstractions for [feature area], tracing through the code
   comprehensively. Identify the module boundaries, data flow patterns, and design decisions.
   How do components interact? What are the key abstractions and layers?
   Return the 5-10 key files needed to understand this architecture."

   Agent 3:
   "Identify UI patterns, testing approaches, error handling, and extension points relevant
   to [feature]. What conventions does this codebase follow?
   Return the 5-10 key files that exemplify these patterns."
   ```

2. **Read all files identified by agents**

   - Agents will return lists of 5-10 key files each
   - Collect all unique files mentioned
   - Read through them to build deep understanding
   - Take notes on patterns, conventions, architecture

3. **Present comprehensive summary of findings**

   Provide:
   - **Architecture overview**: Layers, components, data flow
   - **Similar features**: How related functionality is implemented
   - **Key patterns**: Design patterns, conventions, abstractions used
   - **Technology stack**: Languages, frameworks, libraries used in this area
   - **Integration points**: Where new feature will connect
   - **Potential challenges**: Technical debt, complexity, dependencies

---

## Phase 3: Clarifying Questions

**Goal**: Fill in gaps and resolve all ambiguities before designing

**CRITICAL**: This is one of the most important phases. DO NOT SKIP.

**Prerequisite**: Phase 2 complete, comprehensive codebase understanding

### Actions

1. **Review codebase findings and original feature request**
   - Consolidate what you learned in Phase 2
   - Note areas that are underspecified in the original request

2. **Identify underspecified aspects**

   Consider and ask about:
   - **Edge cases**: What should happen in unusual scenarios?
   - **Error handling**: How should errors be handled and reported?
   - **Integration points**: How does this connect to existing systems?
   - **Scope boundaries**: What's in scope? What's out of scope?
   - **Design preferences**: Any architectural preferences or constraints?
   - **Backward compatibility**: Must existing code/APIs be preserved?
   - **Performance needs**: Any performance targets or constraints?
   - **Testing approach**: What testing is expected?
   - **Documentation**: What needs to be documented?

3. **Present all questions to user in clear, organized list**
   - Group related questions
   - Be specific and concrete (not vague)
   - Provide context for why you're asking

4. **Wait for answers before proceeding to architecture design**
   - If user says "whatever you think is best", provide your recommendation and get explicit confirmation
   - Do not proceed without clarity on major decisions

### Example

```
Based on Phase 2 exploration, I have these clarifying questions:

**Scope & Behavior:**
1. Should the rate limit apply per-user or per-IP address?
2. Should it be enforced globally or per endpoint?
3. What time window (per-second, per-minute, per-hour)?

**Integration:**
4. Where should rate limit errors be logged?
5. Should admins have bypass capability?

**Error Handling:**
6. Return 429 Too Many Requests, or custom response?
7. Include retry-after header?

**Backward Compatibility:**
8. Must this work with existing API clients?
9. Any deprecation period needed?

Please answer these before we proceed to architecture design.
```

---

## Phase 4: Architecture Design

**Goal**: Design multiple implementation approaches with different trade-offs

**Prerequisite**: Phase 3 complete, all ambiguities resolved

### Actions

1. **Launch 2-3 code-architect subagents in parallel**

   Each with different focus:
   - **Minimal changes**: Smallest change, maximum reuse of existing patterns
   - **Clean architecture**: Maintainability, elegant abstractions
   - **Pragmatic balance**: Speed + quality balance

   **Example prompts**:
   ```
   Agent 1 (Minimal Changes):
   "Design the implementation for [feature] focusing on minimal changes and maximum
   reuse of existing patterns. Use existing abstractions, libraries, and architectural
   approaches already in the codebase. What existing components can be extended?
   Prioritize fitting into the current architecture seamlessly."

   Agent 2 (Clean Architecture):
   "Design a clean, maintainable architecture for [feature]. Prioritize elegant abstractions,
   clear separation of concerns, and long-term maintainability. What new components should
   be created? How should they be organized? Design for extensibility and testing."

   Agent 3 (Pragmatic):
   "Design a pragmatic implementation of [feature] balancing implementation speed with
   code quality. Consider time constraints, team expertise, and project stage.
   Make decisive choices that get the feature done well without over-engineering."
   ```

2. **Review all approaches and form your opinion**

   - Which fits best for this specific task?
   - Consider: small fix vs large feature, urgency, complexity, team context
   - Which approach aligns with existing codebase philosophy?

3. **Present to user**

   Structure:
   - Brief summary of each approach (1-2 sentences)
   - Trade-offs comparison table
   - **Your recommendation with reasoning** (be specific about why)
   - Concrete implementation differences (what files would differ between approaches)

4. **Ask user which approach they prefer**
   - Wait for decision before proceeding
   - If user is indifferent, confirm your recommendation

### Example

```
I've designed 3 architectural approaches:

**Approach 1: Minimal Changes**
- Add rate limiting to existing middleware layer
- Reuse existing request/response interceptor pattern
- Store limits in existing cache (Redis)
- Pros: Quick implementation, fits current patterns
- Cons: Limited flexibility for future rate-limit variations

**Approach 2: Clean Architecture**
- Create dedicated RateLimiter service with strategy pattern
- Support multiple rate limit algorithms (sliding window, token bucket)
- Extensible configuration system
- Pros: Flexible, maintainable, testable
- Cons: More code, some over-engineering for current needs

**Approach 3: Pragmatic Balance**
- Create RateLimiter middleware class (option 1 + 2 middle ground)
- Support per-user and per-IP limits (main use cases)
- Use existing cache, but with clear interface
- Pros: Good balance of simplicity and flexibility
- Cons: Less extensible than Approach 2

**My recommendation: Approach 3**
Reasoning: Your project emphasizes pragmatism. The feature has clear requirements
(per-user/IP rate limiting). Approach 3 gives you flexibility without over-engineering.

Which approach do you prefer?
```

---

## Phase 5: Implementation

**Goal**: Build the feature

**DO NOT START WITHOUT USER APPROVAL**

**Prerequisite**: Phase 4 complete, architectural approach chosen by user

### Actions

1. **Wait for explicit user approval**
   - Confirm they want to proceed with implementation
   - Confirm chosen architectural approach

2. **Read all relevant files identified in previous phases**
   - Use the file lists from Phase 2
   - Ensure you have all context before coding
   - Re-familiarize with patterns and conventions

3. **Implement following chosen architecture**
   - Implement in phases (Phase 5 section has build sequence)
   - Create new files as specified in architecture blueprint
   - Modify existing files following architectural design
   - Integrate with existing systems

4. **Follow codebase conventions strictly**
   - Use same naming conventions (camelCase, snake_case, etc.)
   - Follow code style and formatting
   - Use same patterns for error handling, logging, testing
   - Match file organization structure

5. **Write clean, well-documented code**
   - Self-explanatory variable and function names
   - Comments for non-obvious logic
   - Docstrings/JSDoc for public APIs
   - Include examples for complex code

6. **Update todos as you progress**
   - Mark phase as in-progress
   - Update with specific tasks completed
   - Mark complete when implementation done

---

## Phase 6: Quality Review

**Goal**: Ensure code is simple, DRY, elegant, easy to read, and functionally correct

**Prerequisite**: Phase 5 complete, feature implemented

### Actions

1. **Launch 3 code-reviewer subagents in parallel**

   Each with different focus:
   - **Simplicity/DRY/Elegance**: Code duplication, readability, elegant patterns
   - **Bugs/Correctness**: Logic errors, null handling, edge cases, security
   - **Conventions/Abstractions**: Project guidelines adherence, naming, patterns

   **Example prompts**:
   ```
   Agent 1 (Quality):
   "Review the new code for:
   - Code duplication and DRY principle violations
   - Readability and naming clarity
   - Elegant implementation vs over-complex code
   - Unnecessary complexity or over-engineering
   Focus only on actual quality issues, not nitpicks."

   Agent 2 (Correctness):
   "Review for bugs and functional correctness:
   - Logic errors and edge cases
   - Null/undefined handling
   - Race conditions or concurrency issues
   - Security vulnerabilities
   - Performance problems
   Be specific about exact scenarios where bugs would occur."

   Agent 3 (Conventions):
   "Review for adherence to project conventions:
   - Naming conventions (variables, functions, classes)
   - Code style and formatting
   - Architecture pattern consistency
   - Project guideline violations
   - Integration with existing abstractions
   Focus on project-specific standards, not generic style."
   ```

2. **Consolidate findings and identify highest severity issues**
   - List all issues found across all reviews
   - Estimate severity and impact
   - Prioritize critical vs important vs nice-to-have
   - Focus on issues that matter

3. **Present findings to user and ask what they want to do**
   - Summary of issues found (or confirmation if no issues)
   - For each issue: file, line number, description, fix suggestion
   - Ask: Fix now? Fix later? Proceed as-is?

4. **Address issues based on user decision**
   - If fixing now: implement fixes, can run Phase 6 again
   - If fixing later: document for follow-up
   - If proceeding: move to Phase 7

---

## Phase 7: Summary

**Goal**: Document what was accomplished

**Prerequisite**: Phase 6 complete, code quality approved

### Actions

1. **Mark all todos complete**
   - Update todo list for Phase 7
   - Mark overall workflow complete

2. **Summarize accomplishments**

   Provide:
   - **What was built**: Brief feature description
   - **Key decisions made**: Major architectural/technical choices
   - **Files modified**: List of created/modified files
   - **Testing approach**: How to test the new feature
   - **Suggested next steps**: Follow-up work or improvements

3. **Document for future reference**
   - Note any areas that need monitoring
   - Flag any technical debt introduced
   - Suggest documentation updates needed
   - Recommend code review process

### Example

```
## Feature Development Complete

**What Was Built:**
Rate limiting middleware for API endpoints. Supports per-user and per-IP limiting
with configurable time windows.

**Key Decisions:**
- Implemented as middleware in existing request interceptor layer
- Used Redis for distributed rate limit state
- Token bucket algorithm for fairness

**Files Created/Modified:**
- Created: src/middleware/rateLimit.ts
- Modified: src/middleware/index.ts (registration)
- Modified: config/rateLimit.config.ts (add configuration)

**Testing:**
Run: npm test -- src/middleware/rateLimit.test.ts
Manual test: Test with multiple concurrent requests

**Next Steps:**
- Add monitoring/metrics for rate limit triggers
- Create admin dashboard for rate limit tuning
- Document rate limits in API docs
```

---

## Tips for Each Phase

### Phase 1
- Keep initial scope clear and bounded
- If unclear, ask instead of assuming
- Get explicit agreement on scope

### Phase 2
- Read the files agents return - don't skip this
- Take detailed notes on patterns
- Build real understanding, not just scanning

### Phase 3
- Be thorough - this prevents rework
- Ask about edge cases and unusual scenarios
- Get explicit answers, not "it depends"

### Phase 4
- Evaluate trade-offs fairly
- Make a clear recommendation with reasoning
- Don't present options as equal if they're not

### Phase 5
- Follow conventions strictly
- Write code others can maintain
- Test as you go

### Phase 6
- Focus on real issues, not nitpicks
- Be specific with suggestions
- Consider user's time when prioritizing fixes

### Phase 7
- Document decisions for future maintainers
- Flag any concerns or follow-up work
- Be concrete about next steps

