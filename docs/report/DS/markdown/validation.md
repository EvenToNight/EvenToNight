# 6 - Validation

The system has been validated through a combination of automated testing and API-level verification with the objective to verifying both the internal correctness of services and the proper behavior of exposed interfaces.

Two main testing approaches have been adopted: unit and integration testing of service logic, and API-level testing through interactive documentation.

## 6.1 - Automated Testing and Coverage

Each service has been tested through automated test cases targeting its core business logic. 

Tests have been designed to cover:
- domain logic and service-layer behavior
- data persistence operations
- validation rules and edge cases

To assess the effectiveness of the test suite, code coverage has been measured. The project achieves an overall coverage of at least 70%, ensuring that the majority of the codebase is exercised during testing.

This level of coverage provides reasonable confidence in the correctness of the implemented logic while still allowing flexibility for future extensions

## 6.2 - API Testing

In addition to automated tests, the system has been validated through direct interaction with the exposed APIs.

Each service provides a formal API specification compliant with the OpenAPI standard, which allows endpoints to be explored and tested interactively. This interface has been used to manually verify the correctness of request handling, response formats, and error management.

API testing has been particularly useful for:
- validating request/response workflows.
- verifying correct integration between frontend and backend.
- testing edge cases and invalid inputs.
- verifying correctness of response formats.

The full set of APIs is available and can be consulted at the following link: [EvenToNight - API](https://eventonight.github.io/EvenToNight/openAPI/).
