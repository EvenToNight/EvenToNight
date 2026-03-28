# 6 - Validation

The system has been validated through a combination of automated testing and API-level verification with the objective of verifying both the internal correctness of services and the proper behavior of exposed interfaces.

Two main testing approaches have been adopted: unit and integration testing of service logic and API-level testing through interactive documentation.

## 6.1 - Automated Testing and Coverage

Each service has been tested through automated tests designed to cover:

- domain logic and service-layer behavior
- validation rules and edge cases

Integration test of data persistence operations have been done using MongoDB in memory implementation or by a mongo container automatically started (and  torn down lately) during gradle test execution.

To assess the effectiveness of the test suite, code coverage has been measured. The project achieves an overall coverage of at least 70%, ensuring that the majority of the codebase is exercised during testing.

This level of coverage provides reasonable confidence in the correctness of the implemented logic.

## 6.2 - API Testing

In addition to automated tests, the system has been validated through direct interaction with the exposed APIs.

Each service provides a formal API specification compliant with the OpenAPI standard, which allows endpoints to be explored and tested interactively. This interface has been used to manually verify the correctness of request handling, response formats and error management.

API testing has been particularly useful for:
- validating request/response workflows.
- testing edge cases and invalid inputs.
- verifying correctness of response formats.

The full set of APIs is available and can be consulted at the following link: [**OpenAPI specs** (REST)](https://eventonight.github.io/EvenToNight/openAPI/).

Moreover API have been tested in integration with the frontend ensuring correct implementation and usage.
