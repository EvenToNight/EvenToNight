# **5 - Conclusion**

We are satisfied with the engineering process we designed and applied to the EvenToNight platform. The project gave us the chance to put into practice process-engineering and Domain-Driven Design concepts that we had previously studied only in theory.

### **What we learned**

- **Build automation across stacks.**
A single Gradle multi-project orchestrates build, test and quality checks for both Scala and Node.js services with one invocation, keeping the pipeline indifferent to the internal structure of each service.
- **Continuous Integration / Continuous Delivery.**
Dedicated pipelines take care of integration and deployment, automating the path from a code change to a running deployed release, while making us proficient with the more advanced features of Git and GitHub.
- **Documentation and tooling.**
Reports and API specs are built and deployed automatically alongside the code.
- **Domain Driven Design.**
We applied Event Storming to analyze the domain and align on a shared ubiquitous language, which then guided the modeling of our system as a microservice architecture.


