# ThreatLens AI

ThreatLens AI is a web application designed to help users safely audit URLs, domains, and IP addresses for security threats. It was developed as a team project submission for the ATH Hackathon 0.1.

## Deployed Application
The live application is hosted at: https://threat-lens-ai-zeta.vercel.app

## Project Creators
This project was built by:
* Jeetendra Dhangar
* Rajkumar
* Vishal Baghel

## Use and Purpose
ThreatLens AI helps protect users from malicious web threats by analyzing URLs, domains, and IP addresses before they are visited. It provides:
* Heuristic Analysis: Performs static rule audits on URLs to identify common phishing patterns, brand impersonation, and suspicious structures.
* SSRF Protection: Safely resolves destination IP addresses and blocks private/local network ranges to prevent Server-Side Request Forgery attacks.
* Reputation Lookups: Integrates external threat database APIs to check real-time reputation scores and threat history.
* Safe Logging and Audits: Logs search results for security analysis and allows users to submit helpfulness ratings or feedback on audit reports.

## Tech Stack

### Frontend Portal
* React (v18)
* Vite
* Tailwind CSS (v3)
* Axios
* Recharts
* React Router DOM (v6)

### Backend Service
* Python (v3.11+)
* Django (v5.0+)
* Django REST Framework (DRF)
* SQLite
