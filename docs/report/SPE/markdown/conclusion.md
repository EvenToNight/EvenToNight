# **5 - Conclusion**

We are satisfied with the engineering process designed and applied to the EvenToNight platform. The main achievements are:

- **Achievement of project goals.**
All process goals were reached: the development cycle is fully automated from commit to production deployment, and the DDD-driven decomposition produced a codebase that mirrors the business language.
- **Build automation across stacks.**
A single Gradle multi-project orchestrates build, test and quality checks for both Scala and Node.js services with one invocation, keeping the pipeline indifferent to the internal structure of each service.
- **Continuous Integration / Continuous Delivery.**
Every commit on `main` triggers automated build, test, linting and convention checks; semantic-release derives the version from Conventional Commits and produces a fully reproducible release without human intervention.
- **Documentation and tooling as part of the product.**
Reports and API specs are built and deployed automatically alongside the code; the custom `auto-i18n` GitHub Action keeps translation files in sync with no manual editing.

### **What we learned**

This project allowed us to apply process-engineering and Domain-Driven Design concepts that we had previously studied only from a theoretical perspective. In particular:

- We experienced the value of **Event Storming** as a discovery technique that aligns the team on the domain language before any code is written, and the discipline of preserving the ubiquitous language across the entire codebase.
- We learned that **bounded contexts are not a coding pattern but an architectural commitment**: the cost of replicated concepts and Anti-Corruption Layers is the price paid for service autonomy.
- We gained practical familiarity with **Conventional Commits**, **Semantic Versioning** and the resulting automated release flow, discovering that the smallest decisions on commit messages drive the entire CI/CD chain.
- We understood that **DevOps is a discipline of process**, not a collection of tools: every automation introduced is judged on whether it lowers the cost of doing the right thing.
- We made our first real online deployment using a proprietary domain and a self-hosted server, learning the trade-offs between fully managed and self-managed infrastructure.
