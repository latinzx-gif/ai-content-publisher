# README: Signals Data

## Purpose
This directory acts as the **raw inbox** for the entire DataClaw OS. A "signal" is any piece of unstructured or semi-structured information that has been discovered by the `Scout Agent` but has not yet been processed, validated, or turned into a structured `Fact`.

This layer is critical for capturing a high volume of information quickly. It is intentionally messy and ephemeral. The primary goal is to log information with its source and timestamp, creating a queue for the `Librarian` and `Analyst` agents to process.
