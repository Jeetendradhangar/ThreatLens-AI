# Security Policy

## Hackathon / Educational Project
ThreatLens AI is developed as a hackathon submission and an educational showcase. It provides automated heuristic audits and queries external reputation lookup platforms. 

## Best Practices
*   **Do Not Submit Real Malicious URLs**: Please do not scan active, weaponized malware download URLs or credential harvesting landing pages unless you are running in a isolated sandbox container.
*   **Use Controlled Demo Targets**: For evaluation, testing, or showcasing the features, use the safe test domains provided (e.g., `google.com`, `github.com`, or local mock `.test` paths like `account-security-update-now.test`).
*   **Do Not Open Flagged URLs Directly**: If a scan flags a URL as **Suspicious** or **Dangerous**, do not navigate to the website in your browser outside of a secured environment.
*   **Security Concerns**: If you find any vulnerability (e.g. bypasses, SSRF, injection vectors) in the project codebase, please report it privately to the development team instead of creating a public issue.
